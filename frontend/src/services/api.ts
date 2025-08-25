import axios from 'axios';
import type {
  BlogPost,
  User,
  Comment,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '../types';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const blogPostsApi = {
  getAll: async (): Promise<BlogPost[]> => {
    const response = await api.get<BlogPost[]>('/blog_posts');
    return response.data;
  },

  getById: async (id: number): Promise<BlogPost> => {
    const response = await api.get<BlogPost>(`/blog_posts/${id}`);
    return response.data;
  },

  create: async (data: CreateBlogPostRequest): Promise<BlogPost> => {
    const response = await api.post<BlogPost>('/blog_posts', data);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateBlogPostRequest
  ): Promise<BlogPost> => {
    const response = await api.put<BlogPost>(`/blog_posts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/blog_posts/${id}`);
  },

  getComments: async (id: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/blog_posts/${id}/comments`);
    return response.data;
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const commentsApi = {
  create: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post<Comment>('/comments', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.put<Comment>(`/comments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};
