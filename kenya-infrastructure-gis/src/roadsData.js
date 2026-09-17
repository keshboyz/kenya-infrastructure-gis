const roadsData = {
  type: "FeatureCollection",

  features: [
    {
      type: "Feature",

      properties: {
        id: 1,
        name: "Nairobi - Nakuru Corridor",
        roadClass: "Highway",
        status: "Operational",
        description:
          "Demonstration road corridor connecting Nairobi and Nakuru.",
      },

      geometry: {
        type: "LineString",

        coordinates: [
          [36.8172, -1.2864],
          [36.6500, -1.1000],
          [36.4300, -0.8500],
          [36.2500, -0.6000],
          [36.0800, -0.3031],
        ],
      },
    },

    {
      type: "Feature",

      properties: {
        id: 2,
        name: "Nairobi - Mombasa Corridor",
        roadClass: "Highway",
        status: "Operational",
        description:
          "Demonstration transport corridor between Nairobi and Mombasa.",
      },

      geometry: {
        type: "LineString",

        coordinates: [
          [36.8172, -1.2864],
          [37.1000, -1.5500],
          [37.5000, -1.9500],
          [38.0000, -2.3500],
          [38.5000, -2.8000],
          [39.0000, -3.3000],
          [39.6682, -4.0435],
        ],
      },
    },

    {
      type: "Feature",

      properties: {
        id: 3,
        name: "Nakuru - Kisumu Corridor",
        roadClass: "Road",
        status: "Operational",
        description:
          "Demonstration road corridor connecting Nakuru and Kisumu.",
      },

      geometry: {
        type: "LineString",

        coordinates: [
          [36.0800, -0.3031],
          [35.8000, -0.2500],
          [35.5000, -0.1800],
          [35.2000, -0.1200],
          [34.7680, -0.0917],
        ],
      },
    },
  ],
};

export default roadsData;