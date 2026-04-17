<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
// Use user_id as the cart key — each user gets their own cart
$session_id = 'user_' . $_SESSION['user_id'];
$product_id = $input['product_id'];
$quantity   = $input['quantity'] ?? 1;

$stmt = $pdo->prepare("
    INSERT INTO carts (session_id, product_id, quantity) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE quantity = quantity + ?
");
$stmt->execute([$session_id, $product_id, $quantity, $quantity]);

echo json_encode(['success' => true, 'message' => 'Added to cart']);
?>
