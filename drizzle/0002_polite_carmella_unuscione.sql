CREATE TABLE `publishingDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`currentStep` varchar(50) NOT NULL,
	`completionPercentage` int DEFAULT 0,
	`manuscript` text,
	`wordCount` int DEFAULT 0,
	`aiAnalysis` json,
	`selectedTitle` varchar(500),
	`selectedSubtitle` varchar(500),
	`description` text,
	`categories` json,
	`keywords` json,
	`coverUrl` varchar(500),
	`generatedCovers` json,
	`isbnChoice` varchar(100),
	`isbnNumber` varchar(20),
	`lastSavedStep` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publishingDrafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `publishingDrafts` ADD CONSTRAINT `publishingDrafts_authorId_authors_id_fk` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE cascade ON UPDATE no action;