<?php
session_start();
header('Content-Type: application/json');
require 'config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false]);
    exit;
}

$input      = json_decode(file_get_contents('php://input'), true);
$session_id = 'user_' . $_SESSION['user_id'];
$product_id = $input['product_id'];

$stmt = $pdo->prepare("DELETE FROM carts WHERE session_id = ? AND product_id = ?");
$stmt->execute([$session_id, $product_id]);

echo json_encode(['success' => true]);
?>
