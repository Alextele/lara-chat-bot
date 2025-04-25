<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ApiLlmVectorService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ApiLlmVectorService::class, function ($app) {
            return new ApiLlmVectorService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
