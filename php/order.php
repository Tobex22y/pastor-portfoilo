<?php
// Book order handler. Edit the settings below.
header('Content-Type: application/json');
$cfg = [
  'price'       => 5000,                 // price per copy (Naira)
  'admin_email' => 'you@example.com',    // where order alerts are sent
  'pay_url'     => '',                   // optional: Paystack/Flutterwave payment link
];
function fail($m, $c = 400) { http_response_code($c); echo json_encode(['ok' => false, 'error' => $m]); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Invalid request.', 405);
if (!empty($_POST['website'])) fail('Rejected.');            // honeypot against bots

$clean = fn($k) => trim(strip_tags($_POST[$k] ?? ''));
$name = $clean('name'); $phone = $clean('phone'); $addr = $clean('address');
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$qty = (int)($_POST['qty'] ?? 0);

if (!$name || !$phone || !$addr || !$email) fail('Please fill in all fields with valid details.');
if ($qty < 1 || $qty > 50) fail('Copies must be between 1 and 50.');

$total = $qty * $cfg['price'];
$ref = 'BK' . date('ymd') . strtoupper(bin2hex(random_bytes(3)));

$dir = __DIR__ . '/../data';
if (!is_dir($dir)) mkdir($dir, 0750, true);
$fp = fopen("$dir/orders.csv", 'a');
if (!$fp) fail('Could not save the order.', 500);
flock($fp, LOCK_EX);
fputcsv($fp, [$ref, date('c'), $name, $email, $phone, $addr, $qty, $total, 'pending']);
flock($fp, LOCK_UN); fclose($fp);

$body = "Order $ref\nName: $name\nEmail: $email\nPhone: $phone\nAddress: $addr\nCopies: $qty\nTotal: NGN " . number_format($total);
$hdr = "From: no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\nReply-To: $email";
@mail($cfg['admin_email'], "New book order $ref", $body, $hdr);
@mail($email, "Your book order $ref", "Thank you, $name.\n\n$body\n\nPayment instructions will follow.", $hdr);

$out = ['ok' => true, 'reference' => $ref];
if ($cfg['pay_url']) $out['payment_url'] = $cfg['pay_url'] . (str_contains($cfg['pay_url'], '?') ? '&' : '?') . 'ref=' . $ref;
echo json_encode($out);
