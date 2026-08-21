<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'products.view', 'description' => 'Voir la liste des produits'],
            ['name' => 'products.manage', 'description' => 'CRUD complet des produits'],
            ['name' => 'products.stock.manage', 'description' => 'Gérer le stock'],
            ['name' => 'orders.place', 'description' => 'Passer une commande'],
            ['name' => 'orders.view_own', 'description' => 'Voir ses propres commandes'],
            ['name' => 'orders.view_all', 'description' => 'Voir toutes les commandes'],
            ['name' => 'orders.manage', 'description' => 'Confirmer, expédier, annuler les commandes'],
            ['name' => 'orders.status.update', 'description' => 'Changer le statut des commandes'],
            ['name' => 'users.view', 'description' => 'Voir la liste des utilisateurs'],
            ['name' => 'users.manage', 'description' => 'CRUD complet des utilisateurs'],
            ['name' => 'categories.manage', 'description' => 'CRUD complet des catégories'],
            ['name' => 'brands.manage', 'description' => 'CRUD complet des marques'],
            ['name' => 'reviews.create', 'description' => 'Poster un avis'],
            ['name' => 'reviews.moderate', 'description' => 'Approuver/modérer les avis'],
            ['name' => 'pages.manage', 'description' => 'Gérer les pages CMS'],
            ['name' => 'coupons.manage', 'description' => 'Gérer les codes promo'],
            ['name' => 'dashboard.view', 'description' => 'Voir le tableau de bord admin'],
            ['name' => 'wishlist.manage', 'description' => 'Gérer ses favoris'],
            ['name' => 'addresses.manage', 'description' => 'Gérer ses adresses'],
            ['name' => 'profile.edit', 'description' => 'Modifier son profil'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }
}
