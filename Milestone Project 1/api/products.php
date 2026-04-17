<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require '../config.php';

// Return ALL products (including out of stock) so frontend can show "Out of Stock"
$products = $conn->query("SELECT * FROM products ORDER BY id DESC");
$result = [];

while($row = $products->fetch_assoc()) {
    $img = $row['image'];
    $image_url = $img && file_exists('../uploads/' . $img) 
        ? 'uploads/' . $img 
        : 'placeholder.jpg';
    
    $result[] = [
        'id'          => $row['id'],
        'name'        => $row['name'],
        'description' => $row['description'] ?? '',
        'price'       => floatval($row['price']),
        'stock'       => intval($row['stock']),
        'image'       => $image_url
    ];
}
echo json_encode($result);
?>
