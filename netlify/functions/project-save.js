import { getStore } from "@netlify/blobs";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

export default async (req, context) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // Get Netlify Blobs store
    const store = getStore("project-data");

    // GET - Load project data
    if (req.method === "GET") {
      const data = await store.get("main-project", { type: "json" });
      
      if (!data) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: null,
            message: "No saved data found" 
          }),
          { status: 200, headers }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data,
          savedAt: data.savedAt 
        }),
        { status: 200, headers }
      );
    }

    // POST - Save project data
    if (req.method === "POST") {
      const body = await req.json();
      
      const dataToSave = {
        ...body,
        savedAt: new Date().toISOString(),
      };

      await store.setJSON("main-project", dataToSave);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Project saved successfully",
          savedAt: dataToSave.savedAt 
        }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/api/project-save"
};
