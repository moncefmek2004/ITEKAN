<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $cartCount = 0;

        if ($user) {
            $cart = $user->cart;
            $cartCount = $cart ? $cart->getItemCount() : 0;
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => app()->getLocale(),
            'translations' => $this->translations(app()->getLocale()),
            'auth' => [
                'user' => $user,
            ],
            'cartCount' => $cartCount,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Load the UI translations for the given locale.
     *
     * @return array<string, string>
     */
    private function translations(string $locale): array
    {
        $file = lang_path($locale.'.json');

        if (! is_file($file)) {
            $file = lang_path('fr.json');
        }

        $content = file_get_contents($file);

        return json_decode($content, true) ?? [];
    }
}
