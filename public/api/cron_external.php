<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

/**
 * cPanel Cron Job entrypoint for refreshing real external Instagram / LinkedIn accounts.
 * Configure in cPanel Cron Jobs:
 * 0 */6 * * * php /home/USER/public_html/pscpp-gram/api/cron_external.php
 */
$accountsData = file_exists(EXTERNAL_ACCOUNTS_FILE)
    ? json_decode((string)file_get_contents(EXTERNAL_ACCOUNTS_FILE), true)
    : ['accounts' => []];

$accounts = $accountsData['accounts'] ?? [];
$synced = 0;

foreach ($accounts as $account) {
    if (empty($account['enabled']) || empty($account['feed_url'])) {
        continue;
    }
    $rawFeed = @file_get_contents((string)$account['feed_url']);
    if ($rawFeed === false) {
        continue;
    }
    $decoded = json_decode($rawFeed, true);
    if (!is_array($decoded)) {
        continue;
    }
    foreach ($decoded as $item) {
        if (is_array($item) && isset($item['id'], $item['caption'])) {
            $item['is_external'] = true;
            $target = EXTERNAL_DIR . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', (string)$item['id']) . '.json';
            file_put_contents($target, json_encode($item, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $synced++;
        }
    }
}

echo json_encode([
    'status' => 'ok',
    'accounts_checked' => count($accounts),
    'posts_synced' => $synced,
    'checked_at' => gmdate('Y-m-d\TH:i:s\Z'),
]);
