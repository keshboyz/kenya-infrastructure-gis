import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  compareCounties,
  getCounties,
} from "../api";

import "./CountyComparison.css";


function CountyComparison({
  onClose,
}) {
  const [
    counties,
    setCounties,
  ] = useState([]);


  const [
    county1,
    setCounty1,
  ] = useState("");


  const [
    county2,
    setCounty2,
  ] = useState("");


  const [
    comparison,
    setComparison,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // =====================================================
  // LOAD COUNTY LIST
  // =====================================================

  useEffect(() => {
    const loadCounties =
      async () => {
        try {
          setError("");

          const data =
            await getCounties();

          const features =
            Array.isArray(
              data?.features
            )
              ? data.features
              : [];


          const countyOptions =
            features
              .map((feature) => ({
                id:
                  feature.properties
                    ?.id,

                name:
                  feature.properties
                    ?.county ||
                  "Unknown County",
              }))
              .filter(
                (county) =>
                  county.id
              )
              .sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name
                  )
              );


          setCounties(
            countyOptions
          );

        } catch (
          loadError
        ) {
          console.error(
            "Unable to load counties:",
            loadError
          );

          setError(
            "Unable to load the county list."
          );
        }
      };


    loadCounties();

  }, []);


  // =====================================================
  // COMPARE
  // =====================================================

  const handleCompare =
    async () => {
      if (
        !county1 ||
        !county2
      ) {
        setError(
          "Select two counties before comparing."
        );

        return;
      }


      if (
        Number(county1) ===
        Number(county2)
      ) {
        setError(
          "Select two different counties."
        );

        return;
      }


      try {
        setLoading(true);
        setError("");
        setComparison(null);


        const result =
          await compareCounties(
            county1,
            county2
          );


        setComparison(result);

      } catch (
        compareError
      ) {
        console.error(
          "County comparison error:",
          compareError
        );

        setError(
          compareError.message ||
          "Unable to compare counties."
        );

      } finally {
        setLoading(false);
      }
    };


  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setCounty1("");
    setCounty2("");
    setComparison(null);
    setError("");
  };


  // =====================================================
  // RESULT DATA
  // =====================================================

  const firstAnalysis =
    comparison?.counties?.[0]
    || null;


  const secondAnalysis =
    comparison?.counties?.[1]
    || null;


  // =====================================================
  // CHART DATA
  // =====================================================

  const infrastructureChartData =
    useMemo(() => {
      if (
        !firstAnalysis ||
        !secondAnalysis
      ) {
        return [];
      }


      const firstName =
        firstAnalysis.county
          ?.name ||
        "County 1";


      const secondName =
        secondAnalysis.county
          ?.name ||
        "County 2";


      return [
        {
          metric:
            "Projects",

          [firstName]:
            Number(
              firstAnalysis
                .infrastructure
                ?.projectCount
            ) || 0,

          [secondName]:
            Number(
              secondAnalysis
                .infrastructure
                ?.projectCount
            ) || 0,
        },

        {
          metric:
            "Roads",

          [firstName]:
            Number(
              firstAnalysis
                .infrastructure
                ?.roadCount
            ) || 0,

          [secondName]:
            Number(
              secondAnalysis
                .infrastructure
                ?.roadCount
            ) || 0,
        },
      ];

    }, [
      firstAnalysis,
      secondAnalysis,
    ]);


  const roadLengthChartData =
    useMemo(() => {
      if (
        !firstAnalysis ||
        !secondAnalysis
      ) {
        return [];
      }


      return [
        {
          county:
            firstAnalysis.county
              ?.name ||
            "County 1",

          length:
            Number(
              firstAnalysis
                .infrastructure
                ?.roadLengthInsideCountyKm
            ) || 0,
        },

        {
          county:
            secondAnalysis.county
              ?.name ||
            "County 2",

          length:
            Number(
              secondAnalysis
                .infrastructure
                ?.roadLengthInsideCountyKm
            ) || 0,
        },
      ];

    }, [
      firstAnalysis,
      secondAnalysis,
    ]);


  // =====================================================
  // FORMATTING
  // =====================================================

  const formatNumber = (
    value
  ) => {
    const number =
      Number(value);

    if (
      Number.isNaN(number)
    ) {
      return "0";
    }

    return number.toLocaleString();
  };


  const formatLength = (
    value
  ) => {
    const number =
      Number(value);

    if (
      Number.isNaN(number)
    ) {
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
  // COUNTY RESULT CARD
  // =====================================================

  const renderCountyCard = (
    analysis
  ) => {
    if (!analysis) {
      return null;
    }


    const county =
      analysis.county || {};


    const infrastructure =
      analysis.infrastructure || {};


    return (
      <article className="comparison-county-card">

        <div className="comparison-county-heading">

          <span>
            COUNTY
          </span>


          <h3>
            {county.name}
          </h3>


          <p>
            {county.province
              ? `${county.province} Province`
              : "Kenya"}
          </p>

        </div>


        <div className="comparison-stat-grid">

          <div className="comparison-stat">

            <span>
              Population
            </span>

            <strong>
              {formatNumber(
                county.population
              )}
            </strong>

          </div>


          <div className="comparison-stat">

            <span>
              Projects
            </span>

            <strong>
              {formatNumber(
                infrastructure
                  .projectCount
              )}
            </strong>

          </div>


          <div className="comparison-stat">

            <span>
              Road Corridors
            </span>

            <strong>
              {formatNumber(
                infrastructure
                  .roadCount
              )}
            </strong>

          </div>


          <div className="comparison-stat">

            <span>
              Road Length
            </span>

            <strong>
              {formatLength(
                infrastructure
                  .roadLengthInsideCountyKm
              )}
              {" "}
              km
            </strong>

          </div>

        </div>


        <div className="comparison-population-row">

          <div>
            <span>
              Male
            </span>

            <strong>
              {formatNumber(
                county.male
              )}
            </strong>
          </div>


          <div>
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

      </article>
    );
  };


  return (
    <div className="county-comparison">

      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="comparison-header">

        <div>

          <span className="comparison-label">
            SPATIAL COMPARISON
          </span>


          <h2>
            Compare Counties
          </h2>


          <p>
            Compare infrastructure
            characteristics using
            PostGIS spatial analysis.
          </p>

        </div>


        {onClose && (

          <button
            type="button"
            className="comparison-close"
            onClick={onClose}
            aria-label="Close comparison"
          >
            ×
          </button>

        )}

      </div>


      {/* ===============================================
          COUNTY SELECTORS
      =============================================== */}

      <section className="comparison-controls">

        <div className="comparison-select-group">

          <label htmlFor="county1">
            County A
          </label>


          <select
            id="county1"
            value={county1}
            onChange={(event) => {
              setCounty1(
                event.target.value
              );

              setComparison(null);
              setError("");
            }}
          >

            <option value="">
              Select county
            </option>


            {counties.map(
              (county) => (

                <option
                  key={county.id}
                  value={county.id}
                >
                  {county.name}
                </option>

              )
            )}

          </select>

        </div>


        <div className="comparison-versus">
          VS
        </div>


        <div className="comparison-select-group">

          <label htmlFor="county2">
            County B
          </label>


          <select
            id="county2"
            value={county2}
            onChange={(event) => {
              setCounty2(
                event.target.value
              );

              setComparison(null);
              setError("");
            }}
          >

            <option value="">
              Select county
            </option>


            {counties.map(
              (county) => (

                <option
                  key={county.id}
                  value={county.id}
                >
                  {county.name}
                </option>

              )
            )}

          </select>

        </div>


        <div className="comparison-actions">

          <button
            type="button"
            className="comparison-primary-button"
            onClick={handleCompare}
            disabled={loading}
          >
            {loading
              ? "Analysing..."
              : "Compare Counties"}
          </button>


          <button
            type="button"
            className="comparison-reset-button"
            onClick={handleReset}
          >
            Reset
          </button>

        </div>

      </section>


      {/* ===============================================
          ERROR
      =============================================== */}

      {error && (

        <div className="comparison-error">
          {error}
        </div>

      )}


      {/* ===============================================
          EMPTY STATE
      =============================================== */}

      {!comparison &&
        !loading &&
        !error && (

          <div className="comparison-empty-state">

            <strong>
              Select two counties
            </strong>


            <p>
              Choose County A and
              County B above to compare
              population and mapped
              infrastructure.
            </p>

          </div>

        )}


      {/* ===============================================
          RESULTS
      =============================================== */}

      {comparison &&
        firstAnalysis &&
        secondAnalysis && (

          <div className="comparison-results">

            <div className="comparison-card-grid">

              {renderCountyCard(
                firstAnalysis
              )}


              {renderCountyCard(
                secondAnalysis
              )}

            </div>


            {/* =========================================
                INFRASTRUCTURE CHART
            ========================================= */}

            <section className="comparison-chart-card">

              <div className="comparison-section-heading">

                <span>
                  INFRASTRUCTURE
                </span>


                <h3>
                  Feature Comparison
                </h3>

              </div>


              <div className="comparison-chart">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={
                      infrastructureChartData
                    }
                    margin={{
                      top: 15,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />


                    <XAxis
                      dataKey="metric"
                    />


                    <YAxis
                      allowDecimals={false}
                    />


                    <Tooltip />


                    <Legend />


                    <Bar
                      dataKey={
                        firstAnalysis
                          .county
                          .name
                      }
                      fill="#315f50"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                    />


                    <Bar
                      dataKey={
                        secondAnalysis
                          .county
                          .name
                      }
                      fill="#8aa89a"
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

            </section>


            {/* =========================================
                ROAD LENGTH CHART
            ========================================= */}

            <section className="comparison-chart-card">

              <div className="comparison-section-heading">

                <span>
                  ROAD NETWORK
                </span>


                <h3>
                  Road Length Inside County
                </h3>

              </div>


              <div className="comparison-chart">

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
                      top: 10,
                      right: 30,
                      left: 25,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                    />


                    <XAxis
                      type="number"
                      unit=" km"
                    />


                    <YAxis
                      type="category"
                      dataKey="county"
                      width={90}
                    />


                    <Tooltip
                      formatter={(value) => [
                        `${formatLength(
                          value
                        )} km`,
                        "Road length",
                      ]}
                    />


                    <Bar
                      dataKey="length"
                      fill="#527b6b"
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

            </section>


            {/* =========================================
                POSTGIS INFORMATION
            ========================================= */}

            <div className="comparison-engine">

              <div>

                <span>
                  SPATIAL ENGINE
                </span>


                <strong>
                  PostgreSQL / PostGIS
                </strong>

              </div>


              <p>
                Road values represent
                geometry clipped to each
                county boundary using
                spatial intersection
                operations.
              </p>

            </div>

          </div>

        )}

    </div>
  );
}


export default CountyComparison;