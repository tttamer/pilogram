<?php
declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

define('CONTENT_DIR', realpath(__DIR__ . '/../content') ?: (__DIR__ . '/../content'));
define('POSTS_DIR', CONTENT_DIR . '/posts');
define('EXTERNAL_DIR', CONTENT_DIR . '/external');
define('PERSONAS_FILE', CONTENT_DIR . '/personas.json');
define('STATE_FILE', CONTENT_DIR . '/state.json');
define('EXTERNAL_ACCOUNTS_FILE', CONTENT_DIR . '/external_accounts.json');

function read_json_input(): array {
    global $argv;
    if (php_sapi_name() === 'cli' && isset($argv[1])) {
        $decoded = json_decode((string)$argv[1], true);
        return is_array($decoded) ? $decoded : [];
    }
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function load_json_directory(string $dir, callable $validator): array {
    if (!is_dir($dir)) {
        return [];
    }
    $items = [];
    $files = glob($dir . '/*.json') ?: [];
    foreach ($files as $file) {
        $raw = @file_get_contents($file);
        if ($raw === false) {
            continue;
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            continue;
        }
        if ($validator($data)) {
            $items[] = $data;
        }
    }
    return $items;
}

function load_server_state(int $totalStudyPosts = 0): array {
    $default = [
        'needs_generation' => false,
        'completed_cycles' => 0,
        'last_exhausted_at' => null,
        'last_generated_at' => gmdate('Y-m-d\TH:i:s\Z'),
        'total_study_posts' => $totalStudyPosts,
    ];
    if (!file_exists(STATE_FILE)) {
        return $default;
    }
    $raw = @file_get_contents(STATE_FILE);
    $decoded = $raw ? json_decode($raw, true) : null;
    if (!is_array($decoded)) {
        return $default;
    }
    $merged = array_merge($default, $decoded);
    if ($totalStudyPosts > 0) {
        $merged['total_study_posts'] = $totalStudyPosts;
    }
    return $merged;
}

function save_server_state(array $state): void {
    @file_put_contents(
        STATE_FILE,
        json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
    );
}
