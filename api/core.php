<?php
/**
 * ZPROSPECTOR - SaaS Core API
 * Conexão Homologada HostGator & Cloud Run
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

// Credenciais fornecidas pelo usuário para HostGator
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
    error_log("Database Connection Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Falha na conexão com o banco de dados HostGator."]);
    exit;
}

$action = $_GET['action'] ?? 'health-check';
// Tenant ID fixo em 1 para esta unidade, mas preparado para multi-tenant
$tenant_id = 1; 

switch ($action) {
    case 'health-check':
        echo json_encode(["success" => true, "status" => "Online", "database" => "Connected"]);
        break;

    case 'get-branding':
        $stmt = $pdo->prepare("SELECT config_json FROM branding WHERE tenant_id = ? LIMIT 1");
        $stmt->execute([$tenant_id]);
        $row = $stmt->fetch();
        if ($row) {
            echo $row['config_json'];
        } else {
            // Fallback se o banco estiver vazio
            echo json_encode([
                "appName" => "Z-Prospector",
                "fullLogo" => "Logotipo%20Z_Prospector.png",
                "favicon" => "Logotipo%20Z_Prospector_Icon.png"
            ]);
        }
        break;

    case 'save-branding':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = file_get_contents('php://input');
        $stmt = $pdo->prepare("INSERT INTO branding (tenant_id, config_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_json = VALUES(config_json)");
        $stmt->execute([$tenant_id, $input]);
        echo json_encode(["success" => true]);
        break;

    case 'get-leads':
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC");
        $stmt->execute([$tenant_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'save-lead':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, name, phone, email, status, stage, value, source) VALUES (:tid, :name, :phone, :email, :status, :stage, :value, :source)");
        $stmt->execute([
            ':tid'    => $tenant_id,
            ':name'   => $input['name'],
            ':phone'  => $input['phone'],
            ':email'  => $input['email'] ?? null,
            ':status' => $input['status'] ?? 'COLD',
            ':stage'  => $input['stage'] ?? 'NEW',
            ':value'  => $input['value'] ?? 0,
            ':source' => $input['source'] ?? 'API'
        ]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
        break;
    
    case 'update-lead-stage':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE leads SET stage = ? WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$input['stage'], $input['id'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    default:
        http_response_code(404);
        break;
}