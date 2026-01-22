CREATE TABLE `storyBlueprints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int,
	`userId` int NOT NULL,
	`projectType` enum('novel','novella','short_story','memoir','non_fiction','childrens_book') NOT NULL,
	`workingTitle` varchar(500),
	`targetLength` varchar(100),
	`primaryGenre` varchar(100),
	`secondaryGenre` varchar(100),
	`corePremise` text,
	`timePeriod` varchar(255),
	`location` varchar(255),
	`pointOfView` varchar(50),
	`protagonistData` json,
	`supportingCharacters` json,
	`plotStructure` json,
	`settingData` json,
	`audienceData` json,
	`thematicElements` json,
	`conversationHistory` json,
	`blueprintGenerated` boolean DEFAULT false,
	`blueprintContent` mediumtext,
	`version` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storyBlueprints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `storyBlueprints` ADD CONSTRAINT `storyBlueprints_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `storyBlueprints` ADD CONSTRAINT `storyBlueprints_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;