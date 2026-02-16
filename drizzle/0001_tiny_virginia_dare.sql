CREATE TABLE `savedFilters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`filterData` json NOT NULL,
	`lastSyncedAt` timestamp,
	`lastResultId` varchar(255),
	`notificationsEnabled` int NOT NULL DEFAULT 1,
	`whatsappNumber` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedFilters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `syncHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filterId` int NOT NULL,
	`userId` int NOT NULL,
	`newResultsCount` int NOT NULL DEFAULT 0,
	`notificationSent` int NOT NULL DEFAULT 0,
	`status` enum('success','error','no_changes') NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `syncHistory_id` PRIMARY KEY(`id`)
);
