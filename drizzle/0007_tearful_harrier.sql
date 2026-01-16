CREATE TABLE `ai_recommendation_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookId` int,
	`recommendationType` varchar(50) NOT NULL,
	`recommendationData` json,
	`confidenceScore` decimal(3,2),
	`userRating` int,
	`userFeedback` text,
	`wasUsed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_recommendation_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `book_success_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`amazonBSR` int,
	`kindleBSR` int,
	`categoryRanks` json,
	`reviewCount` int DEFAULT 0,
	`averageRating` decimal(2,1),
	`estimatedSales` int,
	`currentPrice` decimal(5,2),
	`publishedCategories` json,
	`publishedKeywords` json,
	`publishedTitle` varchar(500),
	`publishedGenre` varchar(100),
	`publishedCoverStyle` varchar(50),
	`snapshotDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `book_success_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `success_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patternType` varchar(50) NOT NULL,
	`patternValue` varchar(500) NOT NULL,
	`genre` varchar(100),
	`successCount` int DEFAULT 0,
	`averageBSR` int,
	`averageRating` decimal(2,1),
	`averageSales` int,
	`confidenceLevel` decimal(3,2),
	`sampleSize` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `success_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_recommendation_feedback` ADD CONSTRAINT `ai_recommendation_feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_recommendation_feedback` ADD CONSTRAINT `ai_recommendation_feedback_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_success_metrics` ADD CONSTRAINT `book_success_metrics_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;