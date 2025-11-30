ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_codificacion_unique` UNIQUE(`codificacion`);--> statement-breakpoint
CREATE INDEX `usuarios_codificacion_idx` ON `usuarios` (`codificacion`);