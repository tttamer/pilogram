<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$input = read_json_input();
$seed = isset($input['seed']) ? (int)$input['seed'] : 20261111;
$sectionFilter = isset($input['section_filter']) ? (string)$input['section_filter'] : 'all';
$seenIds = isset($input['seen_ids']) && is_array($input['seen_ids']) ? array_map('strval', $input['seen_ids']) : [];
$bookmarkedIds = isset($input['bookmarked_ids']) && is_array($input['bookmarked_ids']) ? array_map('strval', $input['bookmarked_ids']) : [];
$limit = isset($input['limit']) ? max(1, (int)$input['limit']) : 10;
$postsDir = isset($input['custom_posts_dir']) && is_dir((string)$input['custom_posts_dir'])
    ? (string)$input['custom_posts_dir']
    : POSTS_DIR;

$studyPosts = load_json_directory($postsDir, function (array $item): bool {
    return isset($item['id'], $item['persona_id'], $item['section_id'], $item['format'], $item['caption']);
});

$externalPosts = load_json_directory(EXTERNAL_DIR, function (array $item): bool {
    return isset($item['id'], $item['platform'], $item['author'], $item['caption']) && !empty($item['is_external']);
});

$personasRaw = file_exists(PERSONAS_FILE) ? json_decode((string)file_get_contents(PERSONAS_FILE), true) : [];
$personaMap = [];
if (is_array($personasRaw)) {
    foreach ($personasRaw as $p) {
        if (is_array($p) && isset($p['id'])) {
            $personaMap[$p['id']] = $p;
        }
    }
}

mt_srand($seed);
$seenLookup = array_flip($seenIds);
$bookmarkLookup = array_flip($bookmarkedIds);

$unseenStudy = array_values(array_filter($studyPosts, fn($p) => !isset($seenLookup[$p['id']])));
$cycleResetTriggered = false;

if ($sectionFilter === 'all' && count($studyPosts) > 0 && count($unseenStudy) === 0) {
    $cycleResetTriggered = true;
    $unseenStudy = $studyPosts;
}

if ($sectionFilter === 'external') {
    $shuffledExt = $externalPosts;
    shuffle($shuffledExt);
    $posts = array_slice($shuffledExt, 0, $limit);
} elseif ($sectionFilter === 'bookmarks') {
    $bookmarked = array_values(array_filter($studyPosts, fn($p) => isset($bookmarkLookup[$p['id']])));
    shuffle($bookmarked);
    $posts = array_slice($bookmarked, 0, $limit);
} elseif ($sectionFilter !== 'all') {
    $secPool = array_values(array_filter($studyPosts, fn($p) => $p['section_id'] === $sectionFilter));
    $secUnseen = array_values(array_filter($secPool, fn($p) => !isset($seenLookup[$p['id']])));
    $chosen = count($secUnseen) > 0 ? $secUnseen : $secPool;
    shuffle($chosen);
    $posts = array_slice($chosen, 0, $limit);
} else {
    $pool = $unseenStudy;
    shuffle($pool);
    $extShuffled = $externalPosts;
    shuffle($extShuffled);

    $posts = [];
    $extIdx = 0;
    foreach ($pool as $idx => $post) {
        $posts[] = $post;
        if (($idx + 1) % 4 === 0 && isset($extShuffled[$extIdx])) {
            $posts[] = $extShuffled[$extIdx++];
        }
        if (count($posts) >= $limit) {
            break;
        }
    }
}

$serverState = load_server_state(count($studyPosts));
if ($cycleResetTriggered) {
    $serverState['needs_generation'] = true;
    $serverState['completed_cycles'] = (int)$serverState['completed_cycles'] + 1;
    $serverState['last_exhausted_at'] = gmdate('Y-m-d\TH:i:s\Z');
    save_server_state($serverState);
}

echo json_encode([
    'posts' => $posts,
    'personas' => $personaMap,
    'unseen_remaining' => $cycleResetTriggered ? count($studyPosts) : count($unseenStudy),
    'total_study_posts' => count($studyPosts),
    'cycle_reset_triggered' => $cycleResetTriggered,
    'server_state' => $serverState,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
