CREATE TABLE `client_auth_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_email` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_auth_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_auth_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `client_device_sessions` (
	`id` varchar(255) NOT NULL,
	`client_id` int NOT NULL,
	`user_agent` text,
	`last_active` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_device_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `client_device_sessions` ADD CONSTRAINT `client_device_sessions_client_id_usuarios_id_fk` FOREIGN KEY (`client_id`) REFERENCES `usuarios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `client_auth_tokens_token_idx` ON `client_auth_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `client_auth_tokens_email_idx` ON `client_auth_tokens` (`client_email`);--> statement-breakpoint
CREATE INDEX `client_sessions_client_idx` ON `client_device_sessions` (`client_id`);--> statement-breakpoint
CREATE INDEX `client_sessions_expiry_idx` ON `client_device_sessions` (`expires_at`);
