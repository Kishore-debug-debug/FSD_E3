<?php
error_reporting(0);
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require '../config.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$required = ['full_name', 'email', 'phone', 'address', 'city', 'pincode'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit;
    }
}

$username = $_SESSION['username'];
$user_stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$user_stmt->bind_param("s", $username);
$user_stmt->execute();
$user = $user_stmt->get_result()->fetch_assoc();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$user_id = $user['id'];
$session_id = 'user_' . $user_id;

$cart_stmt = $conn->prepare("
    SELECT c.product_id, c.quantity, p.name, p.price, p.stock 
    FROM carts c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.session_id = ?
");
$cart_stmt->bind_param("s", $session_id);
$cart_stmt->execute();
$cart_items = $cart_stmt->get_result()->fetch_all(MYSQLI_ASSOC);

if (empty($cart_items)) {
    echo json_encode(['success' => false, 'message' => 'Cart is empty']);
    exit;
}

$total = array_sum(array_map(fn($i) => $i['price'] * $i['quantity'], $cart_items));

$conn->begin_transaction();

try {
    $order_stmt = $conn->prepare("
        INSERT INTO orders (user_id, total_price, status, full_name, email, phone, address, city, pincode)
        VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    ");
    $order_stmt->bind_param("idssssss", $user_id, $total, $data['full_name'], $data['email'], $data['phone'], $data['address'], $data['city'], $data['pincode']);
    $order_stmt->execute();
    $order_id = $conn->insert_id;

    $item_stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    $stock_stmt = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");

    foreach ($cart_items as $item) {
        $item_stmt->bind_param("iiid", $order_id, $item['product_id'], $item['quantity'], $item['price']);
        $item_stmt->execute();

        $stock_stmt->bind_param("iii", $item['quantity'], $item['product_id'], $item['quantity']);
        $stock_stmt->execute();

        if ($stock_stmt->affected_rows === 0) {
            throw new Exception("Sorry, \"" . $item['name'] . "\" is out of stock or has insufficient quantity.");
        }
    }

    $clear_stmt = $conn->prepare("DELETE FROM carts WHERE session_id = ?");
    $clear_stmt->bind_param("s", $session_id);
    $clear_stmt->execute();

    $conn->commit();
    echo json_encode(['success' => true, 'order_id' => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
