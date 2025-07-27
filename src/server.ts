import cors from "cors";
import { config } from "dotenv";
import express, { type Request, type Response } from "express";
import { Pool } from "pg";
import { MigrationRunner } from "./migrations";
import type { BlogPost, Comment, DatabaseConfig, User } from "./types";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbConfig: DatabaseConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "blogdb",
  password: process.env.DB_PASSWORD || "password",
  port: Number.parseInt(process.env.DB_PORT || "5432", 10),
};

const pool = new Pool(dbConfig);

// Users endpoints
app.get("/users", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<User>(
      "SELECT * FROM users ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.get("/users/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.post("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email }: { name: string; email: string } = req.body;
    const result = await pool.query<User>(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.put("/users/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email }: { name: string; email: string } = req.body;
    const result = await pool.query<User>(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.delete("/users/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query<User>(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// Blog posts endpoints
app.get("/blog_posts", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<BlogPost>(`
      SELECT bp.*, u.name as author_name 
      FROM blog_posts bp 
      JOIN users u ON bp.user_id = u.id 
      ORDER BY bp.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.get(
  "/blog_posts/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await pool.query<BlogPost>(
        `
      SELECT bp.*, u.name as author_name 
      FROM blog_posts bp 
      JOIN users u ON bp.user_id = u.id 
      WHERE bp.id = $1
    `,
        [id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Blog post not found" });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  },
);

app.post("/blog_posts", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      content,
      user_id,
    }: { title: string; content: string; user_id: number } = req.body;
    const result = await pool.query<BlogPost>(
      "INSERT INTO blog_posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, user_id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.put(
  "/blog_posts/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content }: { title: string; content: string } = req.body;
      const result = await pool.query<BlogPost>(
        "UPDATE blog_posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
        [title, content, id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Blog post not found" });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  },
);

app.delete(
  "/blog_posts/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await pool.query<BlogPost>(
        "DELETE FROM blog_posts WHERE id = $1 RETURNING *",
        [id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Blog post not found" });
        return;
      }
      res.json({ message: "Blog post deleted successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  },
);

// Comments endpoints
app.get("/comments", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<Comment>(`
      SELECT c.*, u.name as author_name, bp.title as blog_post_title 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      JOIN blog_posts bp ON c.blog_post_id = bp.id 
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.get("/comments/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query<Comment>(
      `
      SELECT c.*, u.name as author_name, bp.title as blog_post_title 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      JOIN blog_posts bp ON c.blog_post_id = bp.id 
      WHERE c.id = $1
    `,
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.get(
  "/blog_posts/:id/comments",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await pool.query<Comment>(
        `
      SELECT c.*, u.name as author_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.blog_post_id = $1 
      ORDER BY c.created_at ASC
    `,
        [id],
      );
      res.json(result.rows);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  },
);

app.post("/comments", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      content,
      user_id,
      blog_post_id,
    }: { content: string; user_id: number; blog_post_id: number } = req.body;
    const result = await pool.query<Comment>(
      "INSERT INTO comments (content, user_id, blog_post_id) VALUES ($1, $2, $3) RETURNING *",
      [content, user_id, blog_post_id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.put("/comments/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content }: { content: string } = req.body;
    const result = await pool.query<Comment>(
      "UPDATE comments SET content = $1 WHERE id = $2 RETURNING *",
      [content, id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.delete(
  "/comments/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await pool.query<Comment>(
        "DELETE FROM comments WHERE id = $1 RETURNING *",
        [id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  },
);

async function startServer(): Promise<void> {
  try {
    const migrationRunner = new MigrationRunner(pool);
    await migrationRunner.runMigrations();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
