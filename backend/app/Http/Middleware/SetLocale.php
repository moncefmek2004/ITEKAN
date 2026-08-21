<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Resolve the locale from the session and apply it to the request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('locale', config('app.locale', 'fr'));

        if (! in_array($locale, ['fr', 'ar'])) {
            $locale = 'fr';
        }

        App::setLocale($locale);

        return $next($request);
    }
}
