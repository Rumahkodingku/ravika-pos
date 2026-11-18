CREATE TABLE `product_images` (
	`product_id` text PRIMARY KEY NOT NULL,
	`mime_type` text NOT NULL,
	`data` blob NOT NULL,
	`file_size` integer NOT NULL,
	`checksum` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "product_images_file_size_check" CHECK("product_images"."file_size" > 0 AND "product_images"."file_size" <= 5242880)
);
