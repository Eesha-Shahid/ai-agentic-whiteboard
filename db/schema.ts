import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  credits: integer("credits").default(3),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial("id").primaryKey(),
  projectId: varchar('projectId').notNull().unique(),
  projectName: varchar('projectName').notNull(),
  userEmail: varchar('userEmail').notNull(),
  archived: boolean('archived').default(false).notNull(),
  isPublic: boolean('isPublic').default(false).notNull(),
  publicRole: varchar('publicRole').default('view'), // "view" | "edit"
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const collaborators = pgTable('collaborators', {
  id: serial("id").primaryKey(),
  projectId: varchar('projectId').notNull().references(() => projects.projectId),
  userEmail: varchar('userEmail').notNull(),
  role: varchar('role').default('viewer').notNull(), // "editor" | "viewer"
  invitedBy: varchar('invitedBy').notNull(),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
})

export const WhiteboardData = pgTable("whiteboardData", {
  id: serial("id").primaryKey(),
  projectId: varchar('projectid').notNull().unique().references(() => projects.projectId),
  elements: jsonb('elements'),
  appState: jsonb('appState'),
  files: jsonb('files'),
  previewImage: text('previewImage'),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
