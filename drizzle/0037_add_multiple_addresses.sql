CREATE TABLE `addresses` (
	`addressId` int AUTO_INCREMENT NOT NULL,
	`address1` varchar(500) NOT NULL,
	`address2` varchar(500),
	`zipcode` varchar(15) NOT NULL,
	`city` varchar(100) NOT NULL,
	`country` varchar(60) NOT NULL,
	`tel` varchar(100) NOT NULL,
	CONSTRAINT `addresses_addressId` PRIMARY KEY(`addressId`)
);
--> statement-breakpoint
CREATE TABLE `sucursalToAddress` (
	`sucursalId` int NOT NULL,
	`addressId` int NOT NULL,
	CONSTRAINT `sucursalToAddress_sucursalId_addressId_pk` PRIMARY KEY(`sucursalId`,`addressId`)
);
--> statement-breakpoint
ALTER TABLE `sucursalToAddress` ADD CONSTRAINT `sucursalToAddress_sucursalId_sucursales_sucursalId_fk` FOREIGN KEY (`sucursalId`) REFERENCES `sucursales`(`sucursalId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sucursalToAddress` ADD CONSTRAINT `sucursalToAddress_addressId_addresses_addressId_fk` FOREIGN KEY (`addressId`) REFERENCES `addresses`(`addressId`) ON DELETE no action ON UPDATE no action;