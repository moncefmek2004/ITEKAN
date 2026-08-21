<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('products');

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('name_ar');
            $table->string('slug')->unique();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();

            $table->decimal('price', 12, 2);
            $table->decimal('compare_price', 12, 2)->nullable();
            $table->decimal('cost_price', 12, 2)->nullable();

            $table->string('sku', 100)->nullable()->unique();
            $table->string('barcode', 100)->nullable();
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->unsignedInteger('low_stock_threshold')->default(5);
            $table->boolean('track_inventory')->default(true);

            $table->decimal('weight', 8, 2)->nullable();
            $table->jsonb('dimensions')->nullable();

            $table->jsonb('specs')->default('{}');

            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index('category_id');
            $table->index('brand_id');
            $table->index(['is_active', 'is_featured']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX products_specs_idx ON products USING gin (specs)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
