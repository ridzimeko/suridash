ALTER TABLE "alerts" ADD COLUMN "agent_id" varchar(32);--> statement-breakpoint
ALTER TABLE "blocked_ips" ADD COLUMN "execution_status" "block_execution_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "blocked_ips" ADD COLUMN "executed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "blocked_ips" ADD COLUMN "execution_error" text;--> statement-breakpoint
ALTER TABLE "blocked_ips" ADD COLUMN "agent_id" varchar(32);--> statement-breakpoint
ALTER TABLE "suricata_rules" ADD COLUMN "agent_id" varchar(32);