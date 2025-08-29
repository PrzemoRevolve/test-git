from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import BlogPost as BlogPostModel
from ..models import User as UserModel
from ..schemas import BlogPost, BlogPostCreate, BlogPostUpdate

router = APIRouter(prefix="/api/blog_posts", tags=["blog_posts"])


@router.get("/", response_model=list[BlogPost])
def get_blog_posts(db: Session = Depends(get_db)):
    blog_posts = (
        db.query(BlogPostModel)
        .join(UserModel)
        .add_columns(UserModel.name.label("author_name"))
        .order_by(BlogPostModel.created_at.desc())
        .all()
    )

    result = []
    for blog_post, author_name in blog_posts:
        blog_post_dict = {
            "id": blog_post.id,
            "title": blog_post.title,
            "content": blog_post.content,
            "user_id": blog_post.user_id,
            "created_at": blog_post.created_at,
            "updated_at": blog_post.updated_at,
            "author_name": author_name,
        }
        result.append(blog_post_dict)

    return result


@router.get("/{blog_post_id}", response_model=BlogPost)
def get_blog_post(blog_post_id: int, db: Session = Depends(get_db)):
    blog_post_result = (
        db.query(BlogPostModel)
        .join(UserModel)
        .add_columns(UserModel.name.label("author_name"))
        .filter(BlogPostModel.id == blog_post_id)
        .first()
    )

    if blog_post_result is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    blog_post, author_name = blog_post_result
    return {
        "id": blog_post.id,
        "title": blog_post.title,
        "content": blog_post.content,
        "user_id": blog_post.user_id,
        "created_at": blog_post.created_at,
        "updated_at": blog_post.updated_at,
        "author_name": author_name,
    }


@router.post("/", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
def create_blog_post(blog_post: BlogPostCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(UserModel).filter(UserModel.id == blog_post.user_id).first()
    if user is None:
        raise HTTPException(status_code=400, detail="User not found")

    db_blog_post = BlogPostModel(
        title=blog_post.title, content=blog_post.content, user_id=blog_post.user_id
    )
    db.add(db_blog_post)
    db.commit()
    db.refresh(db_blog_post)

    return {
        "id": db_blog_post.id,
        "title": db_blog_post.title,
        "content": db_blog_post.content,
        "user_id": db_blog_post.user_id,
        "created_at": db_blog_post.created_at,
        "updated_at": db_blog_post.updated_at,
        "author_name": user.name,
    }


@router.put("/{blog_post_id}", response_model=BlogPost)
def update_blog_post(blog_post_id: int, blog_post: BlogPostUpdate, db: Session = Depends(get_db)):
    db_blog_post = db.query(BlogPostModel).filter(BlogPostModel.id == blog_post_id).first()
    if db_blog_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    db_blog_post.title = blog_post.title
    db_blog_post.content = blog_post.content
    db.commit()
    db.refresh(db_blog_post)

    # Get author name
    user = db.query(UserModel).filter(UserModel.id == db_blog_post.user_id).first()

    return {
        "id": db_blog_post.id,
        "title": db_blog_post.title,
        "content": db_blog_post.content,
        "user_id": db_blog_post.user_id,
        "created_at": db_blog_post.created_at,
        "updated_at": db_blog_post.updated_at,
        "author_name": user.name if user else None,
    }


@router.delete("/{blog_post_id}")
def delete_blog_post(blog_post_id: int, db: Session = Depends(get_db)):
    db_blog_post = db.query(BlogPostModel).filter(BlogPostModel.id == blog_post_id).first()
    if db_blog_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    db.delete(db_blog_post)
    db.commit()
    return {"message": "Blog post deleted successfully"}
