
<?php
/**
 * ZPROSPECTOR - SaaS Core API
 * Architecture: Monolithic PHP with Session-Based Authentication
 * Security: IDOR Protection, SQL Injection Protection, Password Hashing
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

function jsonExceptionHandler($e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode([
        "success" => false, 
        "error" => "Internal Server Error", 
        "details" => "Consulte os logs do servidor."
    ]);
    exit;
}
set_exception_handler('jsonExceptionHandler');

// DB Connection
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
    echo json_encode(["success" => false, "error" => "Database Unavailable"]);
    exit;
}

// === AUTH & SECURITY LAYER ===

function getJsonInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) return [];
    return $input;
}

$action = $_GET['action'] ?? 'health-check';
$public_actions = ['health-check', 'login', 'sys-provision-tenant'];

// Autenticação de Sessão (Bearer Token)
$current_user = null;
$tenant_id = 0;

if (!in_array($action, $public_actions)) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        // Verifica token e validade no banco
        $stmt = $pdo->prepare("SELECT u.id, u.tenant_id, u.role FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()");
        $stmt->execute([$token]);
        $current_user = $stmt->fetch();
        
        if ($current_user) {
            // SEGURANÇA CRÍTICA: Sobrescreve o tenant_id da requisição pelo real do usuário.
            // Isso impede que um usuário acesse dados de outro tenant manipulando headers.
            $tenant_id = $current_user['tenant_id'];
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Sessão inválida ou expirada"]);
            exit;
        }
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Token não fornecido"]);
        exit;
    }
}

// === API ROUTES ===

try {
    switch ($action) {
        case 'health-check':
            echo json_encode(["success" => true, "status" => "Online"]);
            break;

        case 'login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            $input = getJsonInput();
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';

            $stmt = $pdo->prepare("SELECT id, name, email, role, password, tenant_id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            // Password Verify (Bcrypt) + Fallback MD5 para migração
            $valid = false;
            if ($user) {
                if (password_verify($password, $user['password'])) {
                    $valid = true;
                } elseif (md5($password) === $user['password']) {
                    // Migrar MD5 para Bcrypt automaticamente no primeiro login
                    $newHash = password_hash($password, PASSWORD_DEFAULT);
                    $upd = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                    $upd->execute([$newHash, $user['id']]);
                    $valid = true;
                }
            }

            if ($valid) {
                // Criar Sessão Segura
                $token = bin2hex(random_bytes(32));
                $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
                
                $sess = $pdo->prepare("INSERT INTO user_sessions (token, user_id, tenant_id, expires_at) VALUES (?, ?, ?, ?)");
                $sess->execute([$token, $user['id'], $user['tenant_id'], $expires]);
                
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

        // PROXY EVOLUTION API (Segurança: Esconde chaves do Frontend)
        case 'proxy-evolution':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;
            // Busca credenciais do Tenant no Banco
            $stmt = $pdo->prepare("SELECT config_json FROM integrations WHERE tenant_id = ? AND provider = 'SYSTEM_EVOLUTION' LIMIT 1");
            $stmt->execute([$tenant_id]);
            $integ = $stmt->fetch();
            
            if (!$integ) {
                echo json_encode(["success" => false, "error" => "Integração não configurada"]);
                exit;
            }
            
            $config = json_decode($integ['config_json'], true);
            $baseUrl = "https://api.clikai.com.br"; // Default ou do banco se estiver no campo name
            $apiKey = $config['apiKey'] ?? '';
            
            $input = getJsonInput();
            $endpoint = $input['endpoint'] ?? ''; // ex: /message/sendText
            $payload = $input['payload'] ?? [];
            
            // Forward Request
            $ch = curl_init($baseUrl . $endpoint);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Content-Type: application/json",
                "apikey: " . $apiKey
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
            
            echo $response;
            break;

        case 'get-current-tenant':
            $stmt = $pdo->prepare("SELECT * FROM tenants WHERE id = ? LIMIT 1");
            $stmt->execute([$tenant_id]);
            $t = $stmt->fetch();
            if ($t) {
                echo json_encode($t);
            } else {
                echo json_encode(['id' => $tenant_id, 'name' => 'Unidade Desconhecida', 'status' => 'OFFLINE']);
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
            $stmt = $pdo->prepare("SELECT id, tenant_id, name, email, role, avatar FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$current_user['id']]); // Usa ID da sessão
            echo json_encode($stmt->fetch());
            break;

        case 'get-leads':
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 500");
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

        // ... Mantenha as outras rotas (get-messages, save-message, financeiro), 
        // mas SEMPRE usando $tenant_id derivado da sessão, nunca do input $_GET/POST direto.
        
        default:
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Endpoint desconhecido"]);
            break;
    }
} catch (Exception $e) {
    jsonExceptionHandler($e);
}
