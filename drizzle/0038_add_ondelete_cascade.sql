ALTER TABLE `session` DROP FOREIGN KEY `session_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `sucursalToAddress` DROP FOREIGN KEY `sucursalToAddress_sucursalId_sucursales_sucursalId_fk`;
--> statement-breakpoint
ALTER TABLE `sucursalToAddress` DROP FOREIGN KEY `sucursalToAddress_addressId_addresses_addressId_fk`;
--> statement-breakpoint
ALTER TABLE `trackings` DROP FOREIGN KEY `trackings_facturaId_facturas_facturaId_fk`;
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sucursalToAddress` ADD CONSTRAINT `sucursalToAddress_sucursalId_sucursales_sucursalId_fk` FOREIGN KEY (`sucursalId`) REFERENCES `sucursales`(`sucursalId`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sucursalToAddress` ADD CONSTRAINT `sucursalToAddress_addressId_addresses_addressId_fk` FOREIGN KEY (`addressId`) REFERENCES `addresses`(`addressId`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trackings` ADD CONSTRAINT `trackings_facturaId_facturas_facturaId_fk` FOREIGN KEY (`facturaId`) REFERENCES `facturas`(`facturaId`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sucursal_address_sucursal_idx` ON `sucursalToAddress` (`sucursalId`);--> statement-breakpoint
CREATE INDEX `sucursal_address_address_idx` ON `sucursalToAddress` (`addressId`);