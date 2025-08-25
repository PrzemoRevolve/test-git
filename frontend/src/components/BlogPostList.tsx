import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogPostsApi } from '../services/api';
import type { BlogPost } from '../types';

const BlogPostList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogPostsApi.getAll();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load blog posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading blog posts...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button type="button" onClick={loadPosts}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="blog-post-list">
      <div className="header">
        <h1>Blog Posts</h1>
        <Link to="/posts/create" className="create-button">
          Create New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No blog posts found.</p>
          <Link to="/posts/create">Create your first post</Link>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h2>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h2>
              <div className="post-meta">
                <span className="author">By {post.author_name}</span>
                <span className="date">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="post-preview">
                {post.content.length > 200
                  ? `${post.content.substring(0, 200)}...`
                  : post.content}
              </div>
              <Link to={`/posts/${post.id}`} className="read-more">
                Read More
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPostList;
