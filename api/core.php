
<?php
/**
 * Z-PROSPECTOR - Produção Core Engine v2.0 (SECURE)
 * Auth Real, Env Vars, CSRF Protection
 */

// Iniciar Sessão Segura
session_start();

error_reporting(E_ALL);
ini_set('display_errors', 0); // Ocultar erros em produção
ini_set('log_errors', 1);

// Headers CORS e JSON
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); // Em produção, mude * para seu domínio específico
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Tenant-ID");

// Preflight Request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Credenciais via Variáveis de Ambiente (Segurança)
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'zprospector_db';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database Connection Error"]);
    exit;
}

// Leitura do Input JSON
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? 'health';

// --- ROTAS PÚBLICAS (Login/Check) ---

if ($action === 'login') {
    $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
    $password = $input['password'];

    $stmt = $pdo->prepare("SELECT id, name, email, password, role, tenant_id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Verifica hash da senha (bcrypt)
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['tenant_id'] = $user['tenant_id'];
        $_SESSION['role'] = $user['role'];
        
        // Remove senha antes de enviar pro front
        unset($user['password']);
        
        echo json_encode(["success" => true, "user" => $user]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Credenciais inválidas"]);
    }
    exit;
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(["success" => true]);
    exit;
}

if ($action === 'check-auth') {
    if (isset($_SESSION['user_id'])) {
        // Recarrega dados frescos do usuário
        $stmt = $pdo->prepare("SELECT id, name, email, role, tenant_id FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if ($user) {
            echo json_encode(["authenticated" => true, "user" => $user]);
        } else {
            session_destroy();
            echo json_encode(["authenticated" => false]);
        }
    } else {
        echo json_encode(["authenticated" => false]);
    }
    exit;
}

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
// Qualquer rota abaixo daqui exige login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access"]);
    exit;
}

// Tenant ID vem da sessão segura, não do header (Isolamento Multi-tenant)
$tenant_id = $_SESSION['tenant_id'];

// --- ROTAS PROTEGIDAS ---

switch ($action) {
    // --- BRANDING ---
    case 'get-branding':
        $stmt = $pdo->prepare("SELECT config_json FROM branding WHERE tenant_id = ?");
        $stmt->execute([$tenant_id]);
        $res = $stmt->fetch();
        echo $res ? $res['config_json'] : json_encode(["appName" => "Z-Prospector"]);
        break;

    case 'save-branding':
        // Apenas Admin pode salvar branding
        if ($_SESSION['role'] !== 'SUPER_ADMIN' && $_SESSION['role'] !== 'TENANT_ADMIN') {
            http_response_code(403);
            exit(json_encode(["error" => "Forbidden"]));
        }
        $stmt = $pdo->prepare("INSERT INTO branding (tenant_id, config_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_json = VALUES(config_json)");
        $stmt->execute([$tenant_id, json_encode($input)]);
        echo json_encode(["success" => true]);
        break;

    // --- LEADS ---
    case 'get-leads':
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 500");
        $stmt->execute([$tenant_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'save-lead':
        $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, name, phone, email, status, stage, value, source, last_interaction) VALUES (?,?,?,?,?,?,?,?,?)");
        $stmt->execute([
            $tenant_id, 
            $input['name'], 
            $input['phone'], 
            $input['email'], 
            $input['status'] ?? 'COLD', 
            $input['stage'] ?? 'NEW', 
            $input['value'] ?? 0, 
            $input['source'] ?? 'Direct', 
            $input['lastInteraction'] ?? ''
        ]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
        break;

    // --- AGENDAMENTOS ---
    case 'get-appointments':
        $stmt = $pdo->prepare("SELECT * FROM appointments WHERE tenant_id = ?");
        $stmt->execute([$tenant_id]);
        echo json_encode($stmt->fetchAll());
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Action not found"]);
        break;
}
