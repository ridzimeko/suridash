CREATE TYPE "public"."agent_status" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TABLE "agents" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"hostname" varchar(100),
	"ip_address" varchar(45),
	"status" "agent_status" DEFAULT 'offline' NOT NULL,
	"api_key_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
