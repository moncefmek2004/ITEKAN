<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Switch the application locale.
     */
    public function switch(Request $request): RedirectResponse
    {
        $locale = $request->validate([
            'locale' => ['required', 'in:fr,ar'],
        ])['locale'];

        session(['locale' => $locale]);

        app()->setLocale($locale);

        return back();
    }
}
