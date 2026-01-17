ALTER TABLE "agents" RENAME COLUMN "api_key" TO "token";--> statement-breakpoint
ALTER TABLE "alerts" ADD COLUMN "geo_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "blocked_ips" ADD COLUMN "geo_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_geo_ip_suricata_rules_ip_fk" FOREIGN KEY ("geo_ip") REFERENCES "public"."suricata_rules"("ip") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_ips" ADD CONSTRAINT "blocked_ips_geo_ip_suricata_rules_ip_fk" FOREIGN KEY ("geo_ip") REFERENCES "public"."suricata_rules"("ip") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "alerts" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "alerts" DROP COLUMN "latitude";--> statement-breakpoint
ALTER TABLE "alerts" DROP COLUMN "longitude";--> statement-breakpoint
ALTER TABLE "alerts" DROP COLUMN "as_number";--> statement-breakpoint
ALTER TABLE "alerts" DROP COLUMN "as_name";--> statement-breakpoint
ALTER TABLE "alerts" DROP COLUMN "was_blocked";--> statement-breakpoint
ALTER TABLE "blocked_ips" DROP COLUMN "execution_status";--> statement-breakpoint
ALTER TABLE "blocked_ips" DROP COLUMN "executed_at";--> statement-breakpoint
ALTER TABLE "blocked_ips" DROP COLUMN "execution_error";--> statement-breakpoint
ALTER TABLE "blocked_ips" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "blocked_ips" DROP COLUMN "city";