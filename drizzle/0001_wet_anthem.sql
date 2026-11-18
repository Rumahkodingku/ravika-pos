CREATE TABLE `refunds` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	`recorded_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "refunds_amount_check" CHECK("refunds"."amount" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refunds_order_id_unique` ON `refunds` (`order_id`);--> statement-breakpoint
CREATE TABLE `idempotency_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`key` text NOT NULL,
	`operation` text NOT NULL,
	`request_hash` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text NOT NULL,
	`response_status` integer NOT NULL,
	`response_body` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idempotency_keys_business_operation_key_unique` ON `idempotency_keys` (`business_id`,`operation`,`key`);--> statement-breakpoint
CREATE INDEX `idempotency_keys_expires_at_idx` ON `idempotency_keys` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idempotency_keys_resource_idx` ON `idempotency_keys` (`resource_type`,`resource_id`);--> statement-breakpoint
ALTER TABLE `tables` ADD `qr_token_ciphertext` text;--> statement-breakpoint
ALTER TABLE `licenses` ADD `validation_message` text DEFAULT '' NOT NULL;