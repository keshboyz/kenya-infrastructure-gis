from geoalchemy2 import Geometry

from sqlalchemy import (
    BigInteger,
    Column,
    Float,
    Integer,
    String,
    Text,
)

from database import Base


# =========================================================
# PROJECT DATABASE MODEL
# =========================================================

class Project(Base):
    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(200),
        nullable=False,
    )

    county = Column(
        String(100),
        nullable=False,
    )

    type = Column(
        String(100),
        nullable=False,
    )

    status = Column(
        String(50),
        nullable=False,
    )

    latitude = Column(
        Float,
        nullable=False,
    )

    longitude = Column(
        Float,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
        default="",
    )

    geom = Column(
        Geometry(
            geometry_type="POINT",
            srid=4326,
            spatial_index=True,
        ),
        nullable=False,
    )


# =========================================================
# ROAD DATABASE MODEL
# =========================================================

class Road(Base):
    __tablename__ = "roads"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(200),
        nullable=False,
    )

    road_class = Column(
        String(100),
        nullable=False,
    )

    status = Column(
        String(50),
        nullable=False,
    )

    length_km = Column(
        Float,
        nullable=True,
    )

    description = Column(
        Text,
        nullable=False,
        default="",
    )

    geom = Column(
        Geometry(
            geometry_type="LINESTRING",
            srid=4326,
            spatial_index=True,
        ),
        nullable=False,
    )


# =========================================================
# COUNTY DATABASE MODEL
# =========================================================

class County(Base):
    __tablename__ = "counties"

    id = Column(
        Integer,
        primary_key=True,
    )

    objectid_1 = Column(
        BigInteger,
        nullable=True,
    )

    county = Column(
        String(20),
        nullable=True,
    )

    province = Column(
        String(50),
        nullable=True,
    )

    adm0 = Column(
        String(50),
        nullable=True,
    )

    adm3 = Column(
        String(50),
        nullable=True,
    )

    adm4 = Column(
        String(50),
        nullable=True,
    )

    shape_leng = Column(
        Float,
        nullable=True,
    )

    shape_area = Column(
        Float,
        nullable=True,
    )

    area = Column(
        Float,
        nullable=True,
    )

    counties = Column(
        String(50),
        nullable=True,
    )

    population = Column(
        BigInteger,
        nullable=True,
    )

    male = Column(
        BigInteger,
        nullable=True,
    )

    female = Column(
        BigInteger,
        nullable=True,
    )

    geom = Column(
        Geometry(
            geometry_type="MULTIPOLYGON",
            srid=4326,
            spatial_index=True,
        ),
        nullable=True,
    )