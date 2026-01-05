CREATE TABLE `amazonListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`marketplace` enum('com','uk','sg') NOT NULL,
	`asin` varchar(20),
	`keywords` json,
	`categories` json,
	`optimizedTitle` varchar(500),
	`optimizedDescription` text,
	`seoScore` int,
	`launchDate` timestamp,
	`launchChecklist` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `amazonListings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `amazonPerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`marketplace` enum('com','uk','sg') NOT NULL,
	`asin` varchar(20),
	`snapshotDate` timestamp NOT NULL,
	`salesRank` int,
	`categoryRank` int,
	`category` varchar(255),
	`reviewsCount` int DEFAULT 0,
	`averageRating` decimal(3,2),
	`estimatedSales` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `amazonPerformance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`penName` varchar(255),
	`bio` text,
	`website` varchar(500),
	`avatarUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `authors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookDesigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`coverUrl` varchar(500),
	`coverPrompt` text,
	`designStyle` varchar(100),
	`epubUrl` varchar(500),
	`mobiUrl` varchar(500),
	`pdfUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookDesigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`subtitle` varchar(500),
	`description` text,
	`content` text,
	`genre` varchar(100),
	`status` enum('idea','outlining','drafting','editing','designed','marketing','published') NOT NULL DEFAULT 'idea',
	`coverUrl` varchar(500),
	`wordCount` int DEFAULT 0,
	`targetWordCount` int,
	`currentChapter` int DEFAULT 0,
	`totalChapters` int,
	`programDay` int DEFAULT 0,
	`programStep` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(500),
	`content` text,
	`wordCount` int DEFAULT 0,
	`status` enum('planned','drafting','completed','edited') NOT NULL DEFAULT 'planned',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(100),
	`description` text,
	`traits` json,
	`backstory` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailSequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`sequenceNumber` int NOT NULL,
	`subject` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`delayDays` int DEFAULT 0,
	`sentCount` int DEFAULT 0,
	`openRate` decimal(5,2),
	`clickRate` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailSequences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketingCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('launch','ongoing','promotion','funnel') NOT NULL,
	`status` enum('draft','active','paused','completed') NOT NULL DEFAULT 'draft',
	`startDate` timestamp,
	`endDate` timestamp,
	`budget` decimal(10,2),
	`landingPageUrl` varchar(500),
	`leadMagnetUrl` varchar(500),
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`revenue` decimal(10,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketingCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesFunnels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`funnelType` enum('lead_magnet','book_sale','upsell','course','coaching') NOT NULL,
	`config` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salesFunnels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `amazonListings` ADD CONSTRAINT `amazonListings_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `amazonPerformance` ADD CONSTRAINT `amazonPerformance_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `authors` ADD CONSTRAINT `authors_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookDesigns` ADD CONSTRAINT `bookDesigns_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_authorId_authors_id_fk` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `characters` ADD CONSTRAINT `characters_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emailSequences` ADD CONSTRAINT `emailSequences_campaignId_marketingCampaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `marketingCampaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketingCampaigns` ADD CONSTRAINT `marketingCampaigns_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesFunnels` ADD CONSTRAINT `salesFunnels_campaignId_marketingCampaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `marketingCampaigns`(`id`) ON DELETE cascade ON UPDATE no action;