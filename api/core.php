
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

    // --- BRANDING ---
    case 'get-branding':
        $stmt = $pdo->prepare("SELECT config_json FROM branding WHERE tenant_id = ? LIMIT 1");
        $stmt->execute([$tenant_id]);
        $row = $stmt->fetch();
        if ($row) {
            echo $row['config_json'];
        } else {
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

    // --- LEADS ---
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

    // --- FINANCEIRO ---
    case 'get-transactions':
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE tenant_id = ? ORDER BY created_at DESC");
        $stmt->execute([$tenant_id]);
        $results = $stmt->fetchAll();
        foreach ($results as &$row) {
            $row['isWithdraw'] = (bool)$row['is_withdraw'];
            $row['date'] = date('d/m/Y H:i', strtotime($row['created_at']));
        }
        echo json_encode($results);
        break;

    case 'save-transaction':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO transactions (id, tenant_id, client, type, type_id, value, status, is_withdraw) VALUES (:id, :tid, :client, :type, :type_id, :value, :status, :is_withdraw)");
        $stmt->execute([
            ':id'          => $input['id'],
            ':tid'         => $tenant_id,
            ':client'      => $input['client'],
            ':type'        => $input['type'],
            ':type_id'     => $input['typeId'],
            ':value'       => $input['value'],
            ':status'      => $input['status'],
            ':is_withdraw' => $input['isWithdraw'] ? 1 : 0
        ]);
        echo json_encode(["success" => true]);
        break;

    case 'approve-transaction':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE transactions SET status = 'PAID' WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$input['id'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    // --- AGENDA (NOVO) ---
    case 'get-appointments':
        $stmt = $pdo->prepare("SELECT * FROM appointments WHERE tenant_id = ? ORDER BY year, month, date, time");
        $stmt->execute([$tenant_id]);
        $res = $stmt->fetchAll();
        // Mapear para formato frontend
        $mapped = array_map(function($r) {
            return [
                'id' => $r['id'],
                'lead' => $r['lead_name'],
                'time' => $r['time'],
                'date' => (int)$r['date'],
                'month' => (int)$r['month'],
                'year' => (int)$r['year'],
                'service' => $r['service'],
                'serviceId' => $r['service_id'],
                'value' => (float)$r['value'],
                'status' => $r['status'],
                'ia' => (bool)$r['ia_scheduled']
            ];
        }, $res);
        echo json_encode($mapped);
        break;

    case 'save-appointment':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO appointments (id, tenant_id, lead_name, time, date, month, year, service, service_id, value, status, ia_scheduled) VALUES (:id, :tid, :lead, :time, :date, :month, :year, :svc, :svcid, :val, :stat, :ia) ON DUPLICATE KEY UPDATE lead_name=:lead, time=:time, service=:svc, value=:val");
        $stmt->execute([
            ':id' => $input['id'],
            ':tid' => $tenant_id,
            ':lead' => $input['lead'],
            ':time' => $input['time'],
            ':date' => $input['date'],
            ':month' => $input['month'],
            ':year' => $input['year'],
            ':svc' => $input['service'],
            ':svcid' => $input['serviceId'] ?? '',
            ':val' => $input['value'],
            ':stat' => $input['status'],
            ':ia' => $input['ia'] ? 1 : 0
        ]);
        echo json_encode(["success" => true]);
        break;

    case 'delete-appointment':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("DELETE FROM appointments WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$input['id'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    // --- PRODUTOS (NOVO) ---
    case 'get-products':
        $stmt = $pdo->prepare("SELECT * FROM products WHERE tenant_id = ? AND active = 1");
        $stmt->execute([$tenant_id]);
        $res = $stmt->fetchAll();
        $mapped = array_map(function($r) {
            return [
                'id' => $r['id'],
                'name' => $r['name'],
                'price' => (float)$r['price'],
                'category' => $r['category'],
                'description' => $r['description'],
                'image' => $r['image_url'],
                'conversion' => '0%', // Mock
                'views' => $r['views'],
                'sales' => $r['sales']
            ];
        }, $res);
        echo json_encode($mapped);
        break;

    case 'save-product':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO products (id, tenant_id, name, price, category, description, image_url) VALUES (:id, :tid, :name, :price, :cat, :desc, :img) ON DUPLICATE KEY UPDATE name=:name, price=:price, category=:cat, description=:desc, image_url=:img");
        $stmt->execute([
            ':id' => $input['id'],
            ':tid' => $tenant_id,
            ':name' => $input['name'],
            ':price' => $input['price'],
            ':cat' => $input['category'],
            ':desc' => $input['description'],
            ':img' => $input['image']
        ]);
        echo json_encode(["success" => true]);
        break;

    case 'delete-product':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE products SET active = 0 WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$input['id'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    default:
        http_response_code(404);
        break;
}
