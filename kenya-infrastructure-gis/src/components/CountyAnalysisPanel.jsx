import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./CountyAnalysisPanel.css";


function CountyAnalysisPanel({
  analysis,
  onClose,
}) {
  if (!analysis) {
    return null;
  }


  const county =
    analysis.county || {};


  const infrastructure =
    analysis.infrastructure || {};


  const projects =
    Array.isArray(analysis.projects)
      ? analysis.projects
      : [];


  const roads =
    Array.isArray(analysis.roads)
      ? analysis.roads
      : [];


  const operations =
    Array.isArray(
      analysis.spatialOperations
    )
      ? analysis.spatialOperations
      : [];


  // =====================================================
  // FORMAT NUMBERS
  // =====================================================

  const formatNumber = (value) => {
    const number =
      Number(value);

    if (
      Number.isNaN(number) ||
      number === 0
    ) {
      return "Not available";
    }

    return number.toLocaleString();
  };


  // =====================================================
  // FORMAT LENGTH
  // =====================================================

  const formatLength = (value) => {
    const number =
      Number(value);

    if (Number.isNaN(number)) {
      return "0.00";
    }

    return number.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };


  // =====================================================
  // INFRASTRUCTURE CHART DATA
  // =====================================================

  const infrastructureChartData = [
    {
      name: "Projects",
      value:
        Number(
          infrastructure.projectCount
        ) || 0,
    },
    {
      name: "Roads",
      value:
        Number(
          infrastructure.roadCount
        ) || 0,
    },
  ];


  // =====================================================
  // ROAD LENGTH CHART DATA
  // =====================================================

  const roadLengthChartData =
    roads.map((road) => ({
      name:
        road.name ||
        "Unnamed Road",

      length:
        Number(
          road.lengthInsideCountyKm
        ) || 0,
    }));


  // =====================================================
  // SHORT ROAD NAME FOR CHART
  // =====================================================

  const shortenRoadName = (
    roadName
  ) => {
    if (!roadName) {
      return "Road";
    }

    if (roadName.length <= 19) {
      return roadName;
    }

    return `${roadName.slice(
      0,
      17
    )}...`;
  };


  return (
    <aside className="county-analysis-panel">

      {/* ===============================================
          PANEL HEADER
      =============================================== */}

      <div className="county-analysis-header">

        <div>

          <span className="county-analysis-label">
            COUNTY ANALYSIS
          </span>


          <h2>
            {county.name || "Selected County"}
          </h2>


          <p>
            {county.province
              ? `${county.province} Province`
              : "Kenya"}
          </p>

        </div>


        <button
          type="button"
          className="county-analysis-close"
          onClick={onClose}
          aria-label="Close county analysis"
        >
          ×
        </button>

      </div>


      {/* ===============================================
          COUNTY PROFILE
      =============================================== */}

      <section className="county-analysis-section">

        <h3>
          County Profile
        </h3>


        <div className="county-profile-grid">

          <div className="county-profile-item">

            <span>
              Population
            </span>

            <strong>
              {formatNumber(
                county.population
              )}
            </strong>

          </div>


          <div className="county-profile-item">

            <span>
              Male
            </span>

            <strong>
              {formatNumber(
                county.male
              )}
            </strong>

          </div>


          <div className="county-profile-item">

            <span>
              Female
            </span>

            <strong>
              {formatNumber(
                county.female
              )}
            </strong>

          </div>

        </div>

      </section>


      {/* ===============================================
          INFRASTRUCTURE SUMMARY
      =============================================== */}

      <section className="county-analysis-section">

        <h3>
          Infrastructure Summary
        </h3>


        <div className="county-analysis-stats">

          <div className="county-analysis-stat">

            <span>
              Projects
            </span>

            <strong>
              {
                Number(
                  infrastructure.projectCount
                ) || 0
              }
            </strong>

            <small>
              Point features
            </small>

          </div>


          <div className="county-analysis-stat">

            <span>
              Road Corridors
            </span>

            <strong>
              {
                Number(
                  infrastructure.roadCount
                ) || 0
              }
            </strong>

            <small>
              Intersections
            </small>

          </div>


          <div className="county-analysis-stat county-analysis-stat-wide">

            <span>
              Road Length Inside County
            </span>

            <strong>
              {formatLength(
                infrastructure
                  .roadLengthInsideCountyKm
              )}
              {" "}
              km
            </strong>

            <small>
              Clipped PostGIS geometry
            </small>

          </div>

        </div>

      </section>


      {/* ===============================================
          INFRASTRUCTURE CHART
      =============================================== */}

      <section className="county-analysis-section">

        <h3>
          Infrastructure Features
        </h3>


        <p className="county-chart-description">
          Spatial features intersecting
          the selected county boundary.
        </p>


        <div className="county-chart-container">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={
                infrastructureChartData
              }
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />


              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
              />


              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
              />


              <Tooltip
                formatter={(value) => [
                  value,
                  "Features",
                ]}
              />


              <Bar
                dataKey="value"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
              >

                {infrastructureChartData.map(
                  (entry) => (
                    <Cell
                      key={entry.name}
                    />
                  )
                )}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>

      </section>


      {/* ===============================================
          ROAD LENGTH CHART
      =============================================== */}

      <section className="county-analysis-section">

        <h3>
          Road Length by Corridor
        </h3>


        <p className="county-chart-description">
          Length of each mapped road
          corridor falling inside the
          selected county.
        </p>


        {roadLengthChartData.length ===
        0 ? (

          <div className="county-analysis-empty">

            No intersecting road
            corridors are available
            for charting.

          </div>

        ) : (

          <div
            className="county-road-chart-container"
            style={{
              height: Math.max(
                180,
                roadLengthChartData.length *
                  55
              ),
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  roadLengthChartData
                }
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 15,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />


                <XAxis
                  type="number"
                  tick={{
                    fontSize: 9,
                  }}
                  axisLine={false}
                  tickLine={false}
                  unit=" km"
                />


                <YAxis
                  type="category"
                  dataKey="name"
                  width={115}
                  tick={{
                    fontSize: 9,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    shortenRoadName
                  }
                />


                <Tooltip
                  formatter={(value) => [
                    `${formatLength(
                      value
                    )} km`,
                    "Inside county",
                  ]}
                />


                <Bar
                  dataKey="length"
                  radius={[
                    0,
                    5,
                    5,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        )}

      </section>


      {/* ===============================================
          PROJECTS
      =============================================== */}

      <section className="county-analysis-section">

        <div className="county-analysis-section-title">

          <h3>
            Projects
          </h3>

          <span>
            {projects.length}
          </span>

        </div>


        {projects.length === 0 ? (

          <div className="county-analysis-empty">

            No mapped infrastructure
            projects intersect this county.

          </div>

        ) : (

          <div className="county-analysis-list">

            {projects.map(
              (project) => (

                <div
                  className="county-analysis-record"
                  key={project.id}
                >

                  <div className="county-record-icon">
                    P
                  </div>


                  <div className="county-record-content">

                    <strong>
                      {project.name}
                    </strong>


                    <span>
                      {project.type ||
                        "Unknown type"}
                      {" • "}
                      {project.status ||
                        "Unknown status"}
                    </span>


                    {project.description && (

                      <small>
                        {project.description}
                      </small>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ===============================================
          ROAD CORRIDORS
      =============================================== */}

      <section className="county-analysis-section">

        <div className="county-analysis-section-title">

          <h3>
            Road Corridors
          </h3>

          <span>
            {roads.length}
          </span>

        </div>


        {roads.length === 0 ? (

          <div className="county-analysis-empty">

            No mapped road corridors
            intersect this county.

          </div>

        ) : (

          <div className="county-analysis-list">

            {roads.map(
              (road) => (

                <div
                  className="county-analysis-record"
                  key={road.id}
                >

                  <div className="county-record-icon">
                    R
                  </div>


                  <div className="county-record-content">

                    <strong>
                      {road.name}
                    </strong>


                    <span>
                      {road.roadClass ||
                        "Unknown class"}
                      {" • "}
                      {road.status ||
                        "Unknown status"}
                    </span>


                    <div className="county-road-length">

                      <span>
                        Inside county
                      </span>


                      <strong>
                        {formatLength(
                          road
                            .lengthInsideCountyKm
                        )}
                        {" "}
                        km
                      </strong>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ===============================================
          SPATIAL OPERATIONS
      =============================================== */}

      <section className="county-analysis-section">

        <h3>
          Spatial Operations
        </h3>


        <div className="county-operation-list">

          {operations.map(
            (operation) => (

              <span
                key={operation}
                className="county-operation-badge"
              >
                {operation}
              </span>

            )
          )}

        </div>


        <div className="county-analysis-engine">

          <strong>
            PostgreSQL / PostGIS
          </strong>


          <span>
            Spatial analysis performed
            against the selected county
            MULTIPOLYGON boundary.
          </span>

        </div>

      </section>

    </aside>
  );
}


export default CountyAnalysisPanel;