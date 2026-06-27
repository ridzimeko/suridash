import { relations } from "drizzle-orm/relations";
import { users, session } from "./schema.js";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(users, {
		fields: [session.userId],
		references: [users.id]
	}),
}));

export const userRelations = relations(users, ({many}) => ({
	sessions: many(session),
}));