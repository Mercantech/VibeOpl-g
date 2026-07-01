from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_auth
from app.models import Project, ProjectSection
from app.schemas import ProjectCreate, ProjectListItem, ProjectRead, ProjectUpdate

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectListItem])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.created_at.desc()).all()


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projekt ikke fundet")
    return project


def _apply_sections(project: Project, sections_data: list) -> None:
    project.sections.clear()
    for i, section in enumerate(sections_data):
        project.sections.append(
            ProjectSection(
                title=section.title,
                body=section.body,
                image_path=section.image_path,
                sort_order=section.sort_order if section.sort_order else i,
            )
        )


@router.post("", response_model=ProjectRead, dependencies=[Depends(require_auth)])
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        title=body.title,
        description=body.description,
        usage_guide=body.usage_guide,
        app_url=body.app_url,
        cover_image_path=body.cover_image_path,
        author_name=body.author_name,
        author_school=body.author_school,
        author_email=body.author_email,
    )
    _apply_sections(project, body.sections)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectRead, dependencies=[Depends(require_auth)])
def update_project(project_id: int, body: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projekt ikke fundet")

    project.title = body.title
    project.description = body.description
    project.usage_guide = body.usage_guide
    project.app_url = body.app_url
    project.cover_image_path = body.cover_image_path
    project.author_name = body.author_name
    project.author_school = body.author_school
    project.author_email = body.author_email
    _apply_sections(project, body.sections)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", dependencies=[Depends(require_auth)])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projekt ikke fundet")
    db.delete(project)
    db.commit()
    return {"ok": True}
