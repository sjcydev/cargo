ALTER TABLE `sucursales` MODIFY COLUMN `precio` float NOT NULL DEFAULT 2.75;--> statement-breakpoint
ALTER TABLE `facturas` ADD `enviado` boolean DEFAULT false;