
<?php
/**
 * ZPROSPECTOR - SaaS Core API
 * Conexão Homologada HostGator & Cloud Run
 * Enterprise Grade Error Handling
 */

// Desativa saída de erros HTML para não quebrar o JSON
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

function jsonExceptionHandler($e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => "Internal Server Error", 
        "details" => $e->getMessage()
    ]);
    exit;
}
set_exception_handler('jsonExceptionHandler');

// Credenciais Dinâmicas (Ambiente ou Fallback Local)
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'tinova31_zprospector_db';
$dbUser = getenv('DB_USER') ?: 'tinova31_zprospector_db';
$dbPass = getenv('DB_PASS') ?: 'EASmfc#%3107';

try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 5
    ]);
} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(["success" => false, "error" => "Database Unavailable", "code" => "DB_CONN_ERR"]);
    exit;
}

$action = $_GET['action'] ?? 'health-check';

// Tenant Resolution
$tenant_id = $_SERVER['HTTP_X_TENANT_ID'] ?? $_GET['tenant_id'] ?? 1;
$tenant_id = filter_var($tenant_id, FILTER_SANITIZE_NUMBER_INT);
if (!$tenant_id) $tenant_id = 1; 

function getJsonInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [];
    }
    return $input;
}

try {
    switch ($action) {
        case 'health-check':
            echo json_encode(["success" => true, "status" => "Online", "database" => "Connected", "tenant" => $tenant_id]);
            break;

        case 'login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';

            // Busca usuário pelo email
            $stmt = $pdo->prepare("SELECT id, name, email, role, password, tenant_id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            // Verificação MD5 (Compatibilidade com Seed Inicial)
            if ($user && md5($password) === $user['password']) {
                $token = bin2hex(random_bytes(32)); 
                
                echo json_encode([
                    "success" => true,
                    "token" => $token,
                    "user" => [
                        "id" => $user['id'],
                        "name" => $user['name'],
                        "email" => $user['email'],
                        "role" => $user['role'],
                        "tenant_id" => $user['tenant_id']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["success" => false, "error" => "Credenciais inválidas"]);
            }
            break;

        case 'get-current-tenant':
            $stmt = $pdo->prepare("SELECT * FROM tenants WHERE id = ? LIMIT 1");
            $stmt->execute([$tenant_id]);
            $t = $stmt->fetch();
            if ($t) {
                echo json_encode([
                    'id' => (string)$t['id'],
                    'name' => $t['name'],
                    'status' => $t['status'],
                    'niche' => 'SaaS Master', 
                    'healthScore' => 98,
                    'revenue' => 0, 
                    'activeLeads' => 0, 
                    'instanceStatus' => $t['instance_status'] ?? 'DISCONNECTED' 
                ]);
            } else {
                // Auto-provisionamento de fallback (segurança em dev)
                $stmt = $pdo->prepare("INSERT INTO tenants (id, name, status, instance_status) VALUES (?, 'Unidade Master', 'ONLINE', 'DISCONNECTED')");
                $stmt->execute([$tenant_id]);
                echo json_encode([
                    'id' => (string)$tenant_id, 'name' => 'Unidade Master', 'status' => 'ONLINE', 'instanceStatus' => 'DISCONNECTED'
                ]);
            }
            break;

        case 'update-instance-status':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("UPDATE tenants SET instance_status = ? WHERE id = ?");
            $stmt->execute([$input['status'] ?? 'DISCONNECTED', $tenant_id]);
            echo json_encode(["success" => true]);
            break;

        case 'get-user':
            $stmt = $pdo->prepare("SELECT id, tenant_id, name, email, role, avatar FROM users WHERE tenant_id = ? LIMIT 1");
            $stmt->execute([$tenant_id]);
            $user = $stmt->fetch();
            if ($user) {
                echo json_encode($user);
            } else {
                $stmt = $pdo->prepare("INSERT INTO users (tenant_id, name, email, role, password) VALUES (?, 'Operador Master', 'admin@zprospector.com', 'SUPER_ADMIN', 'e10adc3949ba59abbe56e057f20f883e')");
                $stmt->execute([$tenant_id]);
                echo json_encode(['name' => 'Operador Master', 'email' => 'admin@zprospector.com', 'role' => 'SUPER_ADMIN']);
            }
            break;

        case 'update-user':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $fields = [];
            $params = [];
            if (isset($input['name'])) { $fields[] = "name = ?"; $params[] = $input['name']; }
            if (isset($input['email'])) { $fields[] = "email = ?"; $params[] = $input['email']; }
            if (isset($input['avatar'])) { $fields[] = "avatar = ?"; $params[] = $input['avatar']; }
            
            if (!empty($fields)) {
                $params[] = $tenant_id;
                $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE tenant_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }
            echo json_encode(["success" => true]);
            break;

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

        case 'get-leads':
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC");
            $stmt->execute([$tenant_id]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'save-lead':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, name, phone, email, status, stage, value, source, last_interaction) VALUES (:tid, :name, :phone, :email, :status, :stage, :value, :source, :li)");
            $stmt->execute([
                ':tid'    => $tenant_id,
                ':name'   => $input['name'] ?? 'Lead',
                ':phone'  => $input['phone'] ?? '',
                ':email'  => $input['email'] ?? null,
                ':status' => $input['status'] ?? 'COLD',
                ':stage'  => $input['stage'] ?? 'NEW',
                ':value'  => $input['value'] ?? 0,
                ':source' => $input['source'] ?? 'API',
                ':li'     => $input['lastInteraction'] ?? 'Novo cadastro'
            ]);
            echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
            break;
        
        case 'update-lead-stage':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("UPDATE leads SET stage = ? WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['stage'], $input['id'], $tenant_id]);
            echo json_encode(["success" => true]);
            break;

        case 'get-messages':
            $lead_id = $_GET['lead_id'] ?? 0;
            $stmt = $pdo->prepare("SELECT id, sender, content as text, type, DATE_FORMAT(created_at, '%H:%i') as time FROM messages WHERE lead_id = ? AND tenant_id = ? ORDER BY created_at ASC");
            $stmt->execute([$lead_id, $tenant_id]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'save-message':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $type = $input['type'] ?? 'text';
            $stmt = $pdo->prepare("INSERT INTO messages (tenant_id, lead_id, sender, content, type) VALUES (:tid, :lid, :sender, :content, :type)");
            $stmt->execute([
                ':tid' => $tenant_id,
                ':lid' => $input['lead_id'],
                ':sender' => $input['sender'],
                ':content' => $input['text'],
                ':type' => $type
            ]);
            $preview = $type === 'text' ? substr($input['text'], 0, 30) . "..." : "[$type]";
            $stmt = $pdo->prepare("UPDATE leads SET last_interaction = ? WHERE id = ?");
            $stmt->execute(["Msg: " . $preview, $input['lead_id']]);
            echo json_encode(["success" => true]);
            break;

        case 'get-transactions':
            $stmt = $pdo->prepare("SELECT * FROM transactions WHERE tenant_id = ? ORDER BY created_at DESC");
            $stmt->execute([$tenant_id]);
            $results = $stmt->fetchAll();
            $mapped = array_map(function($row) {
                return [
                    'id' => $row['id'],
                    'client' => $row['client'],
                    'type' => $row['type'],
                    'typeId' => $row['type_id'], 
                    'value' => (float)$row['value'],
                    'status' => $row['status'],
                    'isWithdraw' => (bool)$row['is_withdraw'],
                    'date' => date('d/m/Y H:i', strtotime($row['created_at']))
                ];
            }, $results);
            echo json_encode($mapped);
            break;

        case 'save-transaction':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
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
            $input = getJsonInput();
            $stmt = $pdo->prepare("UPDATE transactions SET status = 'PAID' WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['id'], $tenant_id]);
            echo json_encode(["success" => true]);
            break;

        case 'get-appointments':
            $stmt = $pdo->prepare("SELECT * FROM appointments WHERE tenant_id = ? ORDER BY year, month, date, time");
            $stmt->execute([$tenant_id]);
            $res = $stmt->fetchAll();
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
            $input = getJsonInput();
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
            $input = getJsonInput();
            $stmt = $pdo->prepare("DELETE FROM appointments WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['id'], $tenant_id]);
            echo json_encode(["success" => true]);
            break;

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
                    'conversion' => '0%', 
                    'views' => $r['views'],
                    'sales' => $r['sales']
                ];
            }, $res);
            echo json_encode($mapped);
            break;

        case 'save-product':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
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
            $input = getJsonInput();
            $stmt = $pdo->prepare("UPDATE products SET active = 0 WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['id'], $tenant_id]);
            echo json_encode(["success" => true]);
            break;

        case 'get-campaigns':
            $stmt = $pdo->prepare("SELECT * FROM campaigns WHERE tenant_id = ? ORDER BY created_at DESC");
            $stmt->execute([$tenant_id]);
            $res = $stmt->fetchAll();
            $mapped = array_map(function($r) {
                return [
                    'id' => $r['id'],
                    'name' => $r['name'],
                    'targetStatus' => $r['target_status'],
                    'productId' => $r['product_id'],
                    'productName' => $r['product_name'],
                    'template' => $r['template'],
                    'scheduledAt' => $r['scheduled_at'],
                    'status' => $r['status'],
                    'totalLeads' => (int)$r['total_leads'],
                    'sentLeads' => (int)$r['sent_leads'],
                    'conversions' => (int)$r['conversions']
                ];
            }, $res);
            echo json_encode($mapped);
            break;

        case 'save-campaign':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO campaigns (id, tenant_id, name, target_status, product_id, product_name, template, scheduled_at, status, total_leads, sent_leads) VALUES (:id, :tid, :name, :ts, :pid, :pname, :tpl, :sch, :st, :tot, :snt) ON DUPLICATE KEY UPDATE name=:name, target_status=:ts, template=:tpl, status=:st, sent_leads=:snt");
            $stmt->execute([
                ':id' => $input['id'],
                ':tid' => $tenant_id,
                ':name' => $input['name'],
                ':ts' => $input['targetStatus'],
                ':pid' => $input['productId'] ?? '',
                ':pname' => $input['productName'] ?? '',
                ':tpl' => $input['template'],
                ':sch' => $input['scheduledAt'],
                ':st' => $input['status'],
                ':tot' => $input['totalLeads'],
                ':snt' => $input['sentLeads']
            ]);
            echo json_encode(["success" => true]);
            break;

        case 'delete-campaign':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("DELETE FROM campaigns WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['id'], $tenant_id]);
            echo json_encode(["success" => true]);
            break;

        case 'get-integrations':
            $stmt = $pdo->prepare("SELECT * FROM integrations WHERE tenant_id = ?");
            $stmt->execute([$tenant_id]);
            $res = $stmt->fetchAll();
            $mapped = array_map(function($r) {
                return [
                    'id' => $r['id'],
                    'provider' => $r['provider'],
                    'name' => $r['name'],
                    'status' => $r['status'],
                    'lastSync' => $r['last_sync'],
                    'keys' => json_decode($r['config_json'], true)
                ];
            }, $res);
            echo json_encode($mapped);
            break;

        case 'save-integration':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO integrations (id, tenant_id, provider, name, config_json, status, last_sync) VALUES (:id, :tid, :prov, :nm, :cfg, :st, :ls) ON DUPLICATE KEY UPDATE name=:nm, config_json=:cfg, status=:st");
            $stmt->execute([
                ':id' => $input['id'],
                ':tid' => $tenant_id,
                ':prov' => $input['provider'],
                ':nm' => $input['name'],
                ':cfg' => json_encode($input['keys']),
                ':st' => $input['status'],
                ':ls' => $input['lastSync']
            ]);
            echo json_encode(["success" => true]);
            break;

        case 'delete-integration':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("DELETE FROM integrations WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['id'], $tenant_id]);
            echo json_encode(["success" => true]);
            break;

        case 'get-webhooks':
            $stmt = $pdo->prepare("SELECT * FROM webhooks WHERE tenant_id = ?");
            $stmt->execute([$tenant_id]);
            $res = $stmt->fetchAll();
            $mapped = array_map(function($r) {
                return [
                    'id' => $r['id'],
                    'name' => $r['name'],
                    'url' => $r['url'],
                    'event' => $r['event'],
                    'status' => $r['status'],
                    'hits' => (int)$r['hits'],
                    'lastHit' => $r['last_hit']
                ];
            }, $res);
            echo json_encode($mapped);
            break;

        case 'save-webhook':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO webhooks (id, tenant_id, name, url, event, status, hits, last_hit) VALUES (:id, :tid, :nm, :url, :evt, :st, :hits, :lh) ON DUPLICATE KEY UPDATE name=:nm, event=:evt");
            $stmt->execute([
                ':id' => $input['id'],
                ':tid' => $tenant_id,
                ':nm' => $input['name'],
                ':url' => $input['url'],
                ':evt' => $input['event'],
                ':st' => $input['status'],
                ':hits' => $input['hits'],
                ':lh' => $input['lastHit'] ?? null
            ]);
            echo json_encode(["success" => true]);
            break;

        case 'delete-webhook':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("DELETE FROM webhooks WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['id'], $tenant_id]);
            echo json_encode(["success" => true]);
            break;

        default:
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Endpoint desconhecido"]);
            break;
    }
} catch (Exception $e) {
    jsonExceptionHandler($e);
}
