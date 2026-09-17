import json

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from geoalchemy2 import Geography
from geoalchemy2.elements import WKTElement

from pydantic import BaseModel

from sqlalchemy import cast, func
from sqlalchemy.orm import Session

from database import Base, engine, get_db

from models import (
    County as CountyModel,
    Project as ProjectModel,
    Road as RoadModel,
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Kenya Infrastructure GIS API",
    description=(
        "REST API and PostGIS spatial analysis "
        "for the Kenya Infrastructure GIS Explorer."
    ),
    version="5.1.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# PYDANTIC MODELS
# =========================================================

class ProjectCreate(BaseModel):
    name: str
    county: str
    type: str
    status: str
    latitude: float
    longitude: float
    description: str = ""


class RoadCreate(BaseModel):
    name: str
    road_class: str
    status: str
    description: str = ""
    coordinates: list[list[float]]


# =========================================================
# PROJECT HELPERS
# =========================================================

def project_to_dict(project):
    return {
        "id": project.id,
        "name": project.name,
        "county": project.county,
        "type": project.type,
        "status": project.status,
        "latitude": project.latitude,
        "longitude": project.longitude,
        "description": project.description or "",
    }


def create_point(longitude, latitude):
    return WKTElement(
        f"POINT({longitude} {latitude})",
        srid=4326,
    )


# =========================================================
# ROAD HELPERS
# =========================================================

def create_linestring(coordinates):
    if len(coordinates) < 2:
        raise HTTPException(
            status_code=400,
            detail=(
                "A road must contain at least "
                "two coordinate pairs."
            ),
        )

    for coordinate in coordinates:
        if len(coordinate) != 2:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Each road coordinate must contain "
                    "longitude and latitude."
                ),
            )

        longitude = coordinate[0]
        latitude = coordinate[1]

        if longitude < -180 or longitude > 180:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Longitude must be between "
                    "-180 and 180."
                ),
            )

        if latitude < -90 or latitude > 90:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Latitude must be between "
                    "-90 and 90."
                ),
            )

    coordinate_text = ", ".join(
        f"{coordinate[0]} {coordinate[1]}"
        for coordinate in coordinates
    )

    return WKTElement(
        f"LINESTRING({coordinate_text})",
        srid=4326,
    )


def road_to_geojson(road, geometry):
    return {
        "type": "Feature",
        "properties": {
            "id": road.id,
            "name": road.name,
            "roadClass": road.road_class,
            "status": road.status,
            "lengthKm": (
                round(road.length_km, 2)
                if road.length_km is not None
                else 0
            ),
            "description": road.description or "",
        },
        "geometry": geometry,
    }


# =========================================================
# COUNTY HELPERS
# =========================================================

def county_to_geojson(county, geometry):
    return {
        "type": "Feature",
        "properties": {
            "id": county.id,
            "county": county.county,
            "province": county.province,
            "country": county.adm0,
            "population": (
                county.population
                if county.population is not None
                else 0
            ),
            "male": (
                county.male
                if county.male is not None
                else 0
            ),
            "female": (
                county.female
                if county.female is not None
                else 0
            ),
            "shapeArea": (
                county.shape_area
                if county.shape_area is not None
                else 0
            ),
            "shapeLength": (
                county.shape_leng
                if county.shape_leng is not None
                else 0
            ),
        },
        "geometry": geometry,
    }


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Kenya Infrastructure GIS API is running",
        "database": "PostgreSQL",
        "spatial_extension": "PostGIS",
        "api_version": "5.1.0",
        "spatial_analysis": True,
    }


# =========================================================
# PROJECTS — GET ALL
# =========================================================

@app.get("/api/projects")
def get_projects(
    db: Session = Depends(get_db),
):
    projects = (
        db.query(ProjectModel)
        .order_by(ProjectModel.id)
        .all()
    )

    return [
        project_to_dict(project)
        for project in projects
    ]


# =========================================================
# PROJECTS — GET ONE
# =========================================================

