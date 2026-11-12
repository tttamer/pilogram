<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$input = read_json_input();
$studyPosts = load_json_directory(POSTS_DIR, fn(array $item): bool => isset($item['id']));
$state = load_server_state(count($studyPosts));

if (($input['action'] ?? '') === 'ack_generated') {
    $state['needs_generation'] = false;
    $state['last_generated_at'] = gmdate('Y-m-d\TH:i:s\Z');
    $state['total_study_posts'] = count($studyPosts);
    save_server_state($state);
}

echo json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
