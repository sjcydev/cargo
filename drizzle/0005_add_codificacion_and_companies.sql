CREATE TABLE `companies` (
	`companyId` int AUTO_INCREMENT NOT NULL,
	`company` varchar(255) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_companyId` PRIMARY KEY(`companyId`)
);
--> statement-breakpoint
ALTER TABLE `facturas` ADD `empleadoId` varchar(255);--> statement-breakpoint
ALTER TABLE `facturas` ADD `updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `reportes` ADD `empleadoId` varchar(255);--> statement-breakpoint
ALTER TABLE `reportes` ADD `createdAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `reportes` ADD `updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `sucursales` ADD `codificacion` varchar(4) NOT NULL;--> statement-breakpoint
ALTER TABLE `sucursales` ADD `company` int;--> statement-breakpoint
ALTER TABLE `trackings` ADD `updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `company` int;--> statement-breakpoint
ALTER TABLE `users` ADD `updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_empleadoId_users_id_fk` FOREIGN KEY (`empleadoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_empleadoId_users_id_fk` FOREIGN KEY (`empleadoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sucursales` ADD CONSTRAINT `sucursales_company_companies_companyId_fk` FOREIGN KEY (`company`) REFERENCES `companies`(`companyId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_company_companies_companyId_fk` FOREIGN KEY (`company`) REFERENCES `companies`(`companyId`) ON DELETE no action ON UPDATE no action;