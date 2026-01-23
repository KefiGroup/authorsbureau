CREATE TABLE `chapterEdits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`manuscriptId` int NOT NULL,
	`userMessage` text NOT NULL,
	`aiResponse` mediumtext NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chapterEdits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manuscripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blueprintId` int NOT NULL,
	`sectionType` enum('prologue','chapter','epilogue','dedication','acknowledgements','authorBio','alsoBy','newsletter') NOT NULL,
	`sectionNumber` int,
	`sectionTitle` varchar(500),
	`content` mediumtext,
	`status` enum('pending','generating','draft','approved') NOT NULL DEFAULT 'pending',
	`wordCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manuscripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chapterEdits` ADD CONSTRAINT `chapterEdits_manuscriptId_manuscripts_id_fk` FOREIGN KEY (`manuscriptId`) REFERENCES `manuscripts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manuscripts` ADD CONSTRAINT `manuscripts_blueprintId_storyBlueprints_id_fk` FOREIGN KEY (`blueprintId`) REFERENCES `storyBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;