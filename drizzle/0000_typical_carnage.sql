CREATE TYPE "public"."challenge_category" AS ENUM('putting', 'chipping', 'bunker', 'driving', 'approach', 'wedges', 'course_stats');--> statement-breakpoint
CREATE TYPE "public"."challenge_type" AS ENUM('range', 'course');--> statement-breakpoint
CREATE TYPE "public"."club_type" AS ENUM('driver', 'wood', 'hybrid', 'iron', 'wedge', 'putter');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('coach', 'player');--> statement-breakpoint
CREATE TYPE "public"."scoring_type" AS ENUM('score_out_of', 'makes_in_a_row', 'pass_fail', 'count');--> statement-breakpoint
CREATE TYPE "public"."swing_type" AS ENUM('full', 'three_quarter', 'half', 'quarter');--> statement-breakpoint
CREATE TABLE "challenge_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"challenge_id" integer NOT NULL,
	"score" integer NOT NULL,
	"score_details" jsonb,
	"date_logged" date DEFAULT now() NOT NULL,
	"season_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "challenge_type" NOT NULL,
	"category" "challenge_category" NOT NULL,
	"scoring_type" "scoring_type" DEFAULT 'score_out_of' NOT NULL,
	"unit" text,
	"description" text,
	"max_score" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "club_distances" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"player_club_id" integer NOT NULL,
	"swing_type" "swing_type" DEFAULT 'full' NOT NULL,
	"carry_yards" integer,
	"total_yards" integer,
	"typical_miss" text,
	"is_go_to" boolean DEFAULT false NOT NULL,
	"is_avoid" boolean DEFAULT false NOT NULL,
	"date_logged" date DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs_default" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "club_type" NOT NULL,
	"default_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historical_season_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"season" integer NOT NULL,
	"holes_played" integer NOT NULL,
	"rounds_played" integer,
	"lowest_score" integer,
	"average_score" real,
	"birdies" integer,
	"eagles" integer,
	"pars" integer,
	"bogeys" integer,
	"double_bogeys" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"club_id" integer,
	"custom_name" text,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_plan_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"start_minute" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"block_name" text NOT NULL,
	"drill_description" text,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"theme" text,
	"focus_area" text,
	"total_duration_minutes" integer NOT NULL,
	"equipment_list" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roster_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"jersey_number" integer
);
--> statement-breakpoint
CREATE TABLE "round_holes" (
	"id" serial PRIMARY KEY NOT NULL,
	"round_id" integer NOT NULL,
	"hole_number" integer NOT NULL,
	"par" integer NOT NULL,
	"score" integer NOT NULL,
	"fairway_hit" boolean,
	"gir" boolean DEFAULT false NOT NULL,
	"putts" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"course_name" text NOT NULL,
	"holes_played" integer DEFAULT 18 NOT NULL,
	"tee_color" text,
	"round_segment" text,
	"total_score" integer,
	"weather_notes" text,
	"free_text_notes" text,
	"season_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats_chart_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"chart_type" text NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'player' NOT NULL,
	"name" text NOT NULL,
	"grade" integer,
	"year_joined" integer,
	"photo_url" text,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"password_reset_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "challenge_results" ADD CONSTRAINT "challenge_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_results" ADD CONSTRAINT "challenge_results_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_results" ADD CONSTRAINT "challenge_results_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_distances" ADD CONSTRAINT "club_distances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_distances" ADD CONSTRAINT "club_distances_player_club_id_player_clubs_id_fk" FOREIGN KEY ("player_club_id") REFERENCES "public"."player_clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historical_season_stats" ADD CONSTRAINT "historical_season_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_clubs" ADD CONSTRAINT "player_clubs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_clubs" ADD CONSTRAINT "player_clubs_club_id_clubs_default_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs_default"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_plan_blocks" ADD CONSTRAINT "practice_plan_blocks_plan_id_practice_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."practice_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_plans" ADD CONSTRAINT "practice_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_holes" ADD CONSTRAINT "round_holes_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats_chart_preferences" ADD CONSTRAINT "stats_chart_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;