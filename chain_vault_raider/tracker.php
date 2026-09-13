<?php
require_once 'config.php';
$line = date('Y-m-d H:i:s') . " | IP:" . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . " | UA:" . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') . "\n";
if (!is_dir(__DIR__ . '/logs')) { @mkdir(__DIR__ . '/logs', 0755, true); }
@file_put_contents(__DIR__ . '/logs/visits.log', $line, FILE_APPEND | LOCK_EX);
?>