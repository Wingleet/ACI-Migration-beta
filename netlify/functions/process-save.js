import { neon } from '@netlify/neon';

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
    const sql = neon();

    // GET - Load process modules data
    if (req.method === "GET") {
      const rows = await sql`
        SELECT data, updated_at 
        FROM process_modules 
        ORDER BY updated_at DESC 
        LIMIT 1
      `;
      
      if (rows.length === 0) {
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
          data: { modules: rows[0].data },
          savedAt: rows[0].updated_at 
        }),
        { status: 200, headers }
      );
    }

    // POST - Save process modules data
    if (req.method === "POST") {
      const body = await req.json();
      const modules = body.modules || [];
      const now = new Date().toISOString();

      // Supprimer les anciennes données et insérer les nouvelles
      await sql`DELETE FROM process_modules`;
      await sql`
        INSERT INTO process_modules (data, updated_at)
        VALUES (${JSON.stringify(modules)}, ${now})
      `;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Process data saved successfully",
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
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/api/process-save"
};
