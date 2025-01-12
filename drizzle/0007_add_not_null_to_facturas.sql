ALTER TABLE `facturas` MODIFY COLUMN `casillero` int NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` MODIFY COLUMN `fecha` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` MODIFY COLUMN `pagado` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` MODIFY COLUMN `clienteId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` MODIFY COLUMN `metodoDePago` varchar(15) NOT NULL DEFAULT 'nulo';--> statement-breakpoint
ALTER TABLE `facturas` MODIFY COLUMN `empleadoId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` MODIFY COLUMN `retirados` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` MODIFY COLUMN `enviado` boolean NOT NULL;