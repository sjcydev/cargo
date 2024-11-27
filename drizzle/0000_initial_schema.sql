CREATE TABLE `facturas` (
	`facturaId` int AUTO_INCREMENT NOT NULL,
	`casillero` int,
	`fecha` varchar(50),
	`pagado` boolean DEFAULT false,
	`clienteId` int,
	`total` float DEFAULT 0,
	`metodoDePago` varchar(15) DEFAULT 'nulo',
	`createdAt` timestamp DEFAULT (now()),
	`pagadoAt` timestamp,
	`retirados` boolean DEFAULT false,
	CONSTRAINT `facturas_facturaId` PRIMARY KEY(`facturaId`)
);
--> statement-breakpoint
CREATE TABLE `reportes` (
	`reporteId` int AUTO_INCREMENT NOT NULL,
	`fechaInicial` datetime,
	`fechaFinal` datetime,
	`facturas` int,
	`total` float,
	`metodoDePago` json,
	CONSTRAINT `reportes_reporteId` PRIMARY KEY(`reporteId`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sucursales` (
	`sucursalId` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255),
	`precio` float DEFAULT 2.75,
	CONSTRAINT `sucursales_sucursalId` PRIMARY KEY(`sucursalId`)
);
--> statement-breakpoint
CREATE TABLE `trackings` (
	`trackingId` int AUTO_INCREMENT NOT NULL,
	`facturaId` int,
	`numeroTracking` varchar(255),
	`peso` int,
	`base` float,
	`precio` float,
	`retirado` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `trackings_trackingId` PRIMARY KEY(`trackingId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`nombre` varchar(100),
	`apellido` varchar(100),
	`username` varchar(100),
	`passwordHash` varchar(255) NOT NULL,
	`passwordUpdated` boolean DEFAULT false,
	`correo` varchar(255) NOT NULL,
	`rol` varchar(10) DEFAULT 'EMPLEADO',
	`sucursalId` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`apellido` varchar(100) NOT NULL,
	`cedula` varchar(20) NOT NULL,
	`telefono` varchar(25) NOT NULL,
	`casillero` int,
	`sucursalId` int,
	`nacimiento` timestamp DEFAULT (now()),
	`correo` varchar(255) NOT NULL,
	`sexo` varchar(9) DEFAULT 'Otros',
	`precio` float DEFAULT 2.75,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usuarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuarios_casillero_unique` UNIQUE(`casillero`)
);
--> statement-breakpoint
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_clienteId_usuarios_id_fk` FOREIGN KEY (`clienteId`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trackings` ADD CONSTRAINT `trackings_facturaId_facturas_facturaId_fk` FOREIGN KEY (`facturaId`) REFERENCES `facturas`(`facturaId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_sucursalId_sucursales_sucursalId_fk` FOREIGN KEY (`sucursalId`) REFERENCES `sucursales`(`sucursalId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_sucursalId_sucursales_sucursalId_fk` FOREIGN KEY (`sucursalId`) REFERENCES `sucursales`(`sucursalId`) ON DELETE no action ON UPDATE no action;