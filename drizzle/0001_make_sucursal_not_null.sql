ALTER TABLE `sucursales` MODIFY COLUMN `nombre` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `sucursalId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `usuarios` MODIFY COLUMN `sucursalId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` ADD `sucursalId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `reportes` ADD `sucursalId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_sucursalId_sucursales_sucursalId_fk` FOREIGN KEY (`sucursalId`) REFERENCES `sucursales`(`sucursalId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_sucursalId_sucursales_sucursalId_fk` FOREIGN KEY (`sucursalId`) REFERENCES `sucursales`(`sucursalId`) ON DELETE no action ON UPDATE no action;