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
        $history = session('chat_history', []);


        $question = $request->input('message');
        $answer = ApiLlmVectorService::getAnswer($question, $history);
        if ($answer) {

            $history[] = [
              'user_question' => $question,
              'assistant_answer' => $answer
            ];

            if (count($history) > 5) {
                $history = array_slice($history, -5);
            }

            // Сохраняем обновлённую историю в сессию
            session(['chat_history' => $history]);

            return response()->json(['reply' => $answer]);
        } else {
            return response()->json(['reply' => 'Простите, произошла какая-то лажа на сервере :)']);
        }
    }

}
