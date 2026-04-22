CREATE TYPE "public"."progress_status" AS ENUM('not_started', 'pending', 'done', 'error');--> statement-breakpoint
CREATE TABLE "chunks" (
	"chunk_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chunks_chunk_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"file_id" integer NOT NULL,
	"raw_text" text,
	"embedding" vector(1536),
	"embedding_status" "progress_status" DEFAULT 'not_started' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"file_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "files_file_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid NOT NULL,
	"filename" text NOT NULL,
	"file_type" varchar(32) NOT NULL,
	"checksum" char(32) NOT NULL,
	"chunk_count" integer,
	"embedding_status" "progress_status" DEFAULT 'not_started' NOT NULL,
	"time_to_live" timestamp with time zone DEFAULT now() + interval '14 days' NOT NULL,
	CONSTRAINT "files_checksum_unique" UNIQUE("checksum")
);
--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_file_id_files_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("file_id") ON DELETE no action ON UPDATE no action;