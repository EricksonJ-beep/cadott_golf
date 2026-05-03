CREATE TABLE "course_hole_guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"hole_number" integer NOT NULL,
	"tee_shot_notes" text,
	"approach_notes" text,
	"around_green_notes" text,
	"miss_avoid_notes" text,
	"general_strategy" text,
	"updated_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_hole_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" text NOT NULL,
	"hole_number" integer NOT NULL,
	"note_text" text NOT NULL,
	"note_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "practice_plans" ADD COLUMN "order_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "course_hole_guides" ADD CONSTRAINT "course_hole_guides_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_hole_notes" ADD CONSTRAINT "player_hole_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;