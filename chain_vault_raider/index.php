<?php
/* CHAIN VAULT RAIDER — TEMPLATE DISPATCHER (FIXED) */
require_once 'config.php';
$tpl = $CONFIG['site']['template'];
$tplDir = __DIR__ . '/templates/' . $tpl;

if (!is_dir($tplDir)) {
    $scan = glob(__DIR__ . '/templates/*', GLOB_ONLYDIR);
    if (!empty($scan)) { $tplDir = $scan[0]; $tpl = basename($tplDir); }
    else { die('ERROR: No templates found in /templates'); }
}

$html = file_get_contents($tplDir . '/index.html');

// PHP يحقن المسار الصحيح للقالب الحالي تلقائيًا
$html = str_replace('__TPLPATH__', 'templates/' . $tpl . '/', $html);

header('Content-Type: text/html; charset=UTF-8');
echo $html;
?>
