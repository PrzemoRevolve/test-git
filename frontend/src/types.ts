export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date | string;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: Date | string;
  updated_at: Date | string;
  author_name?: string;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  blog_post_id: number;
  created_at: Date | string;
  author_name?: string;
  blog_post_title?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  user_id: number;
}

export interface UpdateBlogPostRequest {
  title: string;
  content: string;
}

export interface CreateCommentRequest {
  content: string;
  user_id: number;
  blog_post_id: number;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'sent' | 'received';
}