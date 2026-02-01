
<?php
/**
 * Z-PROSPECTOR - Produção Core Engine v1.5
 * Suporte Total Multi-tenant & CRUD Módulos
 */

error_reporting(E_ALL);
ini_set('display_errors', 0); 
ini_set('log_errors', 1);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Tenant-ID");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações DB HostGator
$dbHost = 'localhost';
$dbName = 'tinova31_zprospector_db';
$dbUser = 'tinova31_zprospector_db';
$dbPass = 'EASmfc#%3107';

try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB Connection Failed"]);
    exit;
}

// Lógica de Tenant ID (Dinâmico via Header ou Query)
$tenant_id = $_SERVER['HTTP_X_TENANT_ID'] ?? $_GET['tenant_id'] ?? 1;
$action = $_GET['action'] ?? 'health';

// Helper para leitura de JSON
$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'health':
        echo json_encode(["status" => "online", "tenant" => $tenant_id]);
        break;

    // --- BRANDING ---
    case 'get-branding':
        $stmt = $pdo->prepare("SELECT config_json FROM branding WHERE tenant_id = ?");
        $stmt->execute([$tenant_id]);
        $res = $stmt->fetch();
        echo $res ? $res['config_json'] : json_encode(["appName" => "Z-Prospector"]);
        break;

    case 'save-branding':
        $stmt = $pdo->prepare("INSERT INTO branding (tenant_id, config_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_json = VALUES(config_json)");
        $stmt->execute([$tenant_id, json_encode($input)]);
        echo json_encode(["success" => true]);
        break;

    // --- LEADS ---
    case 'get-leads':
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE tenant_id = ? ORDER BY id DESC");
        $stmt->execute([$tenant_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'save-lead':
        $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, name, phone, email, status, stage, value, source, last_interaction) VALUES (?,?,?,?,?,?,?,?,?)");
        $stmt->execute([
            $tenant_id, $input['name'], $input['phone'], $input['email'], 
            $input['status'] ?? 'COLD', $input['stage'] ?? 'NEW', 
            $input['value'] ?? 0, $input['source'] ?? 'Direct', $input['lastInteraction'] ?? ''
        ]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
        break;

    case 'delete-lead':
        $stmt = $pdo->prepare("DELETE FROM leads WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$_GET['id'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    // --- AGENDAMENTOS ---
    case 'get-appointments':
        $stmt = $pdo->prepare("SELECT * FROM appointments WHERE tenant_id = ?");
        $stmt->execute([$tenant_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'save-appointment':
        $stmt = $pdo->prepare("INSERT INTO appointments (tenant_id, lead_name, service_name, scheduled_at, status, is_ia, value) VALUES (?,?,?,?,?,?,?)");
        $stmt->execute([
            $tenant_id, $input['lead'], $input['service'], $input['scheduled_at'],
            $input['status'] ?? 'CONFIRMED', $input['ia'] ?? false, $input['value'] ?? 0
        ]);
        echo json_encode(["success" => true]);
        break;

    // --- PRODUTOS ---
    case 'get-products':
        $stmt = $pdo->prepare("SELECT * FROM products WHERE tenant_id = ?");
        $stmt->execute([$tenant_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'save-product':
        $stmt = $pdo->prepare("INSERT INTO products (tenant_id, name, price, category, description, image) VALUES (?,?,?,?,?,?)");
        $stmt->execute([
            $tenant_id, $input['name'], $input['price'], $input['category'], $input['description'], $input['image']
        ]);
        echo json_encode(["success" => true]);
        break;

    // --- N8N WORKFLOWS ---
    case 'get-workflows':
        $stmt = $pdo->prepare("SELECT * FROM n8n_workflows WHERE tenant_id = ?");
        $stmt->execute([$tenant_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'save-workflow':
        $stmt = $pdo->prepare("INSERT INTO n8n_workflows (tenant_id, name, webhook_url, event, status) VALUES (?,?,?,?,?)");
        $stmt->execute([
            $tenant_id, $input['name'], $input['webhookUrl'], $input['event'], $input['status'] ?? 'ACTIVE'
        ]);
        echo json_encode(["success" => true]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Action not found"]);
        break;
}
