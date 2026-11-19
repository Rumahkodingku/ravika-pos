-- shortcut: ALTER TABLE avoids a foreign-key-unsafe table rebuild; revisit if SQLite requires table-level constraint changes.
ALTER TABLE `orders` ADD COLUMN `cash_tendered` integer CHECK (`cash_tendered` IS NULL OR `cash_tendered` >= `grand_total`);
