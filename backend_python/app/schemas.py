from datetime import datetime

from pydantic import BaseModel, EmailStr


# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    pass


class UserUpdate(UserBase):
    pass


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserWithRelations(User):
    blog_posts: list["BlogPost"] = []
    comments: list["Comment"] = []


# Blog Post Schemas
class BlogPostBase(BaseModel):
    title: str
    content: str


class BlogPostCreate(BlogPostBase):
    user_id: int


class BlogPostUpdate(BlogPostBase):
    pass


class BlogPost(BlogPostBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    author_name: str | None = None

    class Config:
        from_attributes = True


class BlogPostWithAuthor(BlogPost):
    author: User


class BlogPostWithComments(BlogPost):
    comments: list["Comment"] = []


# Comment Schemas
class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    user_id: int
    blog_post_id: int


class CommentUpdate(CommentBase):
    pass


class Comment(CommentBase):
    id: int
    user_id: int
    blog_post_id: int
    created_at: datetime
    author_name: str | None = None
    blog_post_title: str | None = None

    class Config:
        from_attributes = True


class CommentWithRelations(Comment):
    author: User
    blog_post: BlogPost


# WebSocket Message Schema
class Message(BaseModel):
    id: str
    text: str
    timestamp: datetime
    type: str


# Update forward references
UserWithRelations.model_rebuild()
BlogPostWithComments.model_rebuild()
