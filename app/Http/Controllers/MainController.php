<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Facades\ApiLlmVectorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use JsonException;

/**
 * Class MainController
 *
 * Controller responsible for handling the main application route.
 */
class MainController extends Controller
{
    /**
     * Handles chat messages and returns a response.
     *
     * @param Request $request The HTTP request containing the user's message.
     * @return JsonResponse The response from either FAQ or YandexGPT.
     * @throws JsonException
     */
    final public function chat(Request $request): JsonResponse
    {
        $question = $request->input('message');
        $answer = ApiLlmVectorService::getAnswer($question);
        if ($answer) {
            return response()->json(['reply' => $answer]);
        } else {
            return response()->json(['reply' => 'Простите, произошла какая-то лажа на сервере :)']);
        }

    }
}