@app.get("/api/projects/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(ProjectModel)
        .filter(
            ProjectModel.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project_to_dict(project)


# =========================================================
# PROJECTS — CREATE
# =========================================================

@app.post(
    "/api/projects",
    status_code=201,
)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
):
    new_project = ProjectModel(
        name=project.name,
        county=project.county,
        type=project.type,
        status=project.status,
        latitude=project.latitude,
        longitude=project.longitude,
        description=project.description,
        geom=create_point(
            project.longitude,
            project.latitude,
        ),
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return project_to_dict(new_project)


# =========================================================
# PROJECTS — UPDATE
# =========================================================

@app.put("/api/projects/{project_id}")
def update_project(
    project_id: int,
    updated_project: ProjectCreate,
    db: Session = Depends(get_db),
):
    project = (
        db.query(ProjectModel)
        .filter(
            ProjectModel.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    project.name = updated_project.name
    project.county = updated_project.county
    project.type = updated_project.type
    project.status = updated_project.status
    project.latitude = updated_project.latitude
    project.longitude = updated_project.longitude
    project.description = updated_project.description

    project.geom = create_point(
        updated_project.longitude,
        updated_project.latitude,
    )

    db.commit()
    db.refresh(project)

    return project_to_dict(project)


# =========================================================
# PROJECTS — DELETE
# =========================================================

@app.delete("/api/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(ProjectModel)
        .filter(
            ProjectModel.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    deleted_project = project_to_dict(
        project
    )

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully",
        "project": deleted_project,
    }


# =========================================================
# ROADS — GET ALL AS GEOJSON
# =========================================================

@app.get("/api/roads")
def get_roads(
    db: Session = Depends(get_db),
):
    roads = (
        db.query(
            RoadModel,
            func.ST_AsGeoJSON(
                RoadModel.geom
            ).label("geometry"),
        )
        .order_by(RoadModel.id)
        .all()
    )

    features = []

    for road, geometry_text in roads:
        if geometry_text is None:
            continue

        geometry = json.loads(
            geometry_text
        )

        features.append(
            road_to_geojson(
                road,
                geometry,
            )
        )

    return {
        "type": "FeatureCollection",
        "features": features,
    }


# =========================================================
# ROADS — CREATE
# =========================================================

@app.post(
    "/api/roads",
    status_code=201,
)
def create_road(
    road: RoadCreate,
    db: Session = Depends(get_db),
):
    geometry = create_linestring(
        road.coordinates
    )

    new_road = RoadModel(
        name=road.name,
        road_class=road.road_class,
        status=road.status,
        description=road.description,
        geom=geometry,
        length_km=0,
    )

    db.add(new_road)

    # Insert without completing transaction yet.
    db.flush()

    # Calculate geodesic length in metres.
    length_meters = (
        db.query(
            func.ST_Length(
                cast(
                    RoadModel.geom,
                    Geography,
                )
            )
        )
        .filter(
            RoadModel.id == new_road.id
        )
        .scalar()
    )

    if length_meters is None:
        new_road.length_km = 0
    else:
        new_road.length_km = (
            float(length_meters) / 1000
        )

    db.commit()
    db.refresh(new_road)

    geometry_text = (
        db.query(
            func.ST_AsGeoJSON(
                RoadModel.geom
            )
        )
        .filter(
            RoadModel.id == new_road.id
        )
        .scalar()
    )

    geometry_json = json.loads(
        geometry_text
    )

    return road_to_geojson(
        new_road,
        geometry_json,
    )


# =========================================================
# ROADS — DELETE
# =========================================================

@app.delete("/api/roads/{road_id}")
def delete_road(
    road_id: int,
    db: Session = Depends(get_db),
):
    road = (
        db.query(RoadModel)
        .filter(
            RoadModel.id == road_id
        )
        .first()
    )

    if road is None:
        raise HTTPException(
            status_code=404,
            detail="Road not found",
        )

    road_name = road.name

    db.delete(road)
    db.commit()

    return {
        "message": "Road deleted successfully",
        "road": road_name,
    }


# =========================================================
# COUNTIES — GET ALL AS GEOJSON
# =========================================================

@app.get("/api/counties")
def get_counties(
    db: Session = Depends(get_db),
):
    counties = (
        db.query(
            CountyModel,
            func.ST_AsGeoJSON(
                CountyModel.geom
            ).label("geometry"),
        )
        .order_by(
            CountyModel.county
        )
        .all()
    )

    features = []

    for county, geometry_text in counties:
        if geometry_text is None:
            continue

        geometry = json.loads(
            geometry_text
        )

        features.append(
            county_to_geojson(
                county,
                geometry,
            )
        )

    return {
        "type": "FeatureCollection",
        "features": features,
    }


# =========================================================
# COUNTY — SPATIAL INFRASTRUCTURE ANALYSIS
# =========================================================

@app.get(
    "/api/counties/{county_id}/analysis"
)
def analyse_county(
    county_id: int,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # FIND COUNTY
    # -----------------------------------------------------

    county = (
        db.query(CountyModel)
        .filter(
            CountyModel.id == county_id
        )
        .first()
    )

    if county is None:
        raise HTTPException(
            status_code=404,
            detail="County not found",
        )

    if county.geom is None:
        raise HTTPException(
            status_code=404,
            detail="County geometry not found",
        )

    # -----------------------------------------------------
    # COUNTY GEOMETRY SUBQUERY
    #
    # This keeps the spatial operation inside PostgreSQL
    # instead of repeatedly passing the full county
    # geometry from Python back to PostGIS.
    # -----------------------------------------------------

    county_geometry = (
        db.query(
            CountyModel.geom
        )
        .filter(
            CountyModel.id == county_id
        )
        .scalar_subquery()
    )

    # -----------------------------------------------------
    # PROJECTS INSIDE / TOUCHING COUNTY
    # -----------------------------------------------------

    projects_inside = (
        db.query(ProjectModel)
        .filter(
            func.ST_Intersects(
                ProjectModel.geom,
                county_geometry,
            )
        )
        .order_by(
            ProjectModel.id
        )
        .all()
    )

    project_results = [
        project_to_dict(project)
        for project in projects_inside
    ]

    # -----------------------------------------------------
    # ROADS INTERSECTING COUNTY
    # -----------------------------------------------------

    roads_intersecting = (
        db.query(RoadModel)
        .filter(
            func.ST_Intersects(
                RoadModel.geom,
                county_geometry,
            )
        )
        .order_by(
            RoadModel.id
        )
        .all()
    )

    road_results = []
    total_road_length_km = 0.0

    # -----------------------------------------------------
    # ROAD LENGTH ACTUALLY INSIDE COUNTY
    #
    # ST_Intersection clips each road to the county.
    #
    # ST_CollectionExtract(..., 2) ensures only LINESTRING
    # components are measured if the intersection happens
    # to return a geometry collection.
    #
    # Casting to Geography makes ST_Length return metres.
    # -----------------------------------------------------

    for road in roads_intersecting:
        clipped_road = (
            func.ST_CollectionExtract(
                func.ST_Intersection(
                    RoadModel.geom,
                    county_geometry,
                ),
                2,
            )
        )

        length_meters = (
            db.query(
                func.ST_Length(
                    cast(
                        clipped_road,
                        Geography,
                    )
                )
            )
            .filter(
                RoadModel.id == road.id
            )
            .scalar()
        )

        if length_meters is None:
            length_km = 0.0
        else:
            length_km = (
                float(length_meters) / 1000
            )

        total_road_length_km += (
            length_km
        )

        road_results.append({
            "id": road.id,
            "name": road.name,
            "roadClass": road.road_class,
            "status": road.status,
            "totalRoadLengthKm": round(
                road.length_km or 0,
                2,
            ),
            "lengthInsideCountyKm": round(
                length_km,
                2,
            ),
            "description": (
                road.description or ""
            ),
        })

    # -----------------------------------------------------
    # PROJECT TYPE SUMMARY
    # -----------------------------------------------------

    project_type_summary = {}

    for project in projects_inside:
        project_type = (
            project.type or "Unknown"
        )

        project_type_summary[
            project_type
        ] = (
            project_type_summary.get(
                project_type,
                0,
            ) + 1
        )

    # -----------------------------------------------------
    # PROJECT STATUS SUMMARY
    # -----------------------------------------------------

    project_status_summary = {}

    for project in projects_inside:
        project_status = (
            project.status or "Unknown"
        )

        project_status_summary[
            project_status
        ] = (
            project_status_summary.get(
                project_status,
                0,
            ) + 1
        )

    # -----------------------------------------------------
    # ROAD STATUS SUMMARY
    # -----------------------------------------------------

    road_status_summary = {}

    for road in roads_intersecting:
        road_status = (
            road.status or "Unknown"
        )

        road_status_summary[
            road_status
        ] = (
            road_status_summary.get(
                road_status,
                0,
            ) + 1
        )

    # -----------------------------------------------------
    # RETURN SPATIAL ANALYSIS
    # -----------------------------------------------------

    return {
        "county": {
            "id": county.id,
            "name": county.county,
            "province": county.province,
            "population": (
                county.population or 0
            ),
            "male": (
                county.male or 0
            ),
            "female": (
                county.female or 0
            ),
        },

        "infrastructure": {
            "projectCount": len(
                projects_inside
            ),
            "roadCount": len(
                roads_intersecting
            ),
            "roadLengthInsideCountyKm": round(
                total_road_length_km,
                2,
            ),
        },

        "projectStatusSummary":
            project_status_summary,

        "projectTypeSummary":
            project_type_summary,

        "roadStatusSummary":
            road_status_summary,

        "projects":
            project_results,

        "roads":
            road_results,

        "spatialOperations": [
            "ST_Intersects",
            "ST_Intersection",
            "ST_CollectionExtract",
            "ST_Length",
            "Geography",
        ],
    }


# =========================================================
# COUNTIES — GET ONE AS GEOJSON
# =========================================================

@app.get("/api/counties/{county_id}")
def get_county(
    county_id: int,
    db: Session = Depends(get_db),
):
    result = (
        db.query(
            CountyModel,
            func.ST_AsGeoJSON(
                CountyModel.geom
            ).label("geometry"),
        )
        .filter(
            CountyModel.id == county_id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="County not found",
        )

    county, geometry_text = result

    if geometry_text is None:
        raise HTTPException(
            status_code=404,
            detail="County geometry not found",
        )

    geometry = json.loads(
        geometry_text
    )

    return county_to_geojson(
        county,
        geometry,
    )