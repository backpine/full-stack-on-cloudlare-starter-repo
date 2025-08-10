CREATE TABLE `destination_evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`account_id` text NOT NULL,
	`destination_url` text NOT NULL,
	`status` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_destination_evaluations_account_time` ON `destination_evaluations` (`account_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `link_clicks` (
	`id` text NOT NULL,
	`account_id` text NOT NULL,
	`country` text,
	`destination` text NOT NULL,
	`clicked_time` numeric NOT NULL,
	`latitude` real,
	`longitude` real
);
--> statement-breakpoint
CREATE INDEX `idx_link_clicks_account_id` ON `link_clicks` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_link_clicks_clicked_time` ON `link_clicks` (`clicked_time`);--> statement-breakpoint
CREATE INDEX `idx_link_clicks_id` ON `link_clicks` (`id`);--> statement-breakpoint
CREATE TABLE `links` (
	`link_id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`destinations` numeric NOT NULL,
	`created` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
