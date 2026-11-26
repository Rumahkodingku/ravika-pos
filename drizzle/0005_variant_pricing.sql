CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`image_path` text,
	`base_price` integer,
	`is_available` integer DEFAULT true NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "products_base_price_check" CHECK("base_price" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "business_id", "category_id", "name", "description", "image_path", "base_price", "is_available", "is_active", "created_at", "updated_at") SELECT "id", "business_id", "category_id", "name", "description", "image_path", "base_price", "is_available", "is_active", "created_at", "updated_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE INDEX `products_business_id_idx` ON `products` (`business_id`);--> statement-breakpoint
CREATE INDEX `products_category_id_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE TABLE `__new_product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "product_variants_price_check" CHECK("price" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_product_variants`("id", "product_id", "name", "price", "is_active") SELECT "id", "product_id", "name", (SELECT "base_price" FROM `products` WHERE `products`.`id` = `product_variants`.`product_id`) + "price_adjustment", "is_active" FROM `product_variants`;--> statement-breakpoint
DROP TABLE `product_variants`;--> statement-breakpoint
ALTER TABLE `__new_product_variants` RENAME TO `product_variants`;--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_product_name_unique` ON `product_variants` (`product_id`,`name`);--> statement-breakpoint
CREATE INDEX `product_variants_product_id_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
UPDATE `products` SET `base_price` = NULL WHERE EXISTS (SELECT 1 FROM `product_variants` WHERE `product_variants`.`product_id` = `products`.`id`);
