import { useEffect } from "react";

import {
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet-draw";

import "leaflet-draw/dist/leaflet.draw.css";


function RoadDrawing({
  onRoadDrawn,
}) {
  // =====================================================
  // ACCESS THE LEAFLET MAP
  // =====================================================

  const map = useMap();


  // =====================================================
  // CREATE LEAFLET DRAW CONTROL
  // =====================================================

  useEffect(() => {
    // ---------------------------------------------------
    // FEATURE GROUP
    //
    // Newly drawn roads are temporarily stored here.
    // ---------------------------------------------------

    const drawnItems =
      new L.FeatureGroup();

    map.addLayer(
      drawnItems
    );


    // ---------------------------------------------------
    // DRAW CONTROL
    //
    // Only polyline drawing is enabled because roads
    // are stored as PostGIS LINESTRING geometries.
    // ---------------------------------------------------

    const drawControl =
      new L.Control.Draw({
        position: "topright",

        draw: {
          polyline: {
            shapeOptions: {
              weight: 5,
            },

            metric: true,

            showLength: true,
          },

          polygon: false,

          rectangle: false,

          circle: false,

          marker: false,

          circlemarker: false,
        },

        edit: {
          featureGroup:
            drawnItems,

          edit: false,

          remove: true,
        },
      });


    map.addControl(
      drawControl
    );


    // ===================================================
    // ROAD CREATED
    // ===================================================

    const handleCreated =
      (event) => {
        const {
          layer,
          layerType,
        } = event;


        // -----------------------------------------------
        // ONLY ACCEPT POLYLINES
        // -----------------------------------------------

        if (
          layerType !==
          "polyline"
        ) {
          return;
        }


        // -----------------------------------------------
        // KEEP DRAWN ROAD VISIBLE
        // -----------------------------------------------

        drawnItems.addLayer(
          layer
        );


        // -----------------------------------------------
        // GET LEAFLET COORDINATES
        //
        // Leaflet gives:
        // latitude, longitude
        // -----------------------------------------------

        const latLngs =
          layer.getLatLngs();


        // -----------------------------------------------
        // CONVERT FOR GEOJSON / POSTGIS
        //
        // GeoJSON and PostGIS expect:
        // longitude, latitude
        // -----------------------------------------------

        const coordinates =
          latLngs.map(
            (point) => [
              point.lng,
              point.lat,
            ]
          );


        // -----------------------------------------------
        // SEND COORDINATES TO APP.JSX
        // -----------------------------------------------

        if (onRoadDrawn) {
          onRoadDrawn(
            coordinates
          );
        }
      };


    // ===================================================
    // DRAWN ROAD DELETED
    // ===================================================

    const handleDeleted =
      () => {
        if (onRoadDrawn) {
          onRoadDrawn([]);
        }
      };


    // ===================================================
    // REGISTER LEAFLET EVENTS
    // ===================================================

    map.on(
      L.Draw.Event.CREATED,
      handleCreated
    );

    map.on(
      L.Draw.Event.DELETED,
      handleDeleted
    );


    // ===================================================
    // CLEAN UP
    //
    // Important for React development mode and page
    // navigation. Prevents duplicate toolbars/events.
    // ===================================================

    return () => {
      map.off(
        L.Draw.Event.CREATED,
        handleCreated
      );

      map.off(
        L.Draw.Event.DELETED,
        handleDeleted
      );

      map.removeControl(
        drawControl
      );

      map.removeLayer(
        drawnItems
      );
    };
  }, [
    map,
    onRoadDrawn,
  ]);


  // =====================================================
  // THIS COMPONENT ONLY CONTROLS LEAFLET
  // =====================================================

  return null;
}


export default RoadDrawing;