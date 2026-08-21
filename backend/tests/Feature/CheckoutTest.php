<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Wilaya;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Wilaya::create(['code' => '16', 'name' => 'Alger']);
        Wilaya::create(['code' => '31', 'name' => 'Oran']);

        Category::create([
            'name' => 'Claviers',
            'name_ar' => 'لوحة مفاتيح',
            'slug' => 'claviers',
            'order' => 1,
            'is_active' => true,
        ]);
    }

    private function createCustomer(): User
    {
        return User::factory()->create();
    }

    private function createProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'category_id' => Category::where('slug', 'claviers')->first()->id,
            'name' => 'Test Keyboard',
            'name_ar' => 'لوحة اختبار',
            'slug' => 'test-keyboard-'.uniqid(),
            'description' => 'A test keyboard',
            'price' => 15000,
            'stock_quantity' => 20,
            'track_inventory' => true,
            'is_active' => true,
            'specs' => [],
        ], $overrides));
    }

    private function createVariant(Product $product, array $overrides = []): ProductVariant
    {
        return ProductVariant::create(array_merge([
            'product_id' => $product->id,
            'name' => 'Default',
            'price' => $product->price,
            'stock_quantity' => 10,
            'is_active' => true,
            'option_values' => [],
            'specs' => [],
            'position' => 0,
        ], $overrides));
    }

    private function createAddress(User $user, array $overrides = []): Address
    {
        return $user->addresses()->create(array_merge([
            'full_name' => 'Test User',
            'phone' => '0555000000',
            'line1' => '123 Rue Principale',
            'wilaya_code' => '16',
            'city' => 'Alger',
        ], $overrides));
    }

    private function addToCart(User $user, Product $product, int $quantity = 1, ?ProductVariant $variant = null): CartItem
    {
        $cart = $user->getOrCreateCart();

        return $cart->items()->create([
            'product_id' => $product->id,
            'variant_id' => $variant?->id,
            'quantity' => $quantity,
        ]);
    }

    // ─── Guest Access ────────────────────────────────────

    public function test_guest_cannot_access_checkout(): void
    {
        $this->get(route('checkout.show'))->assertRedirect(route('login'));
    }

    public function test_guest_cannot_post_checkout(): void
    {
        $this->post(route('checkout.store'))->assertRedirect(route('login'));
    }

    public function test_guest_cannot_view_order(): void
    {
        $this->get(route('order.show', 1))->assertRedirect(route('login'));
    }

    // ─── Checkout Show ───────────────────────────────────

    public function test_checkout_page_renders_with_cart_items(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct();
        $this->addToCart($user, $product);
        $this->actingAs($user);

        $response = $this->get(route('checkout.show'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('store/checkout'));
    }

    public function test_checkout_redirects_to_cart_when_empty(): void
    {
        $user = $this->createCustomer();
        $this->actingAs($user);

        $this->get(route('checkout.show'))->assertRedirect(route('cart.show'));
    }

    // ─── Address: Existing ───────────────────────────────

    public function test_successful_checkout_with_existing_address(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 2);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);
    }

    // ─── Address: New ────────────────────────────────────

    public function test_successful_checkout_with_new_address(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $this->addToCart($user, $product, 1);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'full_name' => 'New User',
            'phone' => '0555111111',
            'line1' => '456 Nouvelle Rue',
            'wilaya_code' => '31',
            'city' => 'Oran',
            'payment_method' => 'cod',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('addresses', [
            'user_id' => $user->id,
            'full_name' => 'New User',
            'wilaya_code' => '31',
        ]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'payment_method' => 'cod',
        ]);
    }

    // ─── Address: Another User's Address Rejected ────────

    public function test_cannot_use_another_users_address(): void
    {
        $user1 = $this->createCustomer();
        $user2 = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user2);
        $this->addToCart($user1, $product);
        $this->actingAs($user1);

        $response = $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors('address_id');
        $this->assertDatabaseCount('orders', 0);
    }

    // ─── Address: Invalid ────────────────────────────────

    public function test_cannot_use_nonexistent_address(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $this->addToCart($user, $product);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'address_id' => 99999,
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors('address_id');
    }

    // ─── Checkout: Empty Cart ────────────────────────────

    public function test_cannot_checkout_with_empty_cart(): void
    {
        $user = $this->createCustomer();
        $address = $this->createAddress($user);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors('cart');
    }

    // ─── Checkout: Inactive Product ──────────────────────

    public function test_cannot_checkout_with_inactive_product(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['is_active' => false]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors('product');
    }

    // ─── Checkout: Inactive Variant ──────────────────────

    public function test_cannot_checkout_with_inactive_variant(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $variant = $this->createVariant($product, ['is_active' => false]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 1, $variant);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors('variant');
    }

    // ─── Checkout: Insufficient Stock ────────────────────

    public function test_cannot_checkout_with_insufficient_stock(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 2]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 5);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors('stock');
    }

    // ─── Checkout: Invalid Payment Method ────────────────

    public function test_cannot_checkout_with_invalid_payment_method(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'stripe',
        ]);

        $response->assertSessionHasErrors('payment_method');
    }

    // ─── Checkout: Missing Address ───────────────────────

    public function test_cannot_checkout_without_address(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $this->addToCart($user, $product);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors([
            'full_name',
            'phone',
            'line1',
            'wilaya_code',
            'city',
        ]);
    }

    // ─── Order Creation ──────────────────────────────────

    public function test_order_created_with_correct_fields(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 10]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 3);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $order = Order::where('user_id', $user->id)->first();

        $this->assertNotNull($order);
        $this->assertEquals($user->id, $order->user_id);
        $this->assertEquals($address->id, $order->address_id);
        $this->assertMatchesRegularExpression('/^ITK-\d{8}-\d{4}$/', $order->order_number);
        $this->assertEquals('cod', $order->payment_method);
        $this->assertEquals('DZD', $order->currency);
        $this->assertEquals(30000, $order->subtotal);
        $this->assertEquals(600, $order->shipping);
        $this->assertEquals(30600, $order->total);
        $this->assertEquals('confirmed', $order->order_status);
        $this->assertNotNull($order->placed_at);
        $this->assertNotNull($order->confirmed_at);
    }

    // ─── Order Items ─────────────────────────────────────

    public function test_order_items_created_with_correct_data(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['name' => 'Gaming Mouse', 'price' => 8000, 'sku' => 'GM-001', 'stock_quantity' => 10]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 2);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $items = $order->items;

        $this->assertCount(1, $items);

        $item = $items->first();
        $this->assertEquals($product->id, $item->product_id);
        $this->assertEquals('Gaming Mouse', $item->name);
        $this->assertEquals('GM-001', $item->sku);
        $this->assertEquals(8000, $item->price);
        $this->assertEquals(2, $item->quantity);
        $this->assertEquals(16000, $item->total);
    }

    public function test_order_items_snapshot_variant_price(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 20]);
        $variant = $this->createVariant($product, ['name' => 'Red', 'price' => 12000, 'sku' => 'GM-R', 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 1, $variant);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $item = $order->items->first();

        $this->assertEquals($variant->id, $item->variant_id);
        $this->assertEquals(12000, $item->price);
        $this->assertEquals('GM-R', $item->sku);
        $this->assertEquals(12000, $item->total);
    }

    // ─── Payment ─────────────────────────────────────────

    public function test_payment_record_created(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 15000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 2);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $payment = $order->payments->first();

        $this->assertNotNull($payment);
        $this->assertEquals('cod', $payment->method);
        $this->assertEquals('pending', $payment->status);
        $this->assertEquals(30600, $payment->amount);
        $this->assertNull($payment->paid_at);
    }

    // ─── Cart Cleared After Checkout ─────────────────────

    public function test_cart_is_cleared_after_successful_checkout(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 2);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $cart = $user->fresh()->cart;
        $this->assertNotNull($cart);
        $this->assertEquals(0, $cart->items()->count());
    }

    // ─── Cart Preserved After Failed Checkout ────────────

    public function test_cart_preserved_after_failed_checkout(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['is_active' => false, 'price' => 10000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 2);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $cart = $user->fresh()->cart;
        $this->assertNotNull($cart);
        $this->assertEquals(1, $cart->items()->count());
    }

    // ─── Server-Side Price Validation ────────────────────

    public function test_order_uses_server_side_prices(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 20000, 'stock_quantity' => 10]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 1);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $this->assertEquals(20000, $order->subtotal);
        $this->assertEquals(20600, $order->total);
    }

    // ─── Multiple Products ───────────────────────────────

    public function test_checkout_with_multiple_products(): void
    {
        $user = $this->createCustomer();
        $p1 = $this->createProduct(['slug' => 'multi-co-1', 'price' => 10000, 'stock_quantity' => 10]);
        $p2 = $this->createProduct(['slug' => 'multi-co-2', 'price' => 20000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $p1, 2);
        $this->addToCart($user, $p2, 1);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $this->assertEquals(2, $order->items()->count());
        $this->assertEquals(40000, $order->subtotal);
        $this->assertEquals(40600, $order->total);
    }

    // ─── Stock Decremented After Confirm ─────────────────

    public function test_stock_decremented_after_order_confirmation(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 10]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 3);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $product->refresh();
        $this->assertEquals(7, $product->stock_quantity);
    }

    public function test_variant_stock_decremented_after_order_confirmation(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 20]);
        $variant = $this->createVariant($product, ['price' => 15000, 'stock_quantity' => 8]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 3, $variant);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $variant->refresh();
        $this->assertEquals(5, $variant->stock_quantity);
    }

    // ─── Order Confirmation Page ─────────────────────────

    public function test_order_confirmation_page_renders(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 1);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $response = $this->get(route('order.show', $order->id));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('store/order-confirmation'));
    }

    // ─── Security: User Isolation ────────────────────────

    public function test_user_cannot_view_another_users_order(): void
    {
        $user1 = $this->createCustomer();
        $user2 = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user1);
        $this->addToCart($user1, $product);
        $this->actingAs($user1);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $order = Order::where('user_id', $user1->id)->first();
        $this->actingAs($user2);

        $this->get(route('order.show', $order->id))->assertStatus(403);
    }

    // ─── Invalid Address Fields ──────────────────────────

    public function test_new_address_requires_fields(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $this->addToCart($user, $product);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'full_name' => '',
            'phone' => '',
            'line1' => '',
            'wilaya_code' => 'XX',
            'city' => '',
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors(['full_name', 'phone', 'line1', 'wilaya_code', 'city']);
    }

    public function test_invalid_wilaya_code_rejected(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 5]);
        $this->addToCart($user, $product);
        $this->actingAs($user);

        $response = $this->post(route('checkout.store'), [
            'full_name' => 'Test',
            'phone' => '0555000000',
            'line1' => '123 Rue',
            'wilaya_code' => '99',
            'city' => 'Testville',
            'payment_method' => 'cod',
        ]);

        $response->assertSessionHasErrors('wilaya_code');
    }

    // ─── No Order Created on Failure ─────────────────────

    public function test_no_order_created_when_stock_insufficient(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 10000, 'stock_quantity' => 1]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 5);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_no_order_created_when_product_inactive(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['is_active' => false, 'price' => 10000, 'stock_quantity' => 5]);
        $address = $this->createAddress($user);
        $this->addToCart($user, $product, 1);
        $this->actingAs($user);

        $this->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ]);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertDatabaseCount('payments', 0);
    }
}
