<?php
// https://api.telegram.org/bot6594948161:AAFCNZxQym04wZEs9OE7CPQZtr3IXjvI-yU/setWebhook?url=https://pet-projects.sharedwithexpose.com/php/eshop_telegram
error_reporting(-1);
ini_set('display_errors', 0);
ini_set('log_errors', 'on');
ini_set('error_log', __DIR__ . '/errors.log');

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config.php';
$phrases = require_once __DIR__ . '/phrases.php';
require_once __DIR__ . '/keyboards.php';
require_once __DIR__ . '/functions.php';

/**
 * @var $keyboard1
 * @var $keyboard2
 * @var $inline_keyboard1
 */

$telegram = new \Telegram\Bot\Api(TOKEN);
$update = $telegram->getWebhookUpdate();

debug($update);

$chat_id = $update['message']['chat']['id'] ?? 0;
$text = $update['message']['text'] ?? '';
$name = $update['message']['from']['first_name'] ?? 'Guest';

if (isset($update['message']['chat']['id'])) {
    $chat_id = $update['message']['chat']['id'];
} elseif (isset($update['user']['id'])) {
    $chat_id = (int)$update['user']['id'];
    $query_id = $update['query_id'] ?? '';
    $cart = $update['cart'] ?? [];
    $total_sum = $update['total_sum'] ?? 0;
}

if (!$chat_id) {
    die;
}

if ($text === '/start') {
    $keyboard = check_chat_id($chat_id) ? $keyboard2 : $keyboard1;

    $telegram->sendMessage([
        'chat_id' => $chat_id,
        'text' => sprintf($phrases['start'], $name),
        'parse_mode' => 'HTML',
        'reply_markup' => new \Telegram\Bot\Keyboard\Keyboard($keyboard),
    ]);

    $telegram->sendMessage([
        'chat_id' => $chat_id,
        'text' => $phrases['inline_keyboard'],
        'parse_mode' => 'HTML',
        'reply_markup' => new \Telegram\Bot\Keyboard\Keyboard($inline_keyboard1),
    ]);
} elseif ($text === $phrases['btn_unsubscribe']) {
    if (delete_subscriber($chat_id)) {
        $telegram->sendMessage([
            'chat_id' => $chat_id,
            'text' => $phrases['success_unsubscribe'],
            'parse_mode' => 'HTML',
            'reply_markup' => new \Telegram\Bot\Keyboard\Keyboard($keyboard1),
        ]);
    } else {
        $telegram->sendMessage([
            'chat_id' => $chat_id,
            'text' => $phrases['error_unsubscribe'],
            'parse_mode' => 'HTML',
            'reply_markup' => new \Telegram\Bot\Keyboard\Keyboard($keyboard2),
        ]);
    }
} elseif (isset($update['message']['web_app_data'])) {
    $btn = $update['message']['web_app_data']['button_text'];
    $data = json_decode($update['message']['web_app_data']['data'], 1);

    if (!check_chat_id($chat_id) && !empty($data['name']) && !empty($data['email'])) {
        if (add_subscriber($chat_id, $data)) {
            $telegram->sendMessage([
                'chat_id' => $chat_id,
                'text' => $phrases['success_subscribe'],
                'parse_mode' => 'HTML',
                'reply_markup' => new \Telegram\Bot\Keyboard\Keyboard($keyboard2),
            ]);
        } else {
            $telegram->sendMessage([
                'chat_id' => $chat_id,
                'text' => $phrases['error_subscribe'],
                'parse_mode' => 'HTML',
                'reply_markup' => new \Telegram\Bot\Keyboard\Keyboard($keyboard1),
            ]);
        }
    } else {
        $telegram->sendMessage([
            'chat_id' => $chat_id,
            'text' => $phrases['error'],
            'parse_mode' => 'HTML',
            'reply_markup' => new \Telegram\Bot\Keyboard\Keyboard($keyboard1),
        ]);
    }

    $telegram->sendMessage([
        'chat_id' => $chat_id,
        'text' => "Button: {$btn}" . PHP_EOL . "<pre>" . print_r($data, 1) . "</pre>",
        'parse_mode' => 'HTML',
    ]);
} elseif (!empty($query_id)) {
//    send_request('answerWebAppQuery', [
//        'web_app_query_id' => $query_id,
//        'result' => json_encode([
//            'type' => 'article',
//            'id' => $query_id,
//            'title' => 'test query',
//            'input_message_content' => [
//                'message_text' => 'test query!!!',
//            ]
//        ]),
//    ]);

    $telegram->sendMessage([
        'chat_id' => $chat_id,
        'text' => "Sum: {$total_sum}, Cart:" . PHP_EOL . "<pre>" . print_r($cart, 1) . "</pre>",
        'parse_mode' => 'HTML',
    ]);

    echo json_encode(['res' => true, 'answer' => 'OK']);
    die;
} else {
    $telegram->sendMessage([
        'chat_id' => $chat_id,
        'text' => $phrases['error'],
        'parse_mode' => 'HTML',
    ]);
}