<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed the application's categories.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Claviers', 'name_ar' => 'لوحات المفاتيح', 'slug' => 'claviers', 'image' => '/images/products/category-keyboard.svg', 'order' => 1],
            ['name' => 'Souris', 'name_ar' => 'الفئران', 'slug' => 'souris', 'image' => '/images/products/category-mouse.svg', 'order' => 2],
            ['name' => 'Casques', 'name_ar' => 'سماعات الرأس', 'slug' => 'casques', 'image' => '/images/products/category-headset.svg', 'order' => 3],
            ['name' => 'Combos', 'name_ar' => 'مجموعات', 'slug' => 'combos', 'image' => '/images/products/category-combo.svg', 'order' => 4],
            ['name' => 'Micro & Webcam', 'name_ar' => 'ميكروفون وكاميرا', 'slug' => 'micro-webcam', 'image' => '/images/products/category-mic-cam.svg', 'order' => 5],
            ['name' => 'Déco Gaming', 'name_ar' => 'ديكور الألعاب', 'slug' => 'deco-gaming', 'image' => '/images/products/category-decor.svg', 'order' => 6],
            ['name' => 'Manettes', 'name_ar' => 'أذرع التحكم', 'slug' => 'manettes', 'image' => '/images/products/category-controller.svg', 'order' => 7],
            ['name' => 'Tapis de souris', 'name_ar' => 'ورقات الماوس', 'slug' => 'tapis-de-souris', 'image' => '/images/products/category-mousepad.svg', 'order' => 8],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
