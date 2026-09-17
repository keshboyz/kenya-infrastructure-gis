const BASE_URL =
  "http://127.0.0.1:8000/api";

const PROJECTS_URL =
  `${BASE_URL}/projects`;

const ROADS_URL =
  `${BASE_URL}/roads`;

const COUNTIES_URL =
  `${BASE_URL}/counties`;


// =========================================================
// PROJECTS
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
// ROADS
// =========================================================

export async function getRoads() {
  const response = await fetch(
    ROADS_URL
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load roads."
    );
  }

  return response.json();
}


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
// COUNTIES
// =========================================================

export async function getCounties() {
  const response = await fetch(
    COUNTIES_URL
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load counties."
    );
  }

  return response.json();
}


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
// COUNTY SPATIAL ANALYSIS
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


  if (!response.ok) {
    let message =
      "Unable to compare counties.";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message =
          errorData.detail;
      }

    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }


  return response.json();
}