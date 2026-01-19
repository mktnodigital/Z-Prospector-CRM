-- Tabela de Branding (Configurações Visuais Master)
CREATE TABLE IF NOT EXISTS `branding` (
  `tenant_id` int(11) NOT NULL,
  `config_json` longtext NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`tenant_id`)
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

-- Inserir Branding Padrão (Tenant ID 0 ou 1)
INSERT INTO `branding` (`tenant_id`, `config_json`) VALUES (1, '{"appName":"Z-Prospector","fullLogo":"Logotipo%20Z_Prospector.png","fullLogoDark":"Logotipo%20Z_Prospector.png","iconLogo":"Logotipo%20Z_Prospector_Icon.png","iconLogoDark":"Logotipo%20Z_Prospector_Icon.png","favicon":"Logotipo%20Z_Prospector_Icon.png","salesPageLogo":"Logotipo%20Z_Prospector.png"}') 
ON DUPLICATE KEY UPDATE tenant_id=tenant_id;