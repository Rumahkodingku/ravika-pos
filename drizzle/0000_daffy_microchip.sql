CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`label` text NOT NULL,
	`group_name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_code_unique` ON `permissions` (`code`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `role_permissions_permission_id_idx` ON `role_permissions` (`permission_id`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_business_code_unique` ON `roles` (`business_id`,`code`);--> statement-breakpoint
CREATE INDEX `roles_business_id_idx` ON `roles` (`business_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`revoked_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`role_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_business_id_idx` ON `users` (`business_id`);--> statement-breakpoint
CREATE INDEX `users_role_id_idx` ON `users` (`role_id`);--> statement-breakpoint
CREATE TABLE `business` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_code_unique` ON `business` (`code`);--> statement-breakpoint
CREATE TABLE `add_ons` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "add_ons_price_check" CHECK("add_ons"."price" >= 0)
);
--> statement-breakpoint
CREATE INDEX `add_ons_business_id_idx` ON `add_ons` (`business_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `categories_business_id_idx` ON `categories` (`business_id`);--> statement-breakpoint
CREATE INDEX `categories_sort_order_idx` ON `categories` (`sort_order`);--> statement-breakpoint
CREATE TABLE `product_add_ons` (
	`product_id` text NOT NULL,
	`add_on_id` text NOT NULL,
	`is_required` integer DEFAULT false NOT NULL,
	`min_selection` integer DEFAULT 0 NOT NULL,
	`max_selection` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`product_id`, `add_on_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`add_on_id`) REFERENCES `add_ons`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "product_add_ons_min_check" CHECK("product_add_ons"."min_selection" >= 0),
	CONSTRAINT "product_add_ons_max_check" CHECK("product_add_ons"."max_selection" >= 1),
	CONSTRAINT "product_add_ons_range_check" CHECK("product_add_ons"."min_selection" <= "product_add_ons"."max_selection")
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`price_adjustment` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_product_name_unique` ON `product_variants` (`product_id`,`name`);--> statement-breakpoint
CREATE INDEX `product_variants_product_id_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`image_path` text,
	`base_price` integer NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "products_base_price_check" CHECK("products"."base_price" >= 0)
);
--> statement-breakpoint
CREATE INDEX `products_business_id_idx` ON `products` (`business_id`);--> statement-breakpoint
CREATE INDEX `products_category_id_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE TABLE `tables` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'AVAILABLE' NOT NULL,
	`qr_token_hash` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "tables_status_check" CHECK("tables"."status" IN ('AVAILABLE', 'OCCUPIED', 'INACTIVE'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tables_name_unique` ON `tables` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tables_qr_token_hash_unique` ON `tables` (`qr_token_hash`);--> statement-breakpoint
CREATE TABLE `order_item_add_ons` (
	`id` text PRIMARY KEY NOT NULL,
	`order_item_id` text NOT NULL,
	`add_on_id` text,
	`add_on_name_snapshot` text NOT NULL,
	`price_snapshot` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`add_on_id`) REFERENCES `add_ons`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "order_item_add_ons_price_check" CHECK("order_item_add_ons"."price_snapshot" >= 0),
	CONSTRAINT "order_item_add_ons_quantity_check" CHECK("order_item_add_ons"."quantity" >= 1)
);
--> statement-breakpoint
CREATE INDEX `order_item_add_ons_order_item_id_idx` ON `order_item_add_ons` (`order_item_id`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`product_name_snapshot` text NOT NULL,
	`variant_name_snapshot` text,
	`quantity` integer NOT NULL,
	`unit_price_snapshot` integer NOT NULL,
	`add_on_total_snapshot` integer DEFAULT 0 NOT NULL,
	`line_total` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "order_items_quantity_check" CHECK("order_items"."quantity" >= 1),
	CONSTRAINT "order_items_unit_price_check" CHECK("order_items"."unit_price_snapshot" >= 0),
	CONSTRAINT "order_items_add_on_total_check" CHECK("order_items"."add_on_total_snapshot" >= 0),
	CONSTRAINT "order_items_line_total_check" CHECK("order_items"."line_total" >= 0)
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`previous_status` text,
	`new_status` text NOT NULL,
	`changed_by` text,
	`reason` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `order_status_history_order_id_idx` ON `order_status_history` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_status_history_created_at_idx` ON `order_status_history` (`created_at`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`order_number` text NOT NULL,
	`order_type` text NOT NULL,
	`source` text NOT NULL,
	`table_id` text,
	`order_status` text DEFAULT 'NEW' NOT NULL,
	`payment_status` text DEFAULT 'UNPAID' NOT NULL,
	`public_token` text,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`discount_total` integer DEFAULT 0 NOT NULL,
	`grand_total` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_by` text,
	`idempotency_key` text,
	`completed_at` integer,
	`cancelled_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "orders_status_check" CHECK("orders"."order_status" IN ('NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
	CONSTRAINT "orders_payment_status_check" CHECK("orders"."payment_status" IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED')),
	CONSTRAINT "orders_type_table_check" CHECK(("orders"."order_type" = 'TAKEAWAY' AND "orders"."table_id" IS NULL) OR ("orders"."order_type" = 'DINE_IN' AND "orders"."table_id" IS NOT NULL)),
	CONSTRAINT "orders_subtotal_check" CHECK("orders"."subtotal" >= 0),
	CONSTRAINT "orders_discount_check" CHECK("orders"."discount_total" >= 0),
	CONSTRAINT "orders_grand_total_check" CHECK("orders"."grand_total" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_public_token_unique` ON `orders` (`public_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_unique` ON `orders` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `orders_business_id_idx` ON `orders` (`business_id`);--> statement-breakpoint
CREATE INDEX `orders_created_at_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `orders_order_status_idx` ON `orders` (`order_status`);--> statement-breakpoint
CREATE INDEX `orders_payment_status_idx` ON `orders` (`payment_status`);--> statement-breakpoint
CREATE INDEX `orders_table_id_idx` ON `orders` (`table_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`method` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'RECORDED' NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`recorded_by` text NOT NULL,
	`paid_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "payments_amount_check" CHECK("payments"."amount" > 0),
	CONSTRAINT "payments_status_check" CHECK("payments"."status" IN ('RECORDED', 'REFUNDED'))
);
--> statement-breakpoint
CREATE INDEX `payments_order_id_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `payments_paid_at_idx` ON `payments` (`paid_at`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `audit_logs_business_id_idx` ON `audit_logs` (`business_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_resource_idx` ON `audit_logs` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE TABLE `backup_records` (
	`id` text PRIMARY KEY NOT NULL,
	`file_name` text NOT NULL,
	`file_path` text NOT NULL,
	`file_size` integer NOT NULL,
	`checksum` text NOT NULL,
	`status` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "backup_records_file_size_check" CHECK("backup_records"."file_size" >= 0),
	CONSTRAINT "backup_records_status_check" CHECK("backup_records"."status" IN ('READY', 'IN_PROGRESS', 'FAILED'))
);
--> statement-breakpoint
CREATE INDEX `backup_records_created_at_idx` ON `backup_records` (`created_at`);--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` text PRIMARY KEY NOT NULL,
	`business_identifier` text NOT NULL,
	`installation_id` text NOT NULL,
	`license_payload` text NOT NULL,
	`issued_at` integer NOT NULL,
	`expires_at` integer,
	`status` text NOT NULL,
	`signature` text NOT NULL,
	`public_key_fingerprint` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "licenses_status_check" CHECK("licenses"."status" IN ('VALID', 'EXPIRING', 'INVALID'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `licenses_installation_id_unique` ON `licenses` (`installation_id`);