
<?php
/**
 * ZPROSPECTOR - Enterprise SaaS API
 * Security Level: High (Token Auth, Input Sanitzation, AI Proxy)
 */

error_reporting(E_ALL);
ini_set('display_errors', 0); 
ini_set('log_errors', 1);

// CORS Headers - Em produção, restrinja ao domínio exato
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Tenant-ID");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Global Exception Handler
function jsonExceptionHandler($e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(["success" => false, "error" => "Internal Server Error", "details" => "Consulte os logs do servidor."]);
    exit;
}
set_exception_handler('jsonExceptionHandler');

// DB Config
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'tinova31_zprospector_db';
$dbUser = getenv('DB_USER') ?: 'tinova31_zprospector_db';
$dbPass = getenv('DB_PASS') ?: 'EASmfc#%3107';

try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(["success" => false, "error" => "Database Unavailable"]);
    exit;
}

function getJsonInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) return [];
    return $input;
}

$action = $_GET['action'] ?? 'health-check';
$public_actions = ['health-check', 'login', 'sys-provision-tenant', 'webhook-incoming'];

// --- AUTHENTICATION LAYER ---
$current_user = null;
$tenant_id = '1'; // Default Fallback for Public Actions

if (!in_array($action, $public_actions)) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $stmt = $pdo->prepare("SELECT u.id, u.tenant_id, u.role FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()");
        $stmt->execute([$token]);
        $current_user = $stmt->fetch();
        
        if ($current_user) {
            $tenant_id = $current_user['tenant_id'];
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Sessão inválida ou expirada"]);
            exit;
        }
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Token de autenticação ausente"]);
        exit;
    }
}

