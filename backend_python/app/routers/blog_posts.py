from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import BlogPost as BlogPostModel
from ..models import User as UserModel
from ..schemas import BlogPost, BlogPostCreate, BlogPostUpdate

router = APIRouter(prefix="/api/post", tags=["post"])


@router.get("/", response_model=list[BlogPost])
def get_posts(db: Session = Depends(get_db)):
    posts = (
        db.query(BlogPostModel)
        .join(UserModel)
        .add_columns(UserModel.name.label("author_name"))
        .order_by(BlogPostModel.created_at.desc())
        .all()
    )

    result = []
    for post, author_name in posts:
        post_dict = {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "user_id": post.user_id,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "author_name": author_name,
        }
        result.append(post_dict)

    return result


@router.get("/{post_id}", response_model=BlogPost)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post_result = (
        db.query(BlogPostModel)
        .join(UserModel)
        .add_columns(UserModel.name.label("author_name"))
        .filter(BlogPostModel.id == post_id)
        .first()
    )

    if post_result is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    post, author_name = post_result
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "user_id": post.user_id,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "author_name": author_name,
    }


@router.post("/", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
def create_post(post: BlogPostCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(UserModel).filter(UserModel.id == post.user_id).first()
    if user is None:
        raise HTTPException(status_code=400, detail="User not found")

    db_post = BlogPostModel(
        title=post.title, content=post.content, user_id=post.user_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    return {
        "id": db_post.id,
        "title": db_post.title,
        "content": db_post.content,
        "user_id": db_post.user_id,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
        "author_name": user.name,
    }


@router.put("/{post_id}", response_model=BlogPost)
def update_post(post_id: int, post: BlogPostUpdate, db: Session = Depends(get_db)):
    db_post = db.query(BlogPostModel).filter(BlogPostModel.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    db_post.title = post.title
    db_post.content = post.content
    db.commit()
    db.refresh(db_post)

    # Get author name
    user = db.query(UserModel).filter(UserModel.id == db_post.user_id).first()

    return {
        "id": db_post.id,
        "title": db_post.title,
        "content": db_post.content,
        "user_id": db_post.user_id,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
        "author_name": user.name if user else None,
    }


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(BlogPostModel).filter(BlogPostModel.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    db.delete(db_post)
    db.commit()
    return {"message": "Blog post deleted successfully"}
