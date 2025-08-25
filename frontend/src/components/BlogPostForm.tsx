import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogPostsApi, usersApi } from '../services/api';
import type {
  BlogPost,
  User,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from '../../../shared/types';

const BlogPostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    user_id: 1,
  });

  useEffect(() => {
    loadUsers();
    if (isEditing && id) {
      loadPost(Number.parseInt(id, 10));
    }
  }, [isEditing, id]);

  const loadUsers = async () => {
    try {
      const usersData = await usersApi.getAll();
      setUsers(usersData);
      if (usersData.length > 0 && !isEditing) {
        setFormData((prev) => ({ ...prev, user_id: usersData[0].id }));
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    }
  };

  const loadPost = async (postId: number) => {
    try {
      setLoading(true);
      const postData = await blogPostsApi.getById(postId);
      setPost(postData);
      setFormData({
        title: postData.title,
        content: postData.content,
        user_id: postData.user_id,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load blog post');
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditing && id) {
        const updateData: UpdateBlogPostRequest = {
          title: formData.title,
          content: formData.content,
        };
        await blogPostsApi.update(Number.parseInt(id, 10), updateData);
        navigate(`/posts/${id}`);
      } else {
        const createData: CreateBlogPostRequest = {
          title: formData.title,
          content: formData.content,
          user_id: formData.user_id,
        };
        const newPost = await blogPostsApi.create(createData);
        navigate(`/posts/${newPost.id}`);
      }
    } catch (err) {
      setError(isEditing ? 'Failed to update post' : 'Failed to create post');
      console.error('Error saving post:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'user_id' ? Number.parseInt(value, 10) : value,
    }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="blog-post-form">
      <header className="form-header">
        <nav>
          <Link to={isEditing && post ? `/posts/${post.id}` : '/'}>← Back</Link>
        </nav>
        <h1>{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter post title"
            required
          />
        </div>

        {!isEditing && (
          <div className="form-group">
            <label htmlFor="user_id">Author</label>
            <select
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your post content here..."
            rows={15}
            required
          />
        </div>

        <div className="form-actions">
          <Link
            to={isEditing && post ? `/posts/${post.id}` : '/'}
            className="cancel-button"
          >
            Cancel
          </Link>
          <button type="submit" className="submit-button" disabled={saving}>
            {saving
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
                ? 'Update Post'
                : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostForm;
