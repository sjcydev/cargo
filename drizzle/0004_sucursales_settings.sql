ALTER TABLE `sucursales` ADD `direccion` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sucursales` ADD `telefono` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sucursales` ADD `createdAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `sucursales` ADD `updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP;