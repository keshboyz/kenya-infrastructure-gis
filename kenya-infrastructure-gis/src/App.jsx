import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./App.css";

import RoadDrawing from "./components/RoadDrawing";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import CountyBoundaries from "./components/CountyBoundaries";
import CountyAnalysisPanel from "./components/CountyAnalysisPanel";
import CountyComparison from "./components/CountyComparison";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject as deleteProjectAPI,
  getRoads,
  createRoad,
  deleteRoad as deleteRoadAPI,
} from "./api";


const emptyProject = {
  name: "",
  county: "",
  type: "Road",
  status: "Planned",
  latitude: "",
  longitude: "",
  description: "",
};


const emptyRoad = {
  name: "",
  road_class: "Highway",
  status: "Operational",
  description: "",
  coordinates: "",
};


const emptyRoadCollection = {
  type: "FeatureCollection",
  features: [],
};


function App() {
  // =====================================================
  // APPLICATION STATE
  // =====================================================

  const [activePage, setActivePage] =
    useState("map");

  const [projects, setProjects] =
    useState([]);

  const [roads, setRoads] =
    useState(emptyRoadCollection);

  const [loading, setLoading] =
    useState(true);

  const [roadsLoading, setRoadsLoading] =
    useState(true);

  const [apiError, setApiError] =
    useState("");

  const [roadsError, setRoadsError] =
    useState("");


  // =====================================================
  // FILTERS
  // =====================================================

  const [selectedCounty, setSelectedCounty] =
    useState("All");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [selectedType, setSelectedType] =
    useState("All");


  // =====================================================
  // MAP LAYERS
  // =====================================================

  const [showProjects, setShowProjects] =
    useState(true);

  const [showRoads, setShowRoads] =
    useState(true);

  const [showCounties, setShowCounties] =
    useState(true);

  const [
    selectedCountyAnalysis,
    setSelectedCountyAnalysis,
  ] = useState(null);


  // =====================================================
  // SEARCH
  // =====================================================

  const [searchTerm, setSearchTerm] =
    useState("");

  const [roadSearchTerm, setRoadSearchTerm] =
    useState("");


  // =====================================================
  // PROJECT MODAL
  // =====================================================

  const [showProjectModal, setShowProjectModal] =
    useState(false);

  const [editingProjectId, setEditingProjectId] =
    useState(null);

  const [projectForm, setProjectForm] =
    useState(emptyProject);


  // =====================================================
  // ROAD MODAL
  // =====================================================

  const [showRoadModal, setShowRoadModal] =
    useState(false);

  const [roadForm, setRoadForm] =
    useState(emptyRoad);

  const [savingRoad, setSavingRoad] =
    useState(false);


  // =====================================================
  // LOAD PROJECTS
  // =====================================================

  const loadProjects = async () => {
    try {
      setLoading(true);
      setApiError("");

      const data = await getProjects();

      setProjects(data);
    } catch (error) {
      console.error(error);

      setApiError(
        "Unable to load projects from FastAPI."
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // LOAD ROADS
  // =====================================================

  const loadRoads = async () => {
    try {
      setRoadsLoading(true);
      setRoadsError("");

      const data = await getRoads();

      if (
        data &&
        data.type === "FeatureCollection" &&
        Array.isArray(data.features)
      ) {
        setRoads(data);
      } else {
        throw new Error(
          "Invalid GeoJSON returned by the Roads API."
        );
      }
    } catch (error) {
      console.error(error);

      setRoadsError(
        "Unable to load roads from PostGIS."
      );

      setRoads(
        emptyRoadCollection
      );
    } finally {
      setRoadsLoading(false);
    }
  };


  // =====================================================
  // INITIAL DATA LOAD
  // =====================================================

  useEffect(() => {
    loadProjects();
    loadRoads();
  }, []);


  // =====================================================
  // COUNTY LIST
  // =====================================================

  const counties = [
    ...new Set(
      projects.map(
        (project) => project.county
      )
    ),
  ].sort();


  // =====================================================
  // FILTER PROJECTS
  // =====================================================

  const filteredProjects =
    projects.filter((project) => {
      const countyMatch =
        selectedCounty === "All" ||
        project.county === selectedCounty;

      const statusMatch =
        selectedStatus === "All" ||
        project.status === selectedStatus;

      const typeMatch =
        selectedType === "All" ||
        project.type === selectedType;

      return (
        countyMatch &&
        statusMatch &&
        typeMatch
      );
    });


  // =====================================================
  // SEARCH PROJECTS
  // =====================================================

  const searchedProjects =
    projects.filter((project) => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return (
        project.name
          .toLowerCase()
          .includes(search) ||

        project.county
          .toLowerCase()
          .includes(search) ||

        project.type
          .toLowerCase()
          .includes(search) ||

        project.status
          .toLowerCase()
          .includes(search) ||

        (project.description || "")
          .toLowerCase()
          .includes(search)
      );
    });


  // =====================================================
  // SEARCH ROADS
  // =====================================================

  const searchedRoads =
    roads.features.filter((feature) => {
      const search =
        roadSearchTerm
          .trim()
          .toLowerCase();

      const properties =
        feature.properties || {};

      return (
        (properties.name || "")
          .toLowerCase()
          .includes(search) ||

        (properties.roadClass || "")
          .toLowerCase()
          .includes(search) ||

        (properties.status || "")
          .toLowerCase()
          .includes(search) ||

        (properties.description || "")
          .toLowerCase()
          .includes(search)
      );
    });


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalProjects =
    projects.length;

  const completedProjects =
    projects.filter(
      (project) =>
        project.status === "Completed"
    ).length;

  const ongoingProjects =
    projects.filter(
      (project) =>
        project.status === "Ongoing"
    ).length;

  const totalRoads =
    roads.features.length;

  const totalRoadLength =
    roads.features.reduce(
      (total, feature) => {
        const length =
          Number(
            feature.properties?.lengthKm
          ) || 0;

        return total + length;
      },
      0
    );


  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSelectedCounty("All");
    setSelectedStatus("All");
    setSelectedType("All");
  };


  // =====================================================
  // PROJECT FORM
  // =====================================================

  const handleProjectInput =
    (event) => {
      const { name, value } =
        event.target;

      setProjectForm(
        (previousForm) => ({
          ...previousForm,
          [name]: value,
        })
      );
    };


  const openAddProject = () => {
    setEditingProjectId(null);
    setProjectForm(emptyProject);
    setShowProjectModal(true);
  };


  const openEditProject =
    (project) => {
      setEditingProjectId(
        project.id
      );

      setProjectForm({
        name: project.name,
        county: project.county,
        type: project.type,
        status: project.status,
        latitude: project.latitude,
        longitude: project.longitude,
        description:
          project.description,
      });

      setShowProjectModal(true);
    };


  const closeProjectModal = () => {
    setShowProjectModal(false);
    setEditingProjectId(null);
    setProjectForm(emptyProject);
  };


  // =====================================================
  // SAVE PROJECT
  // =====================================================

  const handleSaveProject =
    async (event) => {
      event.preventDefault();

      if (
        !projectForm.name.trim() ||
        !projectForm.county.trim() ||
        projectForm.latitude === "" ||
        projectForm.longitude === ""
      ) {
        alert(
          "Please enter the project name, county, latitude and longitude."
        );

        return;
      }

      const latitude =
        Number(
          projectForm.latitude
        );

      const longitude =
        Number(
          projectForm.longitude
        );

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        alert(
          "Latitude and longitude must be valid numbers."
        );

        return;
      }

      if (
        latitude < -90 ||
        latitude > 90
      ) {
        alert(
          "Latitude must be between -90 and 90."
        );

        return;
      }

      if (
        longitude < -180 ||
        longitude > 180
      ) {
        alert(
          "Longitude must be between -180 and 180."
        );

        return;
      }

      const projectPayload = {
        name:
          projectForm.name.trim(),

        county:
          projectForm.county.trim(),

        type:
          projectForm.type,

        status:
          projectForm.status,

        latitude,

        longitude,

        description:
          projectForm
            .description
            .trim(),
      };

      try {
        if (
          editingProjectId !== null
        ) {
          const updatedProject =
            await updateProject(
              editingProjectId,
              projectPayload
            );

          setProjects(
            (previousProjects) =>
              previousProjects.map(
                (project) =>
                  project.id ===
                  editingProjectId
                    ? updatedProject
                    : project
              )
          );
        } else {
          const createdProject =
            await createProject(
              projectPayload
            );

          setProjects(
            (previousProjects) => [
              ...previousProjects,
              createdProject,
            ]
          );
        }

        closeProjectModal();
      } catch (error) {
        console.error(error);

        alert(
          editingProjectId !== null
            ? "The project could not be updated."
            : "The project could not be created."
        );
      }
    };


  // =====================================================
  // DELETE PROJECT
  // =====================================================

  const deleteProject =
    async (project) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${project.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteProjectAPI(
          project.id
        );

        setProjects(
          (previousProjects) =>
            previousProjects.filter(
              (existingProject) =>
                existingProject.id !==
                project.id
            )
        );
      } catch (error) {
        console.error(error);

        alert(
          "The project could not be deleted."
        );
      }
    };


  // =====================================================
  // ROAD FORM
  // =====================================================

  const handleRoadInput =
    (event) => {
      const { name, value } =
        event.target;

      setRoadForm(
        (previousForm) => ({
          ...previousForm,
          [name]: value,
        })
      );
    };


  const openAddRoad = () => {
    setRoadForm(emptyRoad);
    setShowRoadModal(true);
  };


  const closeRoadModal = () => {
    if (savingRoad) {
      return;
    }

    setShowRoadModal(false);
    setRoadForm(emptyRoad);
  };


  // =====================================================
  // ROAD DRAWN ON LEAFLET MAP
  // =====================================================

  const handleRoadDrawn = (coordinates) => {
    if (
      !coordinates ||
      coordinates.length < 2
    ) {
      return;
    }

    const coordinateText =
      coordinates
        .map(
          ([longitude, latitude]) =>
            `${longitude.toFixed(6)},${latitude.toFixed(6)}`
        )
        .join("\n");

    setRoadForm({
      ...emptyRoad,
      coordinates: coordinateText,
    });

    setShowRoadModal(true);
  };


  // =====================================================
  // PARSE ROAD COORDINATES
  // =====================================================

  const parseRoadCoordinates =
    (coordinateText) => {
      const lines =
        coordinateText
          .split("\n")
          .map(
            (line) =>
              line.trim()
          )
          .filter(Boolean);

      if (lines.length < 2) {
        throw new Error(
          "Enter at least two coordinate pairs."
        );
      }

      return lines.map(
        (line, index) => {
          const parts =
            line
              .split(",")
              .map(
                (value) =>
                  value.trim()
              );

          if (parts.length !== 2) {
            throw new Error(
              `Coordinate line ${index + 1} must use longitude,latitude.`
            );
          }

          const longitude =
            Number(parts[0]);

          const latitude =
            Number(parts[1]);

          if (
            Number.isNaN(longitude) ||
            Number.isNaN(latitude)
          ) {
            throw new Error(
              `Coordinate line ${index + 1} contains an invalid number.`
            );
          }

          if (
            longitude < -180 ||
            longitude > 180
          ) {
            throw new Error(
              `Longitude on line ${index + 1} must be between -180 and 180.`
            );
          }

          if (
            latitude < -90 ||
            latitude > 90
          ) {
            throw new Error(
              `Latitude on line ${index + 1} must be between -90 and 90.`
            );
          }

          return [
            longitude,
            latitude,
          ];
        }
      );
    };


  // =====================================================
  // CREATE ROAD
  // =====================================================

  const handleSaveRoad =
    async (event) => {
      event.preventDefault();

      if (!roadForm.name.trim()) {
        alert(
          "Please enter the road name."
        );

        return;
      }

      if (
        !roadForm.coordinates.trim()
      ) {
        alert(
          "Please enter the road coordinates."
        );

        return;
      }

      let coordinates;

      try {
        coordinates =
          parseRoadCoordinates(
            roadForm.coordinates
          );
      } catch (error) {
        alert(error.message);
        return;
      }

      const roadPayload = {
        name:
          roadForm.name.trim(),

        road_class:
          roadForm.road_class,

        status:
          roadForm.status,

        description:
          roadForm
            .description
            .trim(),

        coordinates,
      };

      try {
        setSavingRoad(true);

        const createdFeature =
          await createRoad(
            roadPayload
          );

        setRoads(
          (previousRoads) => ({
            ...previousRoads,

            features: [
              ...previousRoads.features,
              createdFeature,
            ],
          })
        );

        setShowRoadModal(false);
        setRoadForm(emptyRoad);
      } catch (error) {
        console.error(error);

        alert(
          "The road could not be created."
        );
      } finally {
        setSavingRoad(false);
      }
    };


  // =====================================================
  // DELETE ROAD
  // =====================================================

  const deleteRoad =
    async (feature) => {
      const road =
        feature.properties;

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${road.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteRoadAPI(
          road.id
        );

        setRoads(
          (previousRoads) => ({
            ...previousRoads,

            features:
              previousRoads.features.filter(
                (existingFeature) =>
                  existingFeature
                    .properties
                    .id !==
                  road.id
              ),
          })
        );
      } catch (error) {
        console.error(error);

        alert(
          "The road could not be deleted."
        );
      }
    };


  // =====================================================
  // ROAD POPUPS
  // =====================================================

  const roadInteraction =
    (feature, layer) => {
      const {
        name,
        roadClass,
        status,
        lengthKm,
        description,
      } = feature.properties;

      const lengthText =
        lengthKm !== null &&
        lengthKm !== undefined
          ? `${Number(
              lengthKm
            ).toFixed(2)} km`
          : "Not available";

      layer.bindPopup(`
        <div class="road-popup">

          <h3>${name}</h3>

          <p>
            <strong>Road Class:</strong>
            ${roadClass}
          </p>

          <p>
            <strong>Status:</strong>
            ${status}
          </p>

          <p>
            <strong>Length:</strong>
            ${lengthText}
          </p>

          <p>
            ${description || ""}
          </p>

        </div>
      `);
    };


  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div>

          <h1>
            Kenya Infrastructure GIS Explorer
          </h1>

          <p>
            Infrastructure Mapping &
            Spatial Analysis Platform
          </p>

        </div>


        <div className="developer">

          <span className="developer-dot"></span>

          Nyauche Otieno

        </div>

      </header>


      <div className="dashboard">

        {/* ===============================================
            SIDEBAR
        =============================================== */}

        <aside className="sidebar">

          <h3>PLATFORM</h3>


          <nav>

            <button
              className={
                activePage === "map"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("map")
              }
            >
              Map Explorer
            </button>


            <button
              className={
                activePage === "roads"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("roads")
              }
            >
              Roads
            </button>


            <button
              className={
                activePage === "projects"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage(
                  "projects"
                )
              }
            >
              Projects
            </button>


            <button
              className={
                activePage ===
                "analytics"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage(
                  "analytics"
                )
              }
            >
              Analytics
            </button>


            <button
              className={
                activePage ===
                "comparison"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActivePage(
                  "comparison"
                );

                setSelectedCountyAnalysis(
                  null
                );
              }}
            >
              Compare Counties
            </button>

          </nav>


          {/* =============================================
              MAP FILTERS
          ============================================= */}

          {activePage === "map" && (
            <>

              <div className="filters">

                <h3>
                  FILTER DATA
                </h3>


                <label>
                  County
                </label>


                <select
                  value={
                    selectedCounty
                  }
                  onChange={(event) =>
                    setSelectedCounty(
                      event.target.value
                    )
                  }
                >

                  <option value="All">
                    All Counties
                  </option>


                  {counties.map(
                    (county) => (

                      <option
                        key={county}
                        value={county}
                      >
                        {county}
                      </option>

                    )
                  )}

                </select>


                <label>
                  Project Status
                </label>


                <select
                  value={
                    selectedStatus
                  }
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value
                    )
                  }
                >

                  <option value="All">
                    All Projects
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Ongoing">
                    Ongoing
                  </option>

                  <option value="Planned">
                    Planned
                  </option>

                </select>


                <label>
                  Infrastructure Type
                </label>


                <select
                  value={
                    selectedType
                  }
                  onChange={(event) =>
                    setSelectedType(
                      event.target.value
                    )
                  }
                >

                  <option value="All">
                    All Infrastructure
                  </option>

                  <option value="Road">
                    Road
                  </option>

                  <option value="Bridge">
                    Bridge
                  </option>

                  <option value="Highway">
                    Highway
                  </option>

                </select>


                <button
                  className="reset-button"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>

              </div>


              <div className="layer-section">

                <h3>
                  MAP LAYERS
                </h3>


                <div className="layer-item">

                  <label>

                    <input
                      type="checkbox"
                      checked={
                        showCounties
                      }
                      onChange={() =>
                        setShowCounties(
                          !showCounties
                        )
                      }
                    />

                    County Boundaries

                  </label>

                </div>


                <div className="layer-item">

                  <label>

                    <input
                      type="checkbox"
                      checked={
                        showProjects
                      }
                      onChange={() =>
                        setShowProjects(
                          !showProjects
                        )
                      }
                    />

                    Project Locations

                  </label>

                </div>


                <div className="layer-item">

                  <label>

                    <input
                      type="checkbox"
                      checked={
                        showRoads
                      }
                      onChange={() =>
                        setShowRoads(
                          !showRoads
                        )
                      }
                    />

                    PostGIS Road Network

                  </label>

                </div>

              </div>

            </>
          )}


          {/* =============================================
              API STATUS
          ============================================= */}

          <div className="data-info">

            <h3>
              API STATUS
            </h3>


            {loading ? (

              <p>
                Loading projects...
              </p>

            ) : apiError ? (

              <p>
                {apiError}
              </p>

            ) : (

              <p>
                Loaded: {projects.length}
                {" "}
                project records loaded.
              </p>

            )}


            {roadsLoading ? (

              <p>
                Loading PostGIS roads...
              </p>

            ) : roadsError ? (

              <p>
                {roadsError}
              </p>

            ) : (

              <p>
                Loaded: {totalRoads}
                {" "}
                road corridors loaded.
              </p>

            )}

          </div>

        </aside>


        {/* ===============================================
            MAIN CONTENT
        =============================================== */}

        <main className="main-content">


          {/* =============================================
              MAP PAGE
          ============================================= */}

          {activePage === "map" && (
            <>

              <section className="stats-container">


                <div className="stat-card">

                  <span className="stat-title">
                    Total Projects
                  </span>

                  <strong>
                    {totalProjects}
                  </strong>

                  <span className="stat-description">
                    PostGIS point records
                  </span>

                </div>


                <div className="stat-card">

                  <span className="stat-title">
                    Completed
                  </span>

                  <strong>
                    {completedProjects}
                  </strong>

                  <span className="stat-description">
                    Completed projects
                  </span>

                </div>


                <div className="stat-card">

                  <span className="stat-title">
                    Ongoing
                  </span>

                  <strong>
                    {ongoingProjects}
                  </strong>

                  <span className="stat-description">
                    Projects in progress
                  </span>

                </div>


                <div className="stat-card">

                  <span className="stat-title">
                    Road Corridors
                  </span>

                  <strong>
                    {totalRoads}
                  </strong>

                  <span className="stat-description">
                    PostGIS line records
                  </span>

                </div>

              </section>


              <section className="map-area">


                <div className="map-title">

                  <div>

                    <h2>
                      Infrastructure Map
                    </h2>

                    <p>
                      PostgreSQL/PostGIS
                      spatial data rendered
                      with Leaflet. Use the
                      drawing tool on the
                      map to trace a new road.
                    </p>

                  </div>


                  <div className="map-summary">

                    <span>
                      {" "}
                      {showProjects
                        ? filteredProjects.length
                        : 0}
                      {" "}
                      Projects
                    </span>


                    <span>
                      {" "}
                      {showRoads
                        ? totalRoads
                        : 0}
                      {" "}
                      Roads
                    </span>

                  </div>

                </div>


                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "500px",
                    minHeight: "500px",
                    overflow: "hidden",
                  }}
                >

                  <div
                    className="map-wrapper"
                    style={{
                      flex: "1 1 auto",
                      width: "auto",
                      minWidth: 0,
                      height: "500px",
                    }}
                  >

                  <MapContainer
                    center={[
                      -0.5,
                      37.5,
                    ]}
                    zoom={6}
                    className="map"
                  >

                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />


                    <RoadDrawing
                      onRoadDrawn={
                        handleRoadDrawn
                      }
                    />


                    {showCounties && (
                      <CountyBoundaries
                        onCountyAnalysis={
                          setSelectedCountyAnalysis
                        }
                      />
                    )}


                    {showRoads &&
                      totalRoads > 0 && (

                        <GeoJSON
                          key={
                            JSON.stringify(
                              roads
                            )
                          }
                          data={roads}
                          onEachFeature={
                            roadInteraction
                          }
                        />

                      )}


                    {showProjects &&
                      filteredProjects.map(
                        (project) => (

                          <Marker
                            key={
                              project.id
                            }
                            position={[
                              project.latitude,
                              project.longitude,
                            ]}
                          >

                            <Popup>

                              <div className="project-popup">

                                <h3>
                                  {project.name}
                                </h3>


                                <p>
                                  <strong>
                                    County:
                                  </strong>
                                  {" "}
                                  {project.county}
                                </p>


                                <p>
                                  <strong>
                                    Type:
                                  </strong>
                                  {" "}
                                  {project.type}
                                </p>


                                <p>
                                  <strong>
                                    Status:
                                  </strong>
                                  {" "}
                                  {project.status}
                                </p>


                                <p>
                                  {project.description}
                                </p>

                              </div>

                            </Popup>

                          </Marker>

                        )
                      )}

                  </MapContainer>

                  </div>


                  {selectedCountyAnalysis && (
                    <CountyAnalysisPanel
                      analysis={
                        selectedCountyAnalysis
                      }
                      onClose={() =>
                        setSelectedCountyAnalysis(
                          null
                        )
                      }
                    />
                  )}

                </div>

              </section>

            </>
          )}


          {/* =============================================
              PROJECTS PAGE
          ============================================= */}

          {activePage === "projects" && (

            <section className="page-section">


              <div className="page-header">

                <div>

                  <h2>
                    Infrastructure Projects
                  </h2>

                  <p>
                    Manage PostGIS project
                    point records through
                    FastAPI.
                  </p>

                </div>


                <div className="record-count">

                  {searchedProjects.length}
                  {" "}
                  records

                </div>

              </div>


              <div className="project-toolbar">


                <input
                  type="text"
                  placeholder="Search project, county, type or status..."
                  value={
                    searchTerm
                  }
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />


                <button
                  className="add-project-button"
                  onClick={
                    openAddProject
                  }
                >
                  + Add Project
                </button>

              </div>


              <div className="table-container">


                <table className="projects-table">

                  <thead>

                    <tr>

                      <th>
                        Project
                      </th>

                      <th>
                        County
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Latitude
                      </th>

                      <th>
                        Longitude
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {searchedProjects.map(
                      (project) => (

                        <tr
                          key={
                            project.id
                          }
                        >

                          <td>

                            <div className="project-name">

                              {project.name}

                            </div>


                            <div className="project-description">

                              {project.description}

                            </div>

                          </td>


                          <td>
                            {project.county}
                          </td>


                          <td>
                            {project.type}
                          </td>


                          <td>

                            <span
                              className={`status-badge ${project.status.toLowerCase()}`}
                            >

                              {project.status}

                            </span>

                          </td>


                          <td>
                            {project.latitude}
                          </td>


                          <td>
                            {project.longitude}
                          </td>


                          <td>

                            <div className="action-buttons">


                              <button
                                className="edit-button"
                                onClick={() =>
                                  openEditProject(
                                    project
                                  )
                                }
                              >
                                Edit
                              </button>


                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteProject(
                                    project
                                  )
                                }
                              >
                                Delete
                              </button>


                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>


                {!loading &&
                  searchedProjects.length === 0 && (

                    <div className="no-results">

                      No infrastructure
                      projects found.

                    </div>

                  )}

              </div>

            </section>

          )}


          {/* =============================================
              ROADS PAGE
          ============================================= */}

          {activePage === "roads" && (

            <section className="page-section">


              <div className="page-header">

                <div>

                  <h2>
                    Road Network
                  </h2>

                  <p>
                    Create and manage
                    PostGIS LINESTRING
                    corridors through
                    FastAPI.
                  </p>

                </div>


                <div className="record-count">

                  {totalRoads}
                  {" "}
                  corridors

                </div>

              </div>


              <section className="stats-container">


                <div className="stat-card">

                  <span className="stat-title">
                    Road Corridors
                  </span>

                  <strong>
                    {totalRoads}
                  </strong>

                  <span className="stat-description">
                    Spatial line features
                  </span>

                </div>


                <div className="stat-card">

                  <span className="stat-title">
                    Total Length
                  </span>

                  <strong>
                    {totalRoadLength.toFixed(
                      1
                    )}
                  </strong>

                  <span className="stat-description">
                    Kilometres
                  </span>

                </div>


                <div className="stat-card">

                  <span className="stat-title">
                    Data Format
                  </span>

                  <strong>
                    GeoJSON
                  </strong>

                  <span className="stat-description">
                    FeatureCollection
                  </span>

                </div>


                <div className="stat-card">

                  <span className="stat-title">
                    Spatial CRS
                  </span>

                  <strong>
                    4326
                  </strong>

                  <span className="stat-description">
                    WGS 84
                  </span>

                </div>

              </section>


              <div className="project-toolbar">

                <input
                  type="text"
                  placeholder="Search road name, class or status..."
                  value={
                    roadSearchTerm
                  }
                  onChange={(event) =>
                    setRoadSearchTerm(
                      event.target.value
                    )
                  }
                />


                <button
                  className="add-project-button"
                  onClick={openAddRoad}
                >
                  + Add Road
                </button>

              </div>


              <div className="table-container">


                <table className="projects-table">

                  <thead>

                    <tr>

                      <th>
                        Road
                      </th>

                      <th>
                        Class
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Length
                      </th>

                      <th>
                        Geometry
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {searchedRoads.map(
                      (feature) => {
                        const road =
                          feature.properties;

                        return (

                          <tr
                            key={
                              road.id
                            }
                          >

                            <td>

                              <div className="project-name">

                                {road.name}

                              </div>


                              <div className="project-description">

                                {road.description}

                              </div>

                            </td>


                            <td>
                              {road.roadClass}
                            </td>


                            <td>

                              <span className="status-badge">

                                {road.status}

                              </span>

                            </td>


                            <td>

                              {Number(
                                road.lengthKm || 0
                              ).toFixed(2)}
                              {" "}
                              km

                            </td>


                            <td>
                              {
                                feature.geometry?.type
                              }
                            </td>


                            <td>

                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteRoad(
                                    feature
                                  )
                                }
                              >
                                Delete
                              </button>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>


                {!roadsLoading &&
                  searchedRoads.length === 0 && (

                    <div className="no-results">

                      No road corridors
                      found.

                    </div>

                  )}

              </div>

            </section>

          )}


          {/* =============================================
              ANALYTICS
          ============================================= */}

          {activePage === "analytics" && (

            <section className="page-section">

              <div className="page-header">

                <div>

                  <h2>
                    Infrastructure Analytics
                  </h2>

                  <p>
                    Live spatial and infrastructure
                    statistics generated from
                    PostgreSQL/PostGIS data.
                  </p>

                </div>

                <div className="record-count">
                  Live Data
                </div>

              </div>


              <AnalyticsDashboard
                projects={projects}
                roads={roads}
              />

            </section>

          )}


          {/* =============================================
              COUNTY COMPARISON
          ============================================= */}

          {activePage === "comparison" && (

            <section className="page-section">

              <CountyComparison
                onClose={() =>
                  setActivePage("map")
                }
              />

            </section>

          )}

        </main>

      </div>


      {/* =================================================
          PROJECT MODAL
      ================================================= */}

      {showProjectModal && (

        <div className="modal-overlay">


          <div className="modal">


            <div className="modal-header">

              <div>

                <h2>

                  {editingProjectId !== null
                    ? "Edit Infrastructure Project"
                    : "Add Infrastructure Project"}

                </h2>


                <p>

                  {editingProjectId !== null
                    ? "Update the selected PostGIS project record."
                    : "Create a new PostGIS project point."}

                </p>

              </div>


              <button
                className="close-button"
                onClick={
                  closeProjectModal
                }
              >
                X
              </button>

            </div>


            <form
              className="project-form"
              onSubmit={
                handleSaveProject
              }
            >


              <div className="form-group full-width">

                <label>
                  Project Name *
                </label>


                <input
                  type="text"
                  name="name"
                  value={
                    projectForm.name
                  }
                  onChange={
                    handleProjectInput
                  }
                  placeholder="e.g. Nairobi Eastern Bypass"
                />

              </div>


              <div className="form-grid">


                <div className="form-group">

                  <label>
                    County *
                  </label>


                  <input
                    type="text"
                    name="county"
                    value={
                      projectForm.county
                    }
                    onChange={
                      handleProjectInput
                    }
                    placeholder="e.g. Kiambu"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Infrastructure Type
                  </label>


                  <select
                    name="type"
                    value={
                      projectForm.type
                    }
                    onChange={
                      handleProjectInput
                    }
                  >

                    <option value="Road">
                      Road
                    </option>

                    <option value="Bridge">
                      Bridge
                    </option>

                    <option value="Highway">
                      Highway
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Status
                  </label>


                  <select
                    name="status"
                    value={
                      projectForm.status
                    }
                    onChange={
                      handleProjectInput
                    }
                  >

                    <option value="Planned">
                      Planned
                    </option>

                    <option value="Ongoing">
                      Ongoing
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Latitude *
                  </label>


                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={
                      projectForm.latitude
                    }
                    onChange={
                      handleProjectInput
                    }
                    placeholder="-1.2864"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Longitude *
                  </label>


                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={
                      projectForm.longitude
                    }
                    onChange={
                      handleProjectInput
                    }
                    placeholder="36.8172"
                  />

                </div>

              </div>


              <div className="form-group full-width">

                <label>
                  Description
                </label>


                <textarea
                  name="description"
                  value={
                    projectForm.description
                  }
                  onChange={
                    handleProjectInput
                  }
                  placeholder="Describe the infrastructure project..."
                  rows="4"
                />

              </div>


              <div className="form-actions">


                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeProjectModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-project-button"
                >

                  {editingProjectId !== null
                    ? "Save Changes"
                    : "Add Project"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          ADD ROAD MODAL
      ================================================= */}

      {showRoadModal && (

        <div className="modal-overlay">


          <div className="modal">


            <div className="modal-header">

              <div>

                <h2>
                  Add Road Corridor
                </h2>

                <p>
                  Complete the road details.
                  Coordinates drawn on the
                  Leaflet map are filled
                  automatically.
                </p>

              </div>


              <button
                className="close-button"
                onClick={closeRoadModal}
                disabled={savingRoad}
              >
                X
              </button>

            </div>


            <form
              className="project-form"
              onSubmit={handleSaveRoad}
            >


              <div className="form-group full-width">

                <label>
                  Road Name *
                </label>


                <input
                  type="text"
                  name="name"
                  value={roadForm.name}
                  onChange={handleRoadInput}
                  placeholder="e.g. Nairobi - Thika Corridor"
                />

              </div>


              <div className="form-grid">


                <div className="form-group">

                  <label>
                    Road Class
                  </label>


                  <select
                    name="road_class"
                    value={
                      roadForm.road_class
                    }
                    onChange={
                      handleRoadInput
                    }
                  >

                    <option value="Highway">
                      Highway
                    </option>

                    <option value="Primary">
                      Primary
                    </option>

                    <option value="Secondary">
                      Secondary
                    </option>

                    <option value="Road">
                      Road
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Status
                  </label>


                  <select
                    name="status"
                    value={
                      roadForm.status
                    }
                    onChange={
                      handleRoadInput
                    }
                  >

                    <option value="Operational">
                      Operational
                    </option>

                    <option value="Ongoing">
                      Ongoing
                    </option>

                    <option value="Planned">
                      Planned
                    </option>

                    <option value="Under Maintenance">
                      Under Maintenance
                    </option>

                  </select>

                </div>

              </div>


              <div className="form-group full-width">

                <label>
                  Description
                </label>


                <textarea
                  name="description"
                  value={
                    roadForm.description
                  }
                  onChange={
                    handleRoadInput
                  }
                  placeholder="Describe the road corridor..."
                  rows="3"
                />

              </div>


              <div className="form-group full-width">

                <label>
                  Road Coordinates *
                </label>


                <textarea
                  name="coordinates"
                  value={
                    roadForm.coordinates
                  }
                  onChange={
                    handleRoadInput
                  }
                  placeholder={
`36.8172,-1.2864
36.6500,-1.1000
36.4300,-0.8500
36.0800,-0.3031`
                  }
                  rows="7"
                />


                <small>
                  Draw a road on the map
                  to fill these coordinates
                  automatically, or enter
                  one coordinate pair per
                  line using
                  longitude,latitude.
                </small>

              </div>


              <div className="form-actions">


                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeRoadModal}
                  disabled={savingRoad}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-project-button"
                  disabled={savingRoad}
                >

                  {savingRoad
                    ? "Creating Road..."
                    : "Add Road"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default App;


