from models import ProjectModel

# Mock database simulating persistent storage
fake_projects_db = []


def get_all_projects() -> list[ProjectModel]:
    return fake_projects_db


def create_project(project: ProjectModel) -> ProjectModel:
    fake_projects_db.append(project)
    return project
