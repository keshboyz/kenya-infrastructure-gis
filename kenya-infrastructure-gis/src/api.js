// =========================================================
// API CONFIGURATION
// =========================================================
//
// Local development:
// http://127.0.0.1:8000/api
//
// Production:
// Set VITE_API_BASE_URL to the deployed FastAPI API.
//
// Example:
// https://kenya-infrastructure-gis.onrender.com/api
// =========================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";


const PROJECTS_URL =
  `${API_BASE_URL}/projects`;

const ROADS_URL =
  `${API_BASE_URL}/roads`;

const COUNTIES_URL =
  `${API_BASE_URL}/counties`;


// =========================================================
// HELPER
// =========================================================

async function handleResponse(
  response,
  defaultMessage
) {
  if (!response.ok) {
    let message = defaultMessage;

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        if (
          typeof errorData.detail ===
          "string"
        ) {
          message =
            errorData.detail;
        } else {
          message =
            JSON.stringify(
              errorData.detail
            );
        }
      }
    } catch {
      // Keep the default message.
    }

    throw new Error(message);
  }

  return response.json();
}


// =========================================================
// PROJECTS
// =========================================================

export async function getProjects() {
  const response = await fetch(
    PROJECTS_URL
  );

  return handleResponse(
    response,
    "Unable to load projects."
  );
}


export async function createProject(
  projectData
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
        projectData
      ),
    }
  );

  return handleResponse(
    response,
    "Unable to create project."
  );
}


export async function updateProject(
  projectId,
  projectData
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
        projectData
      ),
    }
  );

  return handleResponse(
    response,
    "Unable to update project."
  );
}


export async function deleteProject(
  projectId
) {
  const response = await fetch(
    `${PROJECTS_URL}/${projectId}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(
    response,
    "Unable to delete project."
  );
}


// =========================================================
// ROADS
// =========================================================

export async function getRoads() {
  const response = await fetch(
    ROADS_URL
  );

  return handleResponse(
    response,
    "Unable to load roads."
  );
}


export async function createRoad(
  roadData
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
        roadData
      ),
    }
  );

  return handleResponse(
    response,
    "Unable to create road."
  );
}


export async function deleteRoad(
  roadId
) {
  const response = await fetch(
    `${ROADS_URL}/${roadId}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(
    response,
    "Unable to delete road."
  );
}


// =========================================================
// COUNTIES
// =========================================================

export async function getCounties() {
  const response = await fetch(
    COUNTIES_URL
  );

  return handleResponse(
    response,
    "Unable to load counties."
  );
}


export async function getCounty(
  countyId
) {
  const response = await fetch(
    `${COUNTIES_URL}/${countyId}`
  );

  return handleResponse(
    response,
    "Unable to load county."
  );
}


// =========================================================
// COUNTY SPATIAL ANALYSIS
// =========================================================

export async function getCountyAnalysis(
  countyId
) {
  const response = await fetch(
    `${COUNTIES_URL}/${countyId}/analysis`
  );

  return handleResponse(
    response,
    "Unable to load county analysis."
  );
}


// =========================================================
// COUNTY COMPARISON
// =========================================================

export async function compareCounties(
  county1,
  county2
) {
  if (!county1 || !county2) {
    throw new Error(
      "Two counties are required for comparison."
    );
  }

  if (
    Number(county1) ===
    Number(county2)
  ) {
    throw new Error(
      "Please select two different counties."
    );
  }

  const query =
    new URLSearchParams({
      county1: String(county1),
      county2: String(county2),
    });

  const response = await fetch(
    `${COUNTIES_URL}/compare?${query.toString()}`
  );

  return handleResponse(
    response,
    "Unable to compare counties."
  );
}