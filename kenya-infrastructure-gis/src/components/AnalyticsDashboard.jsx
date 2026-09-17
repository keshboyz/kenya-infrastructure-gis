import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


function AnalyticsDashboard({
  projects,
  roads,
}) {
  // =====================================================
  // PROJECT ANALYTICS
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


  const plannedProjects =
    projects.filter(
      (project) =>
        project.status === "Planned"
    ).length;


  // =====================================================
  // ROAD ANALYTICS
  // =====================================================

  const roadFeatures =
    roads?.features || [];


  const totalRoads =
    roadFeatures.length;


  const totalRoadLength =
    roadFeatures.reduce(
      (total, feature) => {
        const length =
          Number(
            feature.properties?.lengthKm
          ) || 0;

        return total + length;
      },
      0
    );


  const averageRoadLength =
    totalRoads > 0
      ? totalRoadLength /
        totalRoads
      : 0;


  const longestRoad =
    roadFeatures.reduce(
      (longest, feature) => {
        if (!longest) {
          return feature;
        }

        const currentLength =
          Number(
            feature.properties?.lengthKm
          ) || 0;

        const longestLength =
          Number(
            longest.properties?.lengthKm
          ) || 0;

        return currentLength >
          longestLength
          ? feature
          : longest;
      },
      null
    );


  // =====================================================
  // ROAD STATUS
  // =====================================================

  const operationalRoads =
    roadFeatures.filter(
      (feature) =>
        feature.properties?.status ===
        "Operational"
    ).length;


  const ongoingRoads =
    roadFeatures.filter(
      (feature) =>
        feature.properties?.status ===
        "Ongoing"
    ).length;


  const plannedRoads =
    roadFeatures.filter(
      (feature) =>
        feature.properties?.status ===
        "Planned"
    ).length;


  const maintenanceRoads =
    roadFeatures.filter(
      (feature) =>
        feature.properties?.status ===
        "Under Maintenance"
    ).length;


  // =====================================================
  // PROJECT TYPES
  // =====================================================

  const projectTypes =
    projects.reduce(
      (counts, project) => {
        const type =
          project.type ||
          "Unknown";

        counts[type] =
          (counts[type] || 0) + 1;

        return counts;
      },
      {}
    );


  // =====================================================
  // ROAD CLASSES
  // =====================================================

  const roadClasses =
    roadFeatures.reduce(
      (counts, feature) => {
        const roadClass =
          feature.properties
            ?.roadClass ||
          "Unknown";

        counts[roadClass] =
          (counts[roadClass] || 0) +
          1;

        return counts;
      },
      {}
    );


  // =====================================================
  // COUNTY COUNTS
  // =====================================================

  const countyCounts =
    projects.reduce(
      (counts, project) => {
        const county =
          project.county ||
          "Unknown";

        counts[county] =
          (counts[county] || 0) + 1;

        return counts;
      },
      {}
    );


  // =====================================================
  // PROJECT STATUS CHART DATA
  // =====================================================

  const projectStatusData = [
    {
      name: "Completed",
      value: completedProjects,
    },

    {
      name: "Ongoing",
      value: ongoingProjects,
    },

    {
      name: "Planned",
      value: plannedProjects,
    },
  ];


  // =====================================================
  // ROAD CLASS CHART DATA
  // =====================================================

  const roadClassData =
    Object.entries(
      roadClasses
    ).map(
      ([name, value]) => ({
        name,
        value,
      })
    );


  // =====================================================
  // ROAD LENGTH CHART DATA
  // =====================================================

  const roadLengthData =
    roadFeatures
      .map((feature) => ({
        name:
          feature.properties
            ?.name ||
          "Unnamed Road",

        length:
          Number(
            feature.properties
              ?.lengthKm
          ) || 0,
      }))
      .sort(
        (a, b) =>
          b.length - a.length
      );


  // =====================================================
  // CHART COLOURS
  // =====================================================

  const projectColours = [
    "#4f936d",
    "#d7a33e",
    "#70879a",
  ];


  // =====================================================
  // PERCENTAGE HELPER
  // =====================================================

  const getPercentage = (
    value,
    total
  ) => {
    if (total === 0) {
      return 0;
    }

    return (
      (value / total) *
      100
    );
  };


  return (
    <section className="analytics-dashboard">

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="analytics-summary">

        <div className="analytics-card">

          <span>
            Total Projects
          </span>

          <strong>
            {totalProjects}
          </strong>

          <small>
            PostGIS point features
          </small>

        </div>


        <div className="analytics-card">

          <span>
            Road Corridors
          </span>

          <strong>
            {totalRoads}
          </strong>

          <small>
            PostGIS LINESTRING features
          </small>

        </div>


        <div className="analytics-card">

          <span>
            Network Length
          </span>

          <strong>
            {totalRoadLength.toFixed(
              1
            )}
            {" "}
            km
          </strong>

          <small>
            Combined road length
          </small>

        </div>


        <div className="analytics-card">

          <span>
            Average Corridor
          </span>

          <strong>
            {averageRoadLength.toFixed(
              1
            )}
            {" "}
            km
          </strong>

          <small>
            Mean road length
          </small>

        </div>

      </div>


      {/* =================================================
          VISUAL CHARTS
      ================================================= */}

      <div className="analytics-grid">


        {/* ===============================================
            PROJECT STATUS DONUT
        =============================================== */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h3>
                Project Status
              </h3>

              <p>
                Distribution of
                infrastructure projects
              </p>

            </div>

            <span>
              {totalProjects}
            </span>

          </div>


          {totalProjects > 0 ? (

            <div
              style={{
                width: "100%",
                height: "270px",
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={
                      projectStatusData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >

                    {projectStatusData.map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell
                          key={
                            entry.name
                          }
                          fill={
                            projectColours[
                              index %
                              projectColours.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>


                  <Tooltip />


                  <Legend
                    verticalAlign="bottom"
                    height={30}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <p className="analytics-empty">
              No project data
              available.
            </p>

          )}

        </div>


        {/* ===============================================
            ROAD CLASS BAR CHART
        =============================================== */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h3>
                Road Classes
              </h3>

              <p>
                Road network by
                classification
              </p>

            </div>

            <span>
              {totalRoads}
            </span>

          </div>


          {roadClassData.length > 0 ? (

            <div
              style={{
                width: "100%",
                height: "270px",
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    roadClassData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 10,
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
                  />


                  <YAxis
                    allowDecimals={
                      false
                    }
                    tick={{
                      fontSize: 10,
                    }}
                  />


                  <Tooltip />


                  <Bar
                    dataKey="value"
                    name="Roads"
                    fill="#496f80"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <p className="analytics-empty">
              No road class data
              available.
            </p>

          )}

        </div>


        {/* ===============================================
            ROAD LENGTH COMPARISON
        =============================================== */}

        <div
          className="analytics-panel"
          style={{
            gridColumn:
              "1 / -1",
          }}
        >

          <div className="analytics-panel-header">

            <div>

              <h3>
                Road Corridor Length
              </h3>

              <p>
                Comparison using
                PostGIS-calculated
                corridor lengths
              </p>

            </div>

            <span>
              km
            </span>

          </div>


          {roadLengthData.length > 0 ? (

            <div
              style={{
                width: "100%",
                height: "320px",
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    roadLengthData
                  }
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 70,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={
                      false
                    }
                  />


                  <XAxis
                    type="number"
                    tick={{
                      fontSize: 10,
                    }}
                    unit=" km"
                  />


                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{
                      fontSize: 10,
                    }}
                  />


                  <Tooltip
                    formatter={
                      (value) => [
                        `${Number(
                          value
                        ).toFixed(
                          2
                        )} km`,
                        "Length",
                      ]
                    }
                  />


                  <Bar
                    dataKey="length"
                    name="Length"
                    fill="#4f7f6b"
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

          ) : (

            <p className="analytics-empty">
              No road length data
              available.
            </p>

          )}

        </div>


        {/* ===============================================
            ROAD STATUS
        =============================================== */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h3>
                Road Status
              </h3>

              <p>
                Current road network
                status
              </p>

            </div>

            <span>
              {totalRoads}
            </span>

          </div>


          <div className="analytics-bars">

            {[
              [
                "Operational",
                operationalRoads,
              ],

              [
                "Ongoing",
                ongoingRoads,
              ],

              [
                "Planned",
                plannedRoads,
              ],

              [
                "Under Maintenance",
                maintenanceRoads,
              ],
            ].map(
              ([label, value]) => (

                <div
                  className="analytics-bar-row"
                  key={label}
                >

                  <div className="analytics-bar-label">

                    <span>
                      {label}
                    </span>

                    <strong>
                      {value}
                    </strong>

                  </div>


                  <div className="analytics-bar-track">

                    <div
                      className="analytics-bar-fill road"
                      style={{
                        width:
                          `${getPercentage(
                            value,
                            totalRoads
                          )}%`,
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        </div>


        {/* ===============================================
            INFRASTRUCTURE TYPES
        =============================================== */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h3>
                Infrastructure Types
              </h3>

              <p>
                Project distribution
                by type
              </p>

            </div>

          </div>


          <div className="analytics-list">

            {Object.entries(
              projectTypes
            ).length === 0 ? (

              <p className="analytics-empty">
                No project data
                available.
              </p>

            ) : (

              Object.entries(
                projectTypes
              ).map(
                ([type, count]) => (

                  <div
                    className="analytics-list-item"
                    key={type}
                  >

                    <span>
                      {type}
                    </span>

                    <strong>
                      {count}
                    </strong>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* ===============================================
            COUNTY DISTRIBUTION
        =============================================== */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h3>
                County Distribution
              </h3>

              <p>
                Project records grouped
                by county
              </p>

            </div>

          </div>


          <div className="analytics-list">

            {Object.entries(
              countyCounts
            ).length === 0 ? (

              <p className="analytics-empty">
                No county data
                available.
              </p>

            ) : (

              Object.entries(
                countyCounts
              )
                .sort(
                  (a, b) =>
                    b[1] - a[1]
                )
                .map(
                  ([
                    county,
                    count,
                  ]) => (

                    <div
                      className="analytics-list-item"
                      key={county}
                    >

                      <span>
                        {county}
                      </span>

                      <strong>
                        {count}
                      </strong>

                    </div>

                  )
                )

            )}

          </div>

        </div>


        {/* ===============================================
            NETWORK INSIGHT
        =============================================== */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h3>
                Network Insight
              </h3>

              <p>
                Calculated spatial
                network statistics
              </p>

            </div>

          </div>


          <div className="analytics-insights">

            <div>

              <span>
                Longest Corridor
              </span>

              <strong>

                {longestRoad
                  ? longestRoad
                      .properties
                      .name
                  : "No road data"}

              </strong>

            </div>


            <div>

              <span>
                Corridor Length
              </span>

              <strong>

                {longestRoad
                  ? `${Number(
                      longestRoad
                        .properties
                        .lengthKm ||
                      0
                    ).toFixed(
                      2
                    )} km`
                  : "0 km"}

              </strong>

            </div>


            <div>

              <span>
                Spatial Reference
              </span>

              <strong>
                EPSG:4326
              </strong>

            </div>


            <div>

              <span>
                Geometry Types
              </span>

              <strong>
                POINT + LINESTRING
              </strong>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


export default AnalyticsDashboard;