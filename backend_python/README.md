# FastAPI Blog Backend

This is a Python FastAPI backend that replaces the Node.js/Express backend. It provides the same API endpoints and functionality.

## Features

- RESTful API for users, blog posts, and comments
- PostgreSQL database with SQLAlchemy ORM
- WebSocket support for real-time communication
- CORS enabled for frontend integration
- Static file serving for React frontend
- Automatic database table creation
- Type validation with Pydantic

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database configuration
```

4. Run the server:
```bash
python run.py
```

The server will start on http://localhost:8000

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Blog Posts
- `GET /api/blog_posts` - Get all blog posts
- `GET /api/blog_posts/{id}` - Get blog post by ID
- `POST /api/blog_posts` - Create new blog post
- `PUT /api/blog_posts/{id}` - Update blog post
- `DELETE /api/blog_posts/{id}` - Delete blog post

### Comments
- `GET /api/comments` - Get all comments
- `GET /api/comments/{id}` - Get comment by ID
- `GET /api/blog_posts/{id}/comments` - Get comments for a blog post
- `POST /api/comments` - Create new comment
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

### WebSocket
- `ws://localhost:8000/ws` - WebSocket endpoint for real-time communication

## Docker

Build and run with Docker:
```bash
docker build -t fastapi-blog .
docker run -p 8000:8000 fastapi-blog
```

## Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc