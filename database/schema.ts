import { pgTable, integer, uuid, text, varchar, char, pgEnum, vector, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const embeddingStatus = pgEnum("progress_status", ["not_started", "pending", "done", "error"]);
export type embeddingStatus = typeof embeddingStatus.enumValues[number];

export const files = pgTable("files", {
  fileId: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  uuid: uuid().notNull(),
  filename: text().notNull(),
  fileType: varchar({ length: 32 }).notNull(),
  checksum: char({ length: 64 }).notNull(),
  chunkCount: integer(),
  embeddingStatus: embeddingStatus().default("not_started").notNull(),
  timeToLive: timestamp({ withTimezone: true }).default(sql`now() + interval '14 days'`).notNull(),
}, table => [
  unique("unique_file_checksum_per_user").on(table.uuid, table.checksum)
]);

export const chunks = pgTable("chunks", {
  chunkId: integer("chunk_id").primaryKey().generatedAlwaysAsIdentity().notNull(),
  fileId: integer().notNull().references(() => files.fileId, { onDelete: "cascade" }),
  rawText: text(),
  embedding: vector({ dimensions: 1536 }),
  embeddingStatus: embeddingStatus().default("not_started").notNull(),
});