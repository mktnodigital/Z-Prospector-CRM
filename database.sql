
-- Z-PROSPECTOR MASTER SCHEMA v1.2

-- 1. Tabela de Tenants (Empresas/Unidades)
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `subdomain` varchar(100) DEFAULT NULL,
  `status` enum('ONLINE','OFFLINE','WARNING') DEFAULT 'ONLINE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabela de Usuários (Autenticação)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','TENANT_ADMIN','MANAGER','AGENT') DEFAULT 'AGENT',
  `avatar` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_tenant_user` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabela de Branding (Customização Visual)
CREATE TABLE IF NOT EXISTS `branding` (
  `tenant_id` int(11) NOT NULL,
  `config_json` longtext NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabela de Leads (CRM)
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
  `last_interaction` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_leads` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabela de Produtos/Ofertas
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_products` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `lead_name` varchar(255) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `status` varchar(50) DEFAULT 'CONFIRMED',
  `is_ia` boolean DEFAULT false,
  `value` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_appts` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabela de Workflows N8n
CREATE TABLE IF NOT EXISTS `n8n_workflows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `webhook_url` varchar(500) NOT NULL,
  `event` varchar(100) NOT NULL,
  `status` enum('ACTIVE','PAUSED') DEFAULT 'ACTIVE',
  `hits` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_n8n` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSERÇÕES INICIAIS
INSERT INTO `tenants` (`id`, `name`, `status`) VALUES (1, 'Master Unit', 'ONLINE');
INSERT INTO `users` (`tenant_id`, `name`, `email`, `password`, `role`) VALUES (1, 'Operador Master', 'master@zprospector.com', 'admin123', 'SUPER_ADMIN');
