ALTER TABLE `books` ADD `workflowStep` varchar(50);--> statement-breakpoint
ALTER TABLE `books` ADD `aiAnalysis` text;--> statement-breakpoint
ALTER TABLE `books` ADD `selectedTitle` varchar(500);--> statement-breakpoint
ALTER TABLE `books` ADD `selectedSubtitle` varchar(500);--> statement-breakpoint
ALTER TABLE `books` ADD `generatedCovers` text;--> statement-breakpoint
ALTER TABLE `books` ADD `selectedCoverUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `books` ADD `amazonCategories` text;--> statement-breakpoint
ALTER TABLE `books` ADD `amazonKeywords` text;--> statement-breakpoint
ALTER TABLE `books` ADD `suggestedPrice` varchar(20);