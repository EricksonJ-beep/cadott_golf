ALTER TABLE "challenges" ADD COLUMN "new_until" date;--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "is_cvga_tournament" boolean DEFAULT false NOT NULL;