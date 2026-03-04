import { pgTable, serial, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').unique().notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	passwordHash: text('password_hash').notNull()
})

export const registration_invites = pgTable('registration_invites', {
	uuid_hash: text('uuid_hash').primaryKey(),
	email: text('email').notNull(),
	expiresAt: timestamp('expiers_at').notNull().default(
		sql`now() + interval '1 hour'`
	)
})

export const password_reset_invites = pgTable('password_reset_invites', {
	uuid_hash: text('uuid_hash').primaryKey(),
	email: text('email').unique().notNull(),
	expiresAt: timestamp('expires_at').notNull().default(
		sql`now() + interval '1 hour'`
	)
})

export const problem_categories = pgTable('problem_categories', {
	id: serial('id').primaryKey(),
	problemCategory: text('problem_category').notNull().unique(),
	problemName: text('problem_name').notNull().unique(),
	problemDescription: text('problem_description'),
})

export const problem_reports = pgTable('problem_reports', {
	id: serial('id').primaryKey(),
	authorId: uuid('author_id').references(() => users.id),
	issueId: integer('problem_category_id').references(() => problem_categories.id),
})
