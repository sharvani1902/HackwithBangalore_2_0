from fastapi import APIRouter
from models import ProjectModel
from services import project_service

router = APIRouter()


@router.get("/", response_model=list[ProjectModel])
async def get_projects():
    """
    Retrieve all projects.
    """
    return project_service.get_all_projects()


@router.post("/", response_model=ProjectModel)
async def create_project(project: ProjectModel):
    """
    Create a new project.
    """
    return project_service.create_project(project)
