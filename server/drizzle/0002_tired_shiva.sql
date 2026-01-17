CREATE TABLE "geoip" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip" varchar(45) NOT NULL,
	"country" varchar(2),
	"city" varchar(128),
	"latitude" varchar(32),
	"longitude" varchar(32),
	"as_name" varchar(256),
	"as_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "geoip_ip_unique" UNIQUE("ip")
);
--> statement-breakpoint
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_geo_ip_suricata_rules_ip_fk";
--> statement-breakpoint
ALTER TABLE "blocked_ips" DROP CONSTRAINT "blocked_ips_geo_ip_suricata_rules_ip_fk";
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_geo_ip_geoip_ip_fk" FOREIGN KEY ("geo_ip") REFERENCES "public"."geoip"("ip") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_ips" ADD CONSTRAINT "blocked_ips_geo_ip_geoip_ip_fk" FOREIGN KEY ("geo_ip") REFERENCES "public"."geoip"("ip") ON DELETE no action ON UPDATE no action;