from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_auth
from app.models import Comment, Project
from app.schemas import CommentCreate, CommentRead

router = APIRouter(prefix="/api/projects", tags=["comments"])


@router.get("/{project_id}/comments", response_model=list[CommentRead])
def list_comments(project_id: int, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projekt ikke fundet")
    return project.comments


@router.post("/{project_id}/comments", response_model=CommentRead, dependencies=[Depends(require_auth)])
def create_comment(project_id: int, body: CommentCreate, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projekt ikke fundet")

    comment = Comment(
        project_id=project_id,
        author_name=body.author_name,
        author_school=body.author_school,
        author_email=body.author_email,
        body=body.body,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
