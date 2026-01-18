<?php
/**
 * ZPROSPECTOR - SaaS Core API
 * Cloud Native Backend (Google Cloud Run Ready)
 */

// 1. Configurações de Erro e Cabeçalhos
// Em produção no GCP, queremos logar erros no stdout para o Cloud Logging, não na tela.
error_reporting(E_ALL);
ini_set('display_errors', 0); 
ini_set('log_errors', 1);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); // Em produção, restrinja isso ao domínio do frontend
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Tenant-ID");

// Trata pre-flight do CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Credenciais do Banco de Dados (Via Variáveis de Ambiente)
// Isso permite conectar ao Cloud SQL sem expor senhas no código
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'zprospector_db';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';
$dbSocket = getenv('DB_SOCKET_PATH'); // Para conexão via Unix Socket no Cloud Run

$dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
if ($dbSocket) {
    // No Cloud Run, conectamos via socket: /cloudsql/PROJECT:REGION:INSTANCE
    $dsn = "mysql:unix_socket={$dbSocket};dbname={$dbName};charset=utf8mb4";
}

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    // Log do erro real para o Cloud Logging
    error_log("Database Connection Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erro de conexão com o banco de dados."]);
    exit;
}

// 3. Roteador de Ações
$action = $_GET['action'] ?? 'health-check';
$tenant_id = $_SERVER['HTTP_X_TENANT_ID'] ?? 1;

switch ($action) {
    case 'health-check':
        echo json_encode([
            "success" => true,
            "status" => "Online",
            "environment" => getenv('APP_ENV') ?: 'development',
            "timestamp" => date('Y-m-d H:i:s'),
            "database" => "Connected",
            "tenant_active" => $tenant_id
        ]);
        break;

    case 'get-leads':
        try {
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC");
            $stmt->execute([$tenant_id]);
            $leads = $stmt->fetchAll();
            echo json_encode($leads);
        } catch (Exception $e) {
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Erro ao buscar leads"]);
        }
        break;

    case 'save-lead':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || empty($input['name']) || empty($input['phone'])) {
            echo json_encode(["success" => false, "error" => "Dados inválidos"]);
            exit;
        }

        try {
            $sql = "INSERT INTO leads (tenant_id, name, phone, email, status, stage, value, source) 
                    VALUES (:tid, :name, :phone, :email, :status, :stage, :value, :source)";
            
            $stmt = $pdo->prepare($sql);
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
        } catch (Exception $e) {
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Erro ao salvar lead"]);
        }
        break;

    case 'update-lead-status':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $stmt = $pdo->prepare("UPDATE leads SET status = ?, stage = ? WHERE id = ? AND tenant_id = ?");
            $stmt->execute([
                $input['status'],
                $input['stage'],
                $input['id'],
                $tenant_id
            ]);
            echo json_encode(["success" => true]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Erro ao atualizar status"]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Ação não encontrada"]);
        break;
}
?>