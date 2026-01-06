ALTER TABLE `books` ADD `copyrightPage` text;--> statement-breakpoint
ALTER TABLE `books` ADD `backCoverCopy` text;--> statement-breakpoint
ALTER TABLE `books` ADD `authorBio` text;--> statement-breakpoint
ALTER TABLE `books` ADD `backCoverStyle` varchar(50);--> statement-breakpoint
ALTER TABLE `books` ADD `isbn` varchar(20);--> statement-breakpoint
ALTER TABLE `books` ADD `publisherName` varchar(255);--> statement-breakpoint
ALTER TABLE `books` ADD `publisherWebsite` varchar(500);--> statement-breakpoint
ALTER TABLE `books` ADD `copyrightYear` int;