try {
    switch ($action) {
        // --- SYSTEM ---
        case 'health-check':
            echo json_encode(["success" => true, "status" => "Online", "mode" => "SaaS Enterprise"]);
            break;

        case 'login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';

            $stmt = $pdo->prepare("SELECT id, name, email, role, password, tenant_id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            $valid = false;
            if ($user) {
                // Suporta tanto Hash Bcrypt quanto MD5 legado (com migração automática)
                if (password_verify($password, $user['password'])) {
                    $valid = true;
                } elseif (md5($password) === $user['password']) {
                    $newHash = password_hash($password, PASSWORD_DEFAULT);
                    $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newHash, $user['id']]);
                    $valid = true;
                }
            }

            if ($valid) {
                $token = bin2hex(random_bytes(32));
                $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
                $pdo->prepare("INSERT INTO user_sessions (token, user_id, tenant_id, expires_at) VALUES (?, ?, ?, ?)")->execute([$token, $user['id'], $user['tenant_id'], $expires]);
                
                echo json_encode([
                    "success" => true,
                    "token" => $token,
                    "user" => ["id" => $user['id'], "name" => $user['name'], "email" => $user['email'], "role" => $user['role'], "tenant_id" => $user['tenant_id']]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["success" => false, "error" => "Credenciais inválidas"]);
            }
            break;

        case 'get-user':
            if ($current_user) {
                $stmt = $pdo->prepare("SELECT id, name, email, role, avatar FROM users WHERE id = ?");
                $stmt->execute([$current_user['id']]);
                echo json_encode($stmt->fetch());
            }
            break;

        // --- AI PROXY (GEMINI) ---
        case 'ai-completion':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $prompt = $input['prompt'] ?? '';
            
            // Server-Side API Key (Seguro)
            $apiKey = getenv('API_KEY'); 
            if (!$apiKey) {
                echo json_encode(["text" => "Erro: API Key não configurada no servidor."]);
                exit;
            }

            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;
            
            $data = [
                "contents" => [
                    ["parts" => [["text" => $prompt]]]
                ]
            ];
            
            // Se houver JSON Schema na requisição (opcional)
            if (isset($input['config']['responseMimeType']) && $input['config']['responseMimeType'] === 'application/json') {
                $data['generationConfig'] = [
                    'responseMimeType' => 'application/json'
                ];
            }

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
            
            $response = curl_exec($ch);
            
            if (curl_errno($ch)) {
                echo json_encode(["text" => "Erro de conexão com IA: " . curl_error($ch)]);
            } else {
                $json = json_decode($response, true);
                $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                echo json_encode(["text" => $text]);
            }
            curl_close($ch);
            break;

        // --- EVOLUTION API PROXY ---
        case 'proxy-evolution':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            
            // Recupera credenciais da Evolution do DB deste Tenant
            $stmt = $pdo->prepare("SELECT config_json FROM integrations WHERE tenant_id = ? AND provider = 'SYSTEM_EVOLUTION' LIMIT 1");
            $stmt->execute([$tenant_id]);
            $integ = $stmt->fetch();
            
            if (!$integ) {
                echo json_encode(["success" => false, "error" => "Integração WhatsApp não configurada"]);
                exit;
            }
            
            $config = json_decode($integ['config_json'], true);
            // Suporta chave na raiz ou dentro de 'keys'
            $baseUrl = $config['baseUrl'] ?? $config['name'] ?? 'https://api.clikai.com.br';
            $apiKey = $config['apiKey'] ?? $config['keys']['apiKey'] ?? '';
            
            $input = getJsonInput();
            $endpoint = $input['endpoint'] ?? '';
            $payload = $input['payload'] ?? [];
            
            // Corrige URL se tiver barra dupla
            $url = rtrim($baseUrl, '/') . '/' . ltrim($endpoint, '/');
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            if (!empty($payload)) {
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            }
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json", "apikey: " . $apiKey]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            http_response_code($httpCode >= 200 && $httpCode < 300 ? 200 : $httpCode);
            echo $response;
            break;

        // --- LEADS ---
        case 'get-leads':
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 500");
            $stmt->execute([$tenant_id]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'save-lead':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $id = $input['id'] ?? uniqid('lead_');
            
            // Check existence
            $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$id, $tenant_id]);
            $exists = $stmt->fetch();

            if ($exists) {
                $stmt = $pdo->prepare("UPDATE leads SET name=?, phone=?, email=?, status=?, stage=?, value=?, source=?, last_interaction=? WHERE id=? AND tenant_id=?");
                $stmt->execute([$input['name'], $input['phone'], $input['email'], $input['status'], $input['stage'], $input['value'], $input['source'], $input['lastInteraction'], $id, $tenant_id]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO leads (id, tenant_id, name, phone, email, status, stage, value, source, last_interaction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id, $tenant_id, $input['name'], $input['phone'], $input['email'], $input['status'], $input['stage'], $input['value'], $input['source'], $input['lastInteraction']]);
            }
            echo json_encode(["success" => true, "id" => $id]);
            break;

        case 'update-lead-stage':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("UPDATE leads SET stage = ? WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['stage'], $input['id'], $tenant_id]);
            echo json_encode(["success" => true]);
            break;

        // --- MESSAGES ---
        case 'get-messages':
            $leadId = $_GET['lead_id'] ?? '';
            $stmt = $pdo->prepare("SELECT * FROM messages WHERE tenant_id = ? AND lead_id = ? ORDER BY created_at ASC");
            $stmt->execute([$tenant_id, $leadId]);
            $msgs = $stmt->fetchAll();
            // Formata para o frontend
            $formatted = array_map(function($m) {
                return [
                    'id' => $m['id'],
                    'sender' => $m['sender'],
                    'text' => $m['content'],
                    'type' => $m['type'],
                    'time' => date('H:i', strtotime($m['created_at'])),
                    'status' => $m['status']
                ];
            }, $msgs);
            echo json_encode($formatted);
            break;

        case 'save-message':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO messages (id, tenant_id, lead_id, sender, content, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                uniqid('msg_'), $tenant_id, $input['lead_id'], $input['sender'], $input['text'], $input['type'], 'sent'
            ]);
            
            // Atualiza última interação do lead
            $preview = $input['type'] === 'text' ? substr($input['text'], 0, 30) . '...' : '[' . $input['type'] . ']';
            $stmt = $pdo->prepare("UPDATE leads SET last_interaction = ? WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$preview, $input['lead_id'], $tenant_id]);
            
            echo json_encode(["success" => true]);
            break;

        // --- APPOINTMENTS, PRODUCTS, CAMPAIGNS, TRANSACTIONS (CRUD PADRÃO) ---
        case 'get-appointments':
            $stmt = $pdo->prepare("SELECT * FROM appointments WHERE tenant_id = ?");
            $stmt->execute([$tenant_id]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'save-appointment':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $id = $input['id'] ?? uniqid('appt_');
            $stmt = $pdo->prepare("REPLACE INTO appointments (id, tenant_id, lead_name, time, date, month, year, service, service_id, value, status, ia_scheduled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $tenant_id, $input['lead'], $input['time'], $input['date'], $input['month'], $input['year'], $input['service'], $input['serviceId'], $input['value'], $input['status'], $input['ia'] ? 1 : 0]);
            echo json_encode(["success" => true]);
            break;

        case 'get-products':
            $stmt = $pdo->prepare("SELECT * FROM products WHERE tenant_id = ?");
            $stmt->execute([$tenant_id]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'save-product':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $id = $input['id'] ?? uniqid('prod_');
            $stmt = $pdo->prepare("REPLACE INTO products (id, tenant_id, name, price, category, description, image_url, views, sales, conversion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $tenant_id, $input['name'], $input['price'], $input['category'], $input['description'], $input['image'] ?? $input['image_url'], $input['views'], $input['sales'], $input['conversion']]);
            echo json_encode(["success" => true]);
            break;

        case 'get-campaigns':
            $stmt = $pdo->prepare("SELECT * FROM campaigns WHERE tenant_id = ?");
            $stmt->execute([$tenant_id]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'save-campaign':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $id = $input['id'] ?? uniqid('camp_');
            $stmt = $pdo->prepare("REPLACE INTO campaigns (id, tenant_id, name, target_status, product_id, product_name, template, scheduled_at, status, total_leads, sent_leads, conversions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $tenant_id, $input['name'], $input['targetStatus'], $input['productId'], $input['productName'], $input['template'], $input['scheduledAt'], $input['status'], $input['totalLeads'], $input['sentLeads'], $input['conversions']]);
            echo json_encode(["success" => true]);
            break;

        // --- INTEGRATIONS & CONFIG ---
        case 'get-integrations':
            $stmt = $pdo->prepare("SELECT * FROM integrations WHERE tenant_id = ?");
            $stmt->execute([$tenant_id]);
            $res = $stmt->fetchAll();
            // Decode keys apenas para o frontend saber que existem (mas cuidado com chaves reais)
            foreach($res as &$r) $r['keys'] = json_decode($r['config_json'], true)['keys'] ?? [];
            echo json_encode($res);
            break;

        case 'save-integration':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $id = $input['id'] ?? uniqid('int_');
            // Estrutura segura de JSON
            $configJson = json_encode(['keys' => $input['keys'], 'name' => $input['name'], 'baseUrl' => $input['name'], 'apiKey' => $input['keys']['apiKey'] ?? '']);
            $stmt = $pdo->prepare("REPLACE INTO integrations (id, tenant_id, provider, name, config_json, status, last_sync) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $tenant_id, $input['provider'], $input['name'], $configJson, $input['status'], $input['lastSync']]);
            echo json_encode(["success" => true]);
            break;

        case 'get-branding':
            $stmt = $pdo->prepare("SELECT config_json FROM branding WHERE tenant_id = ?");
            $stmt->execute([$tenant_id]);
            $res = $stmt->fetch();
            echo $res ? $res['config_json'] : '{}';
            break;

        case 'save-branding':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = file_get_contents('php://input'); // Raw JSON
            $stmt = $pdo->prepare("REPLACE INTO branding (tenant_id, config_json) VALUES (?, ?)");
            $stmt->execute([$tenant_id, $input]);
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
