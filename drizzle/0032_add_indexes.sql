CREATE INDEX `facturas_master_idx` ON `facturas` (`cancelada`,`enviado`,`sucursalId`,`facturaId`);--> statement-breakpoint
CREATE INDEX `facturas_search_idx` ON `facturas` (`casillero`);--> statement-breakpoint
CREATE INDEX `facturas_cliente_idx` ON `facturas` (`clienteId`);--> statement-breakpoint
CREATE INDEX `sucursalIdx` ON `sucursales` (`sucursalId`);--> statement-breakpoint
CREATE INDEX `trackings_factura_idx` ON `trackings` (`facturaId`);--> statement-breakpoint
CREATE INDEX `usuarios_search_idx` ON `usuarios` (`archivado`,`sucursalId`,`casillero`);--> statement-breakpoint
CREATE INDEX `usuarios_text_search_idx` ON `usuarios` (`nombre`,`apellido`,`cedula`);