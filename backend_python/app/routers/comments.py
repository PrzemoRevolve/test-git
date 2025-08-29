from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import BlogPost as BlogPostModel
from ..models import Comment as CommentModel
from ..models import User as UserModel
from ..schemas import Comment, CommentCreate, CommentUpdate

router = APIRouter(prefix="/api/comments", tags=["comments"])


@router.get("/", response_model=list[Comment])
def get_comments(db: Session = Depends(get_db)):
    comments = (
        db.query(CommentModel)
        .join(UserModel, CommentModel.user_id == UserModel.id)
        .join(BlogPostModel, CommentModel.blog_post_id == BlogPostModel.id)
        .add_columns(
            UserModel.name.label("author_name"), BlogPostModel.title.label("blog_post_title")
        )
        .order_by(CommentModel.created_at.desc())
        .all()
    )

    result = []
    for comment, author_name, blog_post_title in comments:
        comment_dict = {
            "id": comment.id,
            "content": comment.content,
            "user_id": comment.user_id,
            "blog_post_id": comment.blog_post_id,
            "created_at": comment.created_at,
            "author_name": author_name,
            "blog_post_title": blog_post_title,
        }
        result.append(comment_dict)

    return result


@router.get("/{comment_id}", response_model=Comment)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    comment_result = (
        db.query(CommentModel)
        .join(UserModel, CommentModel.user_id == UserModel.id)
        .join(BlogPostModel, CommentModel.blog_post_id == BlogPostModel.id)
        .add_columns(
            UserModel.name.label("author_name"), BlogPostModel.title.label("blog_post_title")
        )
        .filter(CommentModel.id == comment_id)
        .first()
    )

    if comment_result is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment, author_name, blog_post_title = comment_result
    return {
        "id": comment.id,
        "content": comment.content,
        "user_id": comment.user_id,
        "blog_post_id": comment.blog_post_id,
        "created_at": comment.created_at,
        "author_name": author_name,
        "blog_post_title": blog_post_title,
    }


def get_blog_post_comments(blog_post_id: int, db: Session):
    comments = (
        db.query(CommentModel)
        .join(UserModel, CommentModel.user_id == UserModel.id)
        .add_columns(UserModel.name.label("author_name"))
        .filter(CommentModel.blog_post_id == blog_post_id)
        .order_by(CommentModel.created_at.asc())
        .all()
    )

    result = []
    for comment, author_name in comments:
        comment_dict = {
            "id": comment.id,
            "content": comment.content,
            "user_id": comment.user_id,
            "blog_post_id": comment.blog_post_id,
            "created_at": comment.created_at,
            "author_name": author_name,
            "blog_post_title": None,
        }
        result.append(comment_dict)

    return result


@router.post("/", response_model=Comment, status_code=status.HTTP_201_CREATED)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(UserModel).filter(UserModel.id == comment.user_id).first()
    if user is None:
        raise HTTPException(status_code=400, detail="User not found")

    # Verify blog post exists
    blog_post = db.query(BlogPostModel).filter(BlogPostModel.id == comment.blog_post_id).first()
    if blog_post is None:
        raise HTTPException(status_code=400, detail="Blog post not found")

    db_comment = CommentModel(
        content=comment.content, user_id=comment.user_id, blog_post_id=comment.blog_post_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    return {
        "id": db_comment.id,
        "content": db_comment.content,
        "user_id": db_comment.user_id,
        "blog_post_id": db_comment.blog_post_id,
        "created_at": db_comment.created_at,
        "author_name": user.name,
        "blog_post_title": blog_post.title,
    }


@router.put("/{comment_id}", response_model=Comment)
def update_comment(comment_id: int, comment: CommentUpdate, db: Session = Depends(get_db)):
    db_comment = db.query(CommentModel).filter(CommentModel.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    db_comment.content = comment.content
    db.commit()
    db.refresh(db_comment)

    # Get related data
    user = db.query(UserModel).filter(UserModel.id == db_comment.user_id).first()
    blog_post = db.query(BlogPostModel).filter(BlogPostModel.id == db_comment.blog_post_id).first()

    return {
        "id": db_comment.id,
        "content": db_comment.content,
        "user_id": db_comment.user_id,
        "blog_post_id": db_comment.blog_post_id,
        "created_at": db_comment.created_at,
        "author_name": user.name if user else None,
        "blog_post_title": blog_post.title if blog_post else None,
    }


@router.delete("/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    db_comment = db.query(CommentModel).filter(CommentModel.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(db_comment)
    db.commit()
    return {"message": "Comment deleted successfully"}
