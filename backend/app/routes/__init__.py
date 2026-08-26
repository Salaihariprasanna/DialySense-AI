from app.routes.patients import router as patients_router
from app.routes.machines import router as machines_router
from app.routes.sessions import router as sessions_router
from app.routes.readings import router as readings_router
from app.routes.alerts import router as alerts_router
from app.routes.reports import router as reports_router
from app.routes.simulation import router as simulation_router
from app.routes.auth import router as auth_router

__all__ = [
    "patients_router",
    "machines_router",
    "sessions_router",
    "readings_router",
    "alerts_router",
    "reports_router",
    "simulation_router",
    "auth_router",
]
