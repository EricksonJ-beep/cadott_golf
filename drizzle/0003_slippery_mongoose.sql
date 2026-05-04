CREATE TYPE "public"."season_kind" AS ENUM('regular', 'offseason');--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "kind" "season_kind" DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "kind" "season_kind" DEFAULT 'regular' NOT NULL;