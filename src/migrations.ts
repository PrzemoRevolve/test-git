import { promises as fs } from "node:fs";
import * as path from "node:path";
import type { Pool } from "pg";
import type { Migration } from "./types";

export class MigrationRunner {
  private pool: Pool;
  private migrationsDir: string;

  constructor(pool: Pool) {
    this.pool = pool;
    this.migrationsDir = path.join(__dirname, "..", "migrations");
  }

  async runMigrations(): Promise<void> {
    try {
      console.log("Starting migration process...");

      // Wait for database to be ready
      await this.waitForDatabase();

      const migrationFiles = await this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      const pendingMigrations = migrationFiles.filter(
        (file) => !executedMigrations.includes(file),
      );

      if (pendingMigrations.length === 0) {
        console.log("No pending migrations found.");
        return;
      }

      console.log(`Found ${pendingMigrations.length} pending migration(s)`);

      for (const migrationFile of pendingMigrations) {
        await this.executeMigration(migrationFile);
      }

      console.log("All migrations completed successfully!");
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  }

  private async waitForDatabase(): Promise<void> {
    const maxRetries = 30;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.pool.query("SELECT 1");
        console.log("Database connection established.");
        return;
      } catch (_error) {
        console.log(
          `Database connection attempt ${attempt}/${maxRetries} failed. Retrying in ${retryDelay}ms...`,
        );
        if (attempt === maxRetries) {
          throw new Error(
            "Failed to connect to database after maximum retries",
          );
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  private async getMigrationFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.migrationsDir);
      return files.filter((file) => file.endsWith(".sql")).sort();
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        console.log("Migrations directory not found. No migrations to run.");
        return [];
      }
      throw error;
    }
  }

  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await this.pool.query<Migration>(
        "SELECT filename FROM migrations ORDER BY filename",
      );
      return result.rows.map((row) => row.filename);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "42P01") {
        return [];
      }
      throw error;
    }
  }

  private async executeMigration(filename: string): Promise<void> {
    console.log(`Executing migration: ${filename}`);

    try {
      const migrationPath = path.join(this.migrationsDir, filename);
      const migrationSQL = await fs.readFile(migrationPath, "utf8");

      await this.pool.query("BEGIN");

      try {
        await this.pool.query(migrationSQL);

        await this.pool.query("INSERT INTO migrations (filename) VALUES ($1)", [
          filename,
        ]);

        await this.pool.query("COMMIT");

        console.log(`Migration completed: ${filename}`);
      } catch (error) {
        await this.pool.query("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error(`Failed to execute migration ${filename}:`, error);
      throw error;
    }
  }
}
