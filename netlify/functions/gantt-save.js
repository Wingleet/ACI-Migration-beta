import { neon } from '@netlify/neon';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const sql = neon();

    // GET - Load gantt project
    if (req.method === "GET") {
      const url = new URL(req.url);
      const projectId = url.searchParams.get('projectId') || 'default';
      
      const rows = await sql`
        SELECT data, updated_at 
        FROM gantt_project 
        WHERE project_id = ${projectId}
        LIMIT 1
      `;
      
      if (rows.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: null,
            message: "No saved project found" 
          }),
          { status: 200, headers }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: rows[0].data,
          savedAt: rows[0].updated_at 
        }),
        { status: 200, headers }
      );
    }

    // POST - Save gantt project
    if (req.method === "POST") {
      const body = await req.json();
      const projectId = body.projectId || 'default';
      const project = body.project;
      const now = new Date().toISOString();

      await sql`
        INSERT INTO gantt_project (project_id, data, updated_at)
        VALUES (${projectId}, ${JSON.stringify(project)}, ${now})
        ON CONFLICT (project_id) 
        DO UPDATE SET 
          data = ${JSON.stringify(project)},
          updated_at = ${now}
      `;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Gantt project saved successfully",
          savedAt: now 
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
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/api/gantt-save"
};
