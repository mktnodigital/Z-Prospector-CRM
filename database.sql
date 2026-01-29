
-- Tabela de Branding (Configurações Visuais Master)
CREATE TABLE IF NOT EXISTS `branding` (
  `tenant_id` int(11) NOT NULL,
  `config_json` longtext NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Usuários (Perfil Master)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'SUPER_ADMIN',
  `avatar` longtext,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` enum('COLD','WARM','HOT') DEFAULT 'COLD',
  `stage` varchar(50) DEFAULT 'NEW',
  `value` decimal(10,2) DEFAULT 0.00,
  `source` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` varchar(50) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `client` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `type_id` enum('PIX','CREDIT_CARD') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `status` enum('PAID','PENDING','FAILED') DEFAULT 'PENDING',
  `is_withdraw` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_trans_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` varchar(50) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `lead_name` varchar(255) NOT NULL,
  `time` varchar(10) NOT NULL,
  `date` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `service` varchar(255) NOT NULL,
  `service_id` varchar(50) DEFAULT NULL,
  `value` decimal(10,2) DEFAULT 0.00,
  `status` varchar(20) DEFAULT 'CONFIRMED',
  `ia_scheduled` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_appt_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(50) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text,
  `image_url` longtext,
  `views` int(11) DEFAULT 0,
  `sales` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_prod_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Campanhas
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` varchar(50) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `target_status` varchar(50) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `template` text,
  `scheduled_at` varchar(50) DEFAULT NULL,
  `status` enum('IDLE','SENDING','COMPLETED','PAUSED') DEFAULT 'IDLE',
  `total_leads` int(11) DEFAULT 0,
  `sent_leads` int(11) DEFAULT 0,
  `conversions` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_camp_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Integrações (Gateways de Pagamento e APIs)
CREATE TABLE IF NOT EXISTS `integrations` (
  `id` varchar(50) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `config_json` longtext NOT NULL, -- Armazena chaves criptografadas/JSON
  `status` enum('CONNECTED','DISCONNECTED') DEFAULT 'CONNECTED',
  `last_sync` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_int_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Webhooks Inbound (Captação)
CREATE TABLE IF NOT EXISTS `webhooks` (
  `id` varchar(50) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `event` varchar(100) NOT NULL,
  `status` enum('ACTIVE','PAUSED') DEFAULT 'ACTIVE',
  `hits` int(11) DEFAULT 0,
  `last_hit` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_wh_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserir Dados Iniciais Obrigatórios
INSERT INTO `branding` (`tenant_id`, `config_json`) VALUES (1, '{"appName":"Z-Prospector","fullLogo":"Logotipo%20Z_Prospector.png","fullLogoDark":"Logotipo%20Z_Prospector.png","iconLogo":"Logotipo%20Z_Prospector_Icon.png","iconLogoDark":"Logotipo%20Z_Prospector_Icon.png","favicon":"Logotipo%20Z_Prospector_Icon.png","salesPageLogo":"Logotipo%20Z_Prospector.png"}') ON DUPLICATE KEY UPDATE tenant_id=tenant_id;

INSERT INTO `users` (`tenant_id`, `name`, `email`, `role`) VALUES (1, 'Operador Master', 'admin@zprospector.com.br', 'SUPER_ADMIN') ON DUPLICATE KEY UPDATE tenant_id=tenant_id;
