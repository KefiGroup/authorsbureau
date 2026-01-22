CREATE TABLE `bookStructures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blueprintId` int NOT NULL,
	`hasPrologue` boolean NOT NULL DEFAULT false,
	`hasDedication` boolean NOT NULL DEFAULT false,
	`hasAcknowledgements` boolean NOT NULL DEFAULT false,
	`hasEpilogue` boolean NOT NULL DEFAULT false,
	`hasAuthorBio` boolean NOT NULL DEFAULT true,
	`hasAlsoBy` boolean NOT NULL DEFAULT false,
	`hasNewsletter` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookStructures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookStructures` ADD CONSTRAINT `bookStructures_blueprintId_storyBlueprints_id_fk` FOREIGN KEY (`blueprintId`) REFERENCES `storyBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;