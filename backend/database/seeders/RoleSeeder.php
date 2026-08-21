<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Role::updateOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrateur complet']
        );

        $admin->permissions()->sync(Permission::pluck('id'));

        $customer = Role::updateOrCreate(
            ['name' => 'customer'],
            ['description' => 'Client connecté']
        );

        $customerPermissions = [
            'orders.place',
            'orders.view_own',
            'reviews.create',
            'wishlist.manage',
            'addresses.manage',
            'profile.edit',
        ];

        $permissionIds = Permission::whereIn('name', $customerPermissions)->pluck('id');
        $customer->permissions()->sync($permissionIds);
    }
}
