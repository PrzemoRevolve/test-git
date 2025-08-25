import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPostsApi } from '../services/api';
import type { BlogPost, Comment } from '../types';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPost(Number.parseInt(id, 10));
    }
  }, [id]);

  const loadPost = async (postId: number) => {
    try {
      setLoading(true);
      const [postData, commentsData] = await Promise.all([
        blogPostsApi.getById(postId),
        blogPostsApi.getComments(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
      setError(null);
    } catch (err) {
      setError('Failed to load blog post');
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !post ||
      !window.confirm('Are you sure you want to delete this post?')
    ) {
      return;
    }

    try {
      await blogPostsApi.delete(post.id);
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return <div className="loading">Loading blog post...</div>;
  }

  if (error || !post) {
    return (
      <div className="error">
        <p>{error || 'Blog post not found'}</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <article className="blog-post-detail">
      <header className="post-header">
        <nav className="post-nav">
          <Link to="/">← Back to Posts</Link>
          <div className="post-actions">
            <Link to={`/posts/${post.id}/edit`} className="edit-button">
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        </nav>

        <h1>{post.title}</h1>
        <div className="post-meta">
          <span className="author">By {post.author_name}</span>
          <span className="date">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          {post.updated_at !== post.created_at && (
            <span className="updated">
              (Updated: {new Date(post.updated_at).toLocaleDateString()})
            </span>
          )}
        </div>
      </header>

      <div className="post-content">
        <div className="content">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet.</p>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.author_name}</span>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="comment-content">
                  {comment.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </article>
  );
};

export default BlogPostDetail;
