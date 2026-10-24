CREATE TABLE `club_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`event` text NOT NULL,
	`target` text NOT NULL,
	`source` text NOT NULL,
	`medium` text NOT NULL,
	`campaign` text NOT NULL,
	`referrer` text NOT NULL,
	`device` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `club_activity_once` ON `club_activity` (`session`,`event`,`target`);--> statement-breakpoint
CREATE INDEX `club_activity_time` ON `club_activity` (`created_at`);--> statement-breakpoint
CREATE TABLE `club_email_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`kind` text NOT NULL,
	`token` text,
	`payload` text NOT NULL,
	`status` text NOT NULL,
	`provider_id` text,
	`error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `club_email_once` ON `club_email_jobs` (`submission_id`,`kind`);--> statement-breakpoint
CREATE TABLE `club_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `club_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`details` text NOT NULL,
	`interests` text NOT NULL,
	`consent` integer DEFAULT 0 NOT NULL,
	`consent_version` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`email_status` text NOT NULL,
	`confirm_token` text,
	`confirm_expires` integer,
	`unsubscribe_token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`source` text NOT NULL,
	`medium` text NOT NULL,
	`campaign` text NOT NULL,
	`session_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `club_email_type` ON `club_submissions` (`email`,`type`);--> statement-breakpoint
CREATE INDEX `club_created` ON `club_submissions` (`created_at`);