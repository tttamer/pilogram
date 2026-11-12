<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$studyPosts = load_json_directory(POSTS_DIR, fn(array $item): bool => isset($item['id']));
$state = load_server_state(count($studyPosts));
$state['needs_generation'] = true;
$state['completed_cycles'] = (int)$state['completed_cycles'] + 1;
$state['last_exhausted_at'] = gmdate('Y-m-d\TH:i:s\Z');
save_server_state($state);

echo json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
