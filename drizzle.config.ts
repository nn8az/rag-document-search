import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_URL!,
    port: 5432,
    database: process.env.DB_NAME!,
    user: "postgres",
    password: process.env.DB_PASSWORD!,
    ssl: true,
  },
});