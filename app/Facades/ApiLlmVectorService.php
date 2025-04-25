<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;
use App\Services\ApiLlmVectorService as Service;

class ApiLlmVectorService extends Facade
{
    protected static function getFacadeAccessor()
    {
        return Service::class;
    }
}

