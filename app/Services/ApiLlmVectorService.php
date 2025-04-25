<?php

namespace App\Services;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ApiLlmVectorService
{
    private static Client $client;
    private static string $apiHost;
    private static string $apiPort;

    public function __construct()
    {
        self::$client = new Client();
        self::$apiHost = env('VECTOR_API_HOST');
        self::$apiPort = env('VECTOR_API_PORT');
    }

    final public function getVector(string $question)
    {
        try {
            $response = self::$client->post(self::$apiHost . ':' . self::$apiPort . '/vector', [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'question' => $question,
                ],
            ]);
            $data = json_decode($response->getBody(), true, 512, JSON_THROW_ON_ERROR);
            return $data['vector'];
        } catch (RequestException $e) {
            return null;
        }
    }

    final public function getAnswer(string $question)
    {
        try {
            // Формируем массив данных для запроса
            $jsonData = [
                'question' => $question,
                'temperature' => 1.0, // Увеличиваем для большей креативности
                'top_k' => 50, // Меньше ограничение на количество вариантов
                'top_p' => 0.95, // Увеличиваем вероятность более разнообразных ответов
                'repeat_penalty' => 1.0, // Убираем штраф за повторения для большей гибкости
                'max_tokens' => 500, // Увеличиваем длину ответа
                'system_prompt' => "Ты — энергичный и креативный автоматический ассистент. Твои ответы должны быть живыми, яркими и не ограничиваться скучными стандартами. Вдохновляй!"
            ];

            $response = self::$client->post(self::$apiHost . ':' . self::$apiPort . '/generate', [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => $jsonData
            ]);
            $data = json_decode($response->getBody(), true, 512, JSON_THROW_ON_ERROR);
//            $text = $this->removeExtra($data['reply']);
            $text = $data['reply'];
            return $text;
        } catch (RequestException $e) {
            return null;
        }
    }

    private function removeExtra($text) {
        $text = str_replace('**', '', $text);
        // Используем регулярное выражение для удаления текста между * *
        $pattern = '/\*.*?\*/s';
        $text = preg_replace($pattern, '', $text);
        return $text;
    }

}
