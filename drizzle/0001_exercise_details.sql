ALTER TABLE `exercises` ADD `name_en` text;--> statement-breakpoint
ALTER TABLE `exercises` ADD `secondary_muscle_groups` text DEFAULT '[]' NOT NULL;