<?php

/**
 * @var $phrases
 */

$keyboard1 = [
    'keyboard' => [
        [
            [
                'text' => $phrases['btn_subscribe'],
                'web_app' => [
                    'url' => WEB_APP1
                ],
            ]
        ]
    ],
    'resize_keyboard' => true,
    'input_field_placeholder' => $phrases['select_btn'],
];

$inline_keyboard1 = [
    'inline_keyboard' => [
        [
            [
                'text' => $phrases['inline_btn'],
                'web_app' => [
                    'url' => WEB_APP2
                ],
            ]
        ]
    ],
];