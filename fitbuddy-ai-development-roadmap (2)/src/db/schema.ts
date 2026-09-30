import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: number;
  label: string;
  focus: string;
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
}

export interface WorkoutPlan {
  title: string;
  overview: string;
  coachNote?: string | null;
  days: WorkoutDay[];
}

export interface FeedbackEntry {
  feedback: string;
  revision: number;
  at: string;
}

/**
 * FitBuddy athlete registry — one row per user_code (the ID typed on the form).
 */
export const users = pgTable("fitbuddy_users", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  age: integer("age").notNull(),
  weightKg: real("weight_kg").notNull(),
  goal: varchar("goal", { length: 120 }).notNull(),
  intensity: varchar("intensity", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * One plan per athlete. `originalPlan` is the first AI generation and is kept
 * immutable so the admin view can compare it against the feedback-driven
 * `currentPlan` (revision counter + full feedback log).
 */
export const plans = pgTable(
  "fitbuddy_plans",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    originalPlan: jsonb("original_plan").$type<WorkoutPlan>().notNull(),
    currentPlan: jsonb("current_plan").$type<WorkoutPlan>().notNull(),
    nutritionTip: text("nutrition_tip").notNull(),
    revision: integer("revision").default(0).notNull(),
    feedbackLog: jsonb("feedback_log").$type<FeedbackEntry[]>().default([]).notNull(),
    aiSource: varchar("ai_source", { length: 40 }).default("gemini").notNull(),
    aiModel: varchar("ai_model", { length: 80 }).default("gemini").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("fitbuddy_plans_user_idx").on(table.userId)],
);
