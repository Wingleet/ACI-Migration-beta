import { neon } from '@netlify/neon';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const sql = neon();

    // GET - Load flowchart file(s)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const filePath = url.searchParams.get('path');
      
      if (filePath) {
        // Get single file
        const rows = await sql`
          SELECT file_path, file_name, content, updated_at 
          FROM flowchart_files 
          WHERE file_path = ${filePath}
          LIMIT 1
        `;
        
        if (rows.length === 0) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "File not found in database" 
            }),
            { status: 404, headers }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              path: rows[0].file_path,
              name: rows[0].file_name,
              content: rows[0].content
            },
            savedAt: rows[0].updated_at 
          }),
          { status: 200, headers }
        );
      } else {
        // List all files
        const rows = await sql`
          SELECT file_path, file_name, updated_at 
          FROM flowchart_files
          ORDER BY file_path
        `;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: rows.map(r => ({
              path: r.file_path,
              name: r.file_name,
              updatedAt: r.updated_at
            }))
          }),
          { status: 200, headers }
        );
      }
    }

    // POST - Save flowchart file
    if (req.method === "POST") {
      const body = await req.json();
      const { path: filePath, name: fileName, content } = body;
      const now = new Date().toISOString();

      if (!filePath || !content) {
        return new Response(
          JSON.stringify({ success: false, error: "path and content are required" }),
          { status: 400, headers }
        );
      }

      await sql`
        INSERT INTO flowchart_files (file_path, file_name, content, updated_at)
        VALUES (${filePath}, ${fileName || filePath.split('/').pop()}, ${content}, ${now})
        ON CONFLICT (file_path) 
        DO UPDATE SET 
          content = ${content},
          updated_at = ${now}
      `;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Flowchart saved successfully",
          path: filePath,
          savedAt: now 
        }),
        { status: 200, headers }
      );
    }

    // DELETE - Remove flowchart file
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const filePath = url.searchParams.get('path');
      
      if (!filePath) {
        return new Response(
          JSON.stringify({ success: false, error: "path is required" }),
          { status: 400, headers }
        );
      }

      await sql`DELETE FROM flowchart_files WHERE file_path = ${filePath}`;

      return new Response(
        JSON.stringify({ success: true, message: "File deleted" }),
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
  path: "/api/flowchart-save"
};
