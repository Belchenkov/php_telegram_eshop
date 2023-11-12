<?php

function debug($data, $log = true): void
{
    if ($log) {
        file_put_contents(__DIR__ . '/logs.txt', print_r($data, true), FILE_APPEND);
    } else {
        echo "<pre>" . print_r($data, 1) . "</pre>";
    }
}

function send_request(string $url): mixed
{
    return json_decode(file_get_contents(
        $url,
        false,
        stream_context_create(['http' => ['ignore_errors' => true]])
    ));
}

function check_chat_id(int $chat_id): bool {
    global $pdo;

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM subscribers WHERE chat_id = ?');

    $stmt->execute([$chat_id]);

    return (bool)$stmt->fetchColumn();
}

