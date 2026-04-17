<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require 'config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

$session_id = 'user_' . $_SESSION['user_id'];

$stmt = $pdo->prepare("
    SELECT c.*, p.name, p.price, p.image 
    FROM carts c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.session_id = ?
");
$stmt->execute([$session_id]);
$cart = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($cart);
?>
