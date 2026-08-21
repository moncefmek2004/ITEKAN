<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Logitech', 'slug' => 'logitech', 'website' => 'https://www.logitech.com'],
            ['name' => 'Razer', 'slug' => 'razer', 'website' => 'https://www.razer.com'],
            ['name' => 'Corsair', 'slug' => 'corsair', 'website' => 'https://www.corsair.com'],
            ['name' => 'SteelSeries', 'slug' => 'steelseries', 'website' => 'https://www.steelseries.com'],
            ['name' => 'HyperX', 'slug' => 'hyperx', 'website' => 'https://hyperx.com'],
            ['name' => 'ASUS', 'slug' => 'asus', 'website' => 'https://www.asus.com'],
            ['name' => 'MSI', 'slug' => 'msi', 'website' => 'https://www.msi.com'],
            ['name' => 'Lenovo', 'slug' => 'lenovo', 'website' => 'https://www.lenovo.com'],
            ['name' => 'Dell', 'slug' => 'dell', 'website' => 'https://www.dell.com'],
            ['name' => 'HP', 'slug' => 'hp', 'website' => 'https://www.hp.com'],
            ['name' => 'Samsung', 'slug' => 'samsung', 'website' => 'https://www.samsung.com'],
            ['name' => 'Kingston', 'slug' => 'kingston', 'website' => 'https://www.kingston.com'],
            ['name' => 'WD', 'slug' => 'wd', 'website' => 'https://www.wd.com'],
            ['name' => 'Crucial', 'slug' => 'crucial', 'website' => 'https://www.crucial.com'],
            ['name' => 'NZXT', 'slug' => 'nzxt', 'website' => 'https://nzxt.com'],
            ['name' => 'Cooler Master', 'slug' => 'cooler-master', 'website' => 'https://www.coolermaster.com'],
            ['name' => 'DeepCool', 'slug' => 'deepcool', 'website' => 'https://www.deepcool.com'],
            ['name' => 'TP-Link', 'slug' => 'tp-link', 'website' => 'https://www.tp-link.com'],
            ['name' => 'Keychron', 'slug' => 'keychron', 'website' => 'https://www.keychron.com'],
            ['name' => 'Redragon', 'slug' => 'redragon', 'website' => 'https://redragonzone.com'],
        ];

        foreach ($brands as $index => $brand) {
            Brand::updateOrCreate(
                ['slug' => $brand['slug']],
                [...$brand, 'order' => $index + 1]
            );
        }
    }
}
