const BASE_URL =
  "http://127.0.0.1:8000/api";


const PROJECTS_URL =
  `${BASE_URL}/projects`;


const ROADS_URL =
  `${BASE_URL}/roads`;


const COUNTIES_URL =
  `${BASE_URL}/counties`;


// =========================================================
// PROJECTS — GET ALL
// =========================================================

export async function getProjects() {
  const response = await fetch(
    PROJECTS_URL
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load projects."
    );
  }

  return response.json();
}


// =========================================================
// PROJECTS — CREATE
// =========================================================

export async function createProject(
  project
) {
  const response = await fetch(
    PROJECTS_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        project
      ),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to create project."
    );
  }

  return response.json();
}


// =========================================================
// PROJECTS — UPDATE
// =========================================================

export async function updateProject(
  projectId,
  project
) {
  const response = await fetch(
    `${PROJECTS_URL}/${projectId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        project
      ),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to update project."
    );
  }

  return response.json();
}


// =========================================================
// PROJECTS — DELETE
// =========================================================

export async function deleteProject(
  projectId
) {
  const response = await fetch(
    `${PROJECTS_URL}/${projectId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to delete project."
    );
  }

  return response.json();
}


// =========================================================
// ROADS — GET ALL AS GEOJSON
// =========================================================

export async function getRoads() {
  const response = await fetch(
    ROADS_URL
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load road network."
    );
  }

  return response.json();
}


// =========================================================
// ROADS — CREATE
// =========================================================

export async function createRoad(
  road
) {
  const response = await fetch(
    ROADS_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        road
      ),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to create road."
    );
  }

  return response.json();
}


// =========================================================
// ROADS — DELETE
// =========================================================

export async function deleteRoad(
  roadId
) {
  const response = await fetch(
    `${ROADS_URL}/${roadId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to delete road."
    );
  }

  return response.json();
}


// =========================================================
// COUNTIES — GET ALL AS GEOJSON
// =========================================================

export async function getCounties() {
  const response = await fetch(
    COUNTIES_URL
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load county boundaries."
    );
  }

  return response.json();
}


// =========================================================
// COUNTIES — GET ONE AS GEOJSON
// =========================================================

export async function getCounty(
  countyId
) {
  const response = await fetch(
    `${COUNTIES_URL}/${countyId}`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load county."
    );
  }

  return response.json();
}


// =========================================================
// COUNTY — POSTGIS SPATIAL ANALYSIS
// =========================================================

export async function getCountyAnalysis(
  countyId
) {
  const response = await fetch(
    `${COUNTIES_URL}/${countyId}/analysis`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to analyse county infrastructure."
    );
  }

  return response.json();
}