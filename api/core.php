
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

    // --- TENANT & SYSTEM STATUS ---
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
                // Agora lê o status real do banco, com fallback se a coluna estiver vazia
                'instanceStatus' => $t['instance_status'] ?? 'DISCONNECTED' 
            ]);
        } else {
            // Provision default if missing
            $stmt = $pdo->prepare("INSERT INTO tenants (id, name, status, instance_status) VALUES (1, 'Unidade Master', 'ONLINE', 'DISCONNECTED')");
            $stmt->execute();
            echo json_encode([
                'id' => '1', 'name' => 'Unidade Master', 'status' => 'ONLINE', 'instanceStatus' => 'DISCONNECTED'
            ]);
        }
        break;

    case 'update-instance-status':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        // Atualiza apenas o status da conexão do WhatsApp
        $stmt = $pdo->prepare("UPDATE tenants SET instance_status = ? WHERE id = ?");
        $stmt->execute([$input['status'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    // --- USER PROFILE ---
    case 'get-user':
        $stmt = $pdo->prepare("SELECT * FROM users WHERE tenant_id = ? LIMIT 1");
        $stmt->execute([$tenant_id]);
        $user = $stmt->fetch();
        if ($user) {
            echo json_encode($user);
        } else {
            $stmt = $pdo->prepare("INSERT INTO users (tenant_id, name, email, role) VALUES (?, 'Operador Master', 'admin@zprospector.com', 'SUPER_ADMIN')");
            $stmt->execute([$tenant_id]);
            echo json_encode(['name' => 'Operador Master', 'email' => 'admin@zprospector.com', 'role' => 'SUPER_ADMIN']);
        }
        break;

    case 'update-user':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
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

    // --- CHAT MESSAGES ---
    case 'get-messages':
        $lead_id = $_GET['lead_id'] ?? 0;
        // Agora seleciona também o tipo da mensagem
        $stmt = $pdo->prepare("SELECT id, sender, content as text, type, DATE_FORMAT(created_at, '%H:%i') as time FROM messages WHERE lead_id = ? AND tenant_id = ? ORDER BY created_at ASC");
        $stmt->execute([$lead_id, $tenant_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'save-message':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        
        $type = $input['type'] ?? 'text';
        
        $stmt = $pdo->prepare("INSERT INTO messages (tenant_id, lead_id, sender, content, type) VALUES (:tid, :lid, :sender, :content, :type)");
        $stmt->execute([
            ':tid' => $tenant_id,
            ':lid' => $input['lead_id'],
            ':sender' => $input['sender'],
            ':content' => $input['text'],
            ':type' => $type
        ]);
        
        // Atualiza a última interação do lead (apenas se for texto ou notificação de mídia)
        $preview = $type === 'text' ? substr($input['text'], 0, 30) . "..." : "[$type]";
        $stmt = $pdo->prepare("UPDATE leads SET last_interaction = ? WHERE id = ?");
        $stmt->execute(["Msg: " . $preview, $input['lead_id']]);
        
        echo json_encode(["success" => true]);
        break;

    // --- INTELLIGENT INBOUND WEBHOOK (AUTO-MATCH + MEDIA) ---
    case 'webhook-incoming':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        
        $phone = $input['phone'] ?? '';
        $text = $input['text'] ?? ''; // Pode ser caption ou texto
        $mediaUrl = $input['media_url'] ?? null;
        $msgType = $input['type'] ?? ($mediaUrl ? 'image' : 'text'); // Fallback type
        $name = $input['name'] ?? 'Cliente WhatsApp';
        
        // Prioriza Media URL se existir como conteúdo principal
        $finalContent = $mediaUrl ? $mediaUrl : $text;
        
        if (!$phone || !$finalContent) {
            http_response_code(400);
            echo json_encode(["error" => "Phone and Content required"]);
            exit;
        }

        // 1. Tentar encontrar o Lead pelo telefone
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        
        $stmt = $pdo->prepare("SELECT id FROM leads WHERE tenant_id = ? AND (phone LIKE ? OR phone LIKE ?) LIMIT 1");
        $stmt->execute([$tenant_id, "%$cleanPhone%", "%" . substr($cleanPhone, -8) . "%"]);
        $lead = $stmt->fetch();
        
        $leadId = 0;
        
        if ($lead) {
            $leadId = $lead['id'];
        } else {
            // 2. Se não existir, criar novo Lead
            $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, name, phone, status, stage, source, created_at) VALUES (?, ?, ?, 'WARM', 'NEW', 'WhatsApp Inbound', NOW())");
            $stmt->execute([$tenant_id, $name, $phone]);
            $leadId = $pdo->lastInsertId();
        }
        
        // 3. Salvar Mensagem com Tipo Correto
        $stmt = $pdo->prepare("INSERT INTO messages (tenant_id, lead_id, sender, content, type, created_at) VALUES (?, ?, 'lead', ?, ?, NOW())");
        $stmt->execute([$tenant_id, $leadId, $finalContent, $msgType]);
        
        // 4. Atualizar Interação
        $preview = $msgType === 'text' ? substr($finalContent, 0, 20) . "..." : "[$msgType recebido]";
        $stmt = $pdo->prepare("UPDATE leads SET last_interaction = ? WHERE id = ?");
        $stmt->execute(["Recebido: " . $preview, $leadId]);
        
        echo json_encode(["success" => true, "lead_id" => $leadId, "action" => $lead ? "matched" : "created"]);
        break;

    // --- FINANCEIRO ---
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

    // --- AGENDA ---
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

    // --- PRODUTOS ---
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

    // --- CAMPANHAS ---
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
        $input = json_decode(file_get_contents('php://input'), true);
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
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("DELETE FROM campaigns WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$input['id'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    // --- INTEGRAÇÕES (GATEWAYS) ---
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
        $input = json_decode(file_get_contents('php://input'), true);
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
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("DELETE FROM integrations WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$input['id'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    // --- WEBHOOKS ---
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
        $input = json_decode(file_get_contents('php://input'), true);
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
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("DELETE FROM webhooks WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$input['id'], $tenant_id]);
        echo json_encode(["success" => true]);
        break;

    // --- SYSTEM / N8N CORE ENDPOINTS ---
    case 'sys-provision-tenant':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $tId = $input['tenant_id'] ?? 0;
        if($tId) {
             // 1. Criar/Atualizar Registro de Tenant
             $stmt = $pdo->prepare("INSERT INTO tenants (id, name, status, instance_status) VALUES (?, ?, 'ONLINE', 'DISCONNECTED') ON DUPLICATE KEY UPDATE status='ONLINE'");
             $tenantName = "Unidade " . $tId;
             $stmt->execute([$tId, $tenantName]);

             // 2. Configurar Branding Padrão
             $stmt = $pdo->prepare("INSERT IGNORE INTO branding (tenant_id, config_json) VALUES (?, ?)");
             $defaultConfig = '{"appName":"Nova Unidade","fullLogo":"Logotipo%20Z_Prospector.png","fullLogoDark":"Logotipo%20Z_Prospector.png","iconLogo":"Logotipo%20Z_Prospector_Icon.png","iconLogoDark":"Logotipo%20Z_Prospector_Icon.png","favicon":"Logotipo%20Z_Prospector_Icon.png","salesPageLogo":"Logotipo%20Z_Prospector.png"}';
             $stmt->execute([$tId, $defaultConfig]);
             
             echo json_encode(["success" => true, "message" => "Tenant $tId provisionado com sucesso via API."]);
        } else {
             http_response_code(400);
             echo json_encode(["success" => false, "error" => "ID do Tenant obrigatório"]);
        }
        break;

    case 'sys-update-tenant-status':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
        $input = json_decode(file_get_contents('php://input'), true);
        $tId = $input['tenant_id'];
        $status = $input['status'];
        
        $stmt = $pdo->prepare("UPDATE tenants SET status = ? WHERE id = ?");
        $stmt->execute([$status, $tId]);
        
        echo json_encode(["success" => true, "message" => "Status do Tenant {$tId} atualizado para {$status}"]);
        break;

    case 'sys-db-latency':
        $start = microtime(true);
        $stmt = $pdo->query("SELECT 1"); 
        $end = microtime(true);
        $latencyMs = round(($end - $start) * 1000, 2);
        echo json_encode(["success" => true, "latency_ms" => $latencyMs, "service" => "Database HostGator"]);
        break;

    default:
        http_response_code(404);
        break;
}
