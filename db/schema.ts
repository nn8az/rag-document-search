import { pgTable, integer, uuid, text, varchar, char, pgEnum, vector } from "drizzle-orm/pg-core";

export const embeddingStatus = pgEnum("progress_status", ["not_started", "pending", "done", "error"]);

export const files = pgTable("files", {
  fileId: integer("file_id").primaryKey().generatedAlwaysAsIdentity().notNull(),
  uuid: uuid("uuid").notNull(),
  filename: text("filename").notNull(),
  fileType: varchar("file_type", { length: 32 }).notNull(),
  checksum: char("checksum", { length: 64 }).notNull(),
  chunkCount: integer("chunk_count"),
  embeddingStatus: embeddingStatus("embedding_status"), 
});

export const chunks = pgTable("chunks", {
  chunkId: integer("chunk_id").primaryKey().generatedAlwaysAsIdentity().notNull(),
  fileId: integer("file_id").notNull().references(() => files.fileId),
  rawText: text("raw_text"),
  embedding: vector("embedding", { dimensions: 1536 }),
  embeddingStatus: embeddingStatus("embedding_status"),
});