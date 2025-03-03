ALTER TABLE `reportes` MODIFY COLUMN `sucursalId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `archivado` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `archivadoAt` timestamp;