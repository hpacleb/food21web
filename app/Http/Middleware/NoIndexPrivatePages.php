<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoIndexPrivatePages
{
    /**
     * @var list<string>
     */
    protected array $publicRoutes = ['home', 'menu', 'about', 'gallery', 'order', 'contact'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->isMethod('GET') && ! $request->routeIs(...$this->publicRoutes)) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }
}
