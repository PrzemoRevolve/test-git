export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  author_name?: string;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  blog_post_id: number;
  created_at: Date;
  author_name?: string;
  blog_post_title?: string;
}

export interface Migration {
  id: number;
  filename: string;
  executed_at: Date;
}

export interface DatabaseConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export interface DatabaseError {
  code?: string;
  message: string;
}
