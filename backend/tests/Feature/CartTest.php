<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Category::create([
            'name' => 'Test Category',
            'name_ar' => 'فئة اختبار',
            'slug' => 'test-category',
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
            'category_id' => Category::where('slug', 'test-category')->first()->id,
            'name' => 'Test Product',
            'name_ar' => 'منتج اختبار',
            'slug' => 'test-product-'.uniqid(),
            'description' => 'A test product',
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
            'name' => 'Default Variant',
            'price' => $product->price,
            'stock_quantity' => 10,
            'is_active' => true,
            'option_values' => [],
            'specs' => [],
            'position' => 0,
        ], $overrides));
    }

    private function getCart(User $user): Cart
    {
        return Cart::where('user_id', $user->id)->firstOrFail()->load('items');
    }

    // ─── Add to Cart ─────────────────────────────────────

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('cart.show'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_empty_cart(): void
    {
        $user = $this->createCustomer();
        $this->actingAs($user);

        $this->get(route('cart.show'))->assertOk();
    }

    public function test_add_simple_product(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct();
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertRedirect();

        $cart = $this->getCart($user);
        $this->assertCount(1, $cart->items);
        $this->assertEquals($product->id, $cart->items->first()->product_id);
        $this->assertEquals(2, $cart->items->first()->quantity);
        $this->assertNull($cart->items->first()->variant_id);
    }

    public function test_add_variant_product(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct();
        $variant = $this->createVariant($product, ['price' => 20000]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 1,
        ])->assertRedirect();

        $cart = $this->getCart($user);
        $this->assertCount(1, $cart->items);
        $this->assertEquals($variant->id, $cart->items->first()->variant_id);
    }

    public function test_add_same_product_increases_quantity(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 10]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $cart = $this->getCart($user);
        $this->assertCount(1, $cart->items);
        $this->assertEquals(5, $cart->items->first()->quantity);
    }

    public function test_add_same_variant_increases_quantity(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 10]);
        $variant = $this->createVariant($product, ['stock_quantity' => 8]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 3,
        ]);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $cart = $this->getCart($user);
        $this->assertCount(1, $cart->items);
        $this->assertEquals(5, $cart->items->first()->quantity);
    }

    public function test_cannot_add_inactive_product(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['is_active' => false]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertSessionHasErrors('product_id');
    }

    public function test_cannot_add_inactive_variant(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct();
        $variant = $this->createVariant($product, ['is_active' => false]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 1,
        ])->assertSessionHasErrors('variant_id');
    }

    public function test_cannot_add_quantity_above_stock(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 3]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 5,
        ])->assertSessionHasErrors('quantity');
    }

    public function test_cannot_add_quantity_above_variant_stock(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 20]);
        $variant = $this->createVariant($product, ['stock_quantity' => 2]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 5,
        ])->assertSessionHasErrors('quantity');
    }

    public function test_cannot_add_quantity_zero(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct();
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 0,
        ])->assertSessionHasErrors('quantity');
    }

    public function test_cannot_add_negative_quantity(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct();
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => -1,
        ])->assertSessionHasErrors('quantity');
    }

    public function test_cannot_add_nonexistent_product(): void
    {
        $user = $this->createCustomer();
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => 99999,
            'quantity' => 1,
        ])->assertSessionHasErrors('product_id');
    }

    public function test_add_to_cart_with_same_product_different_variants(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 20]);
        $v1 = $this->createVariant($product, ['name' => 'Red', 'stock_quantity' => 10]);
        $v2 = $this->createVariant($product, ['name' => 'Blue', 'stock_quantity' => 5]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $v1->id,
            'quantity' => 2,
        ]);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $v2->id,
            'quantity' => 1,
        ]);

        $cart = $this->getCart($user);
        $this->assertCount(2, $cart->items);
    }

    // ─── Update ──────────────────────────────────────────

    public function test_update_cart_item_quantity(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 10]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $item = $this->getCart($user)->items->first();
        $this->patch(route('cart.update', $item->id), ['quantity' => 5]);

        $item->refresh();
        $this->assertEquals(5, $item->quantity);
    }

    public function test_cannot_update_quantity_above_stock(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 3]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $item = $this->getCart($user)->items->first();
        $this->patch(route('cart.update', $item->id), ['quantity' => 10])
            ->assertSessionHasErrors('quantity');

        $item->refresh();
        $this->assertEquals(1, $item->quantity);
    }

    public function test_cannot_update_another_users_cart_item(): void
    {
        $user1 = $this->createCustomer();
        $user2 = $this->createCustomer();
        $product = $this->createProduct();
        $this->actingAs($user1);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $item = $this->getCart($user1)->items->first();
        $this->actingAs($user2);

        $this->patch(route('cart.update', $item->id), ['quantity' => 5])
            ->assertStatus(403);
    }

    // ─── Remove ──────────────────────────────────────────

    public function test_remove_cart_item(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct();
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $item = $this->getCart($user)->items->first();
        $this->delete(route('cart.destroy', $item->id))->assertRedirect();

        $this->assertDatabaseMissing('cart_items', ['id' => $item->id]);
    }

    public function test_cannot_remove_another_users_cart_item(): void
    {
        $user1 = $this->createCustomer();
        $user2 = $this->createCustomer();
        $product = $this->createProduct();
        $this->actingAs($user1);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $item = $this->getCart($user1)->items->first();
        $this->actingAs($user2);

        $this->delete(route('cart.destroy', $item->id))->assertStatus(403);
        $this->assertDatabaseHas('cart_items', ['id' => $item->id]);
    }

    // ─── Clear ───────────────────────────────────────────

    public function test_clear_cart(): void
    {
        $user = $this->createCustomer();
        $p1 = $this->createProduct(['slug' => 'clear-1']);
        $p2 = $this->createProduct(['slug' => 'clear-2']);
        $this->actingAs($user);

        $this->post(route('cart.store'), ['product_id' => $p1->id, 'quantity' => 1]);
        $this->post(route('cart.store'), ['product_id' => $p2->id, 'quantity' => 2]);

        $this->assertDatabaseCount('cart_items', 2);

        $this->delete(route('cart.clear'))->assertRedirect();

        $this->assertDatabaseCount('cart_items', 0);
    }

    // ─── Totals ──────────────────────────────────────────

    public function test_cart_total_with_simple_product(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 15000]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $cart = $this->getCart($user);
        $this->assertEquals(45000, $cart->getTotal());
        $this->assertEquals(3, $cart->getItemCount());
    }

    public function test_cart_total_with_variant_pricing(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['price' => 15000]);
        $variant = $this->createVariant($product, ['price' => 20000, 'stock_quantity' => 10]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $cart = $this->getCart($user);
        $this->assertEquals(40000, $cart->getTotal());
        $this->assertEquals(2, $cart->getItemCount());
    }

    public function test_cart_total_with_multiple_items(): void
    {
        $user = $this->createCustomer();
        $p1 = $this->createProduct(['slug' => 'multi-1', 'price' => 10000]);
        $p2 = $this->createProduct(['slug' => 'multi-2', 'price' => 25000]);
        $this->actingAs($user);

        $this->post(route('cart.store'), ['product_id' => $p1->id, 'quantity' => 2]);
        $this->post(route('cart.store'), ['product_id' => $p2->id, 'quantity' => 1]);

        $cart = $this->getCart($user);
        $this->assertEquals(45000, $cart->getTotal());
        $this->assertEquals(3, $cart->getItemCount());
    }

    // ─── Stock ───────────────────────────────────────────

    public function test_out_of_stock_product_cannot_be_added(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 0]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertSessionHasErrors('quantity');
    }

    public function test_out_of_stock_variant_cannot_be_added(): void
    {
        $user = $this->createCustomer();
        $product = $this->createProduct(['stock_quantity' => 20]);
        $variant = $this->createVariant($product, ['stock_quantity' => 0]);
        $this->actingAs($user);

        $this->post(route('cart.store'), [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 1,
        ])->assertSessionHasErrors('quantity');
    }

    // ─── User isolation ──────────────────────────────────

    public function test_users_have_separate_carts(): void
    {
        $user1 = $this->createCustomer();
        $user2 = $this->createCustomer();
        $p1 = $this->createProduct(['slug' => 'iso-1']);
        $p2 = $this->createProduct(['slug' => 'iso-2']);

        $this->actingAs($user1);
        $this->post(route('cart.store'), ['product_id' => $p1->id, 'quantity' => 1]);

        $this->actingAs($user2);
        $this->post(route('cart.store'), ['product_id' => $p2->id, 'quantity' => 3]);

        $this->actingAs($user1);
        $this->get(route('cart.show'))->assertOk();

        $this->assertEquals(1, $this->getCart($user1)->getItemCount());
        $this->assertEquals(3, $this->getCart($user2)->getItemCount());
    }
}
