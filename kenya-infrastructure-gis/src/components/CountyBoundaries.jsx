import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  GeoJSON,
  useMap,
} from "react-leaflet";

import {
  getCounties,
  getCountyAnalysis,
} from "../api";


const emptyCountyCollection = {
  type: "FeatureCollection",
  features: [],
};


// =========================================================
// COUNTY BOUNDARIES COMPONENT
// =========================================================

function CountyBoundaries({
  onCountyAnalysis,
}) {
  const map = useMap();


  const [
    counties,
    setCounties,
  ] = useState(
    emptyCountyCollection
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const selectedLayerRef =
    useRef(null);


  // =====================================================
  // LOAD COUNTIES
  // =====================================================

  useEffect(() => {
    const loadCounties =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getCounties();

          if (
            !data ||
            data.type !==
              "FeatureCollection" ||
            !Array.isArray(
              data.features
            )
          ) {
            throw new Error(
              "Invalid county GeoJSON."
            );
          }

          setCounties(data);

        } catch (loadError) {
          console.error(
            "County loading error:",
            loadError
          );

          setError(
            "Unable to load county boundaries."
          );

        } finally {
          setLoading(false);
        }
      };


    loadCounties();

  }, []);


  // =====================================================
  // DEFAULT COUNTY STYLE
  // =====================================================

  const countyStyle = () => ({
    color: "#526a72",
    weight: 1.2,
    opacity: 0.9,
    fillColor: "#8fae9d",
    fillOpacity: 0.12,
  });


  // =====================================================
  // SELECTED COUNTY STYLE
  // =====================================================

  const selectedCountyStyle = {
    color: "#173f4f",
    weight: 4,
    opacity: 1,
    fillColor: "#6f9d83",
    fillOpacity: 0.34,
  };


  // =====================================================
  // COUNTY INTERACTION
  // =====================================================

  const countyInteraction =
    (feature, layer) => {
      const properties =
        feature.properties || {};

      const countyId =
        properties.id;

      const countyName =
        properties.county ||
        "Unknown County";


      // -------------------------------------------------
      // COUNTY HOVER TOOLTIP
      // -------------------------------------------------

      layer.bindTooltip(
        `${countyName} County`,
        {
          sticky: true,
          direction: "top",
        }
      );


      // -------------------------------------------------
      // HOVER STYLE
      // -------------------------------------------------

      layer.on(
        "mouseover",
        (event) => {
          const target =
            event.target;

          if (
            selectedLayerRef.current ===
            target
          ) {
            return;
          }

          target.setStyle({
            weight: 3,
            color: "#263f49",
            fillColor: "#7fa38f",
            fillOpacity: 0.28,
          });

          target.bringToFront();
        }
      );


      // -------------------------------------------------
      // RESTORE STYLE AFTER HOVER
      // -------------------------------------------------

      layer.on(
        "mouseout",
        (event) => {
          const target =
            event.target;

          if (
            selectedLayerRef.current ===
            target
          ) {
            target.setStyle(
              selectedCountyStyle
            );

            return;
          }

          target.setStyle(
            countyStyle()
          );
        }
      );


      // -------------------------------------------------
      // SELECT COUNTY
      // -------------------------------------------------

      layer.on(
        "click",
        async (event) => {
          const target =
            event.target;


          // ---------------------------------------------
          // RESET PREVIOUS COUNTY
          // ---------------------------------------------

          if (
            selectedLayerRef.current &&
            selectedLayerRef.current !==
              target
          ) {
            selectedLayerRef.current
              .setStyle(
                countyStyle()
              );
          }


          // ---------------------------------------------
          // STORE CURRENT COUNTY
          // ---------------------------------------------

          selectedLayerRef.current =
            target;


          // ---------------------------------------------
          // HIGHLIGHT CURRENT COUNTY
          // ---------------------------------------------

          target.setStyle(
            selectedCountyStyle
          );

          target.bringToFront();


          // ---------------------------------------------
          // ZOOM TO COUNTY
          // ---------------------------------------------

          const bounds =
            target.getBounds();

          if (
            bounds &&
            bounds.isValid()
          ) {
            map.fitBounds(
              bounds,
              {
                padding: [
                  50,
                  50,
                ],
                maxZoom: 10,
                animate: true,
                duration: 0.7,
              }
            );
          }


          // ---------------------------------------------
          // VALIDATE COUNTY
          // ---------------------------------------------

          if (!countyId) {
            console.error(
              `No county ID available for ${countyName}.`
            );

            return;
          }


          // ---------------------------------------------
          // POSTGIS COUNTY ANALYSIS
          // ---------------------------------------------

          try {
            const analysis =
              await getCountyAnalysis(
                countyId
              );


            if (
              typeof onCountyAnalysis ===
              "function"
            ) {
              onCountyAnalysis(
                analysis
              );
            }

          } catch (
            analysisError
          ) {
            console.error(
              `Unable to analyse ${countyName}:`,
              analysisError
            );
          }
        }
      );
    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return null;
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    console.error(error);

    return null;
  }


  // =====================================================
  // EMPTY COLLECTION
  // =====================================================

  if (
    counties.features.length === 0
  ) {
    return null;
  }


  // =====================================================
  // RENDER COUNTIES
  // =====================================================

  return (
    <GeoJSON
      key={
        `counties-${counties.features.length}`
      }

      data={counties}

      style={countyStyle}

      onEachFeature={
        countyInteraction
      }
    />
  );
}


export default CountyBoundaries;