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
    const url = new URL(req.url);

    // GET - Load ACI image(s)
    if (req.method === "GET") {
      const filePath = url.searchParams.get('path');
      const moduleId = url.searchParams.get('moduleId');
      
      if (filePath) {
        const result = await sql`
          SELECT file_path, file_name, module_id, content, mime_type, updated_at 
          FROM aci_images 
          WHERE file_path = ${filePath}
        `;
        
        if (result.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: "Image not found" }),
            { status: 404, headers }
          );
        }
        
        const img = result[0];
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              path: img.file_path,
              name: img.file_name,
              moduleId: img.module_id,
              content: img.content,
              mimeType: img.mime_type,
              updatedAt: img.updated_at
            }
          }),
          { status: 200, headers }
        );
      } else if (moduleId) {
        const result = await sql`
          SELECT file_path, file_name, module_id, content, mime_type, updated_at 
          FROM aci_images 
          WHERE module_id = ${moduleId}
        `;
        
        if (result.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: "Image not found for module" }),
            { status: 404, headers }
          );
        }
        
        const img = result[0];
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              path: img.file_path,
              name: img.file_name,
              moduleId: img.module_id,
              content: img.content,
              mimeType: img.mime_type,
              updatedAt: img.updated_at
            }
          }),
          { status: 200, headers }
        );
      } else {
        // List all images (without content for performance)
        const result = await sql`
          SELECT file_path, file_name, module_id, updated_at 
          FROM aci_images
          ORDER BY module_id
        `;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: result.map(r => ({
              path: r.file_path,
              name: r.file_name,
              moduleId: r.module_id,
              updatedAt: r.updated_at
            }))
          }),
          { status: 200, headers }
        );
      }
    }

    // POST - Save ACI image
    if (req.method === "POST") {
      const body = await req.json();
      const { path: filePath, name: fileName, moduleId, content, mimeType } = body;
      const now = new Date().toISOString();

      if (!filePath || !content) {
        return new Response(
          JSON.stringify({ success: false, error: "path and content are required" }),
          { status: 400, headers }
        );
      }

      await sql`
        INSERT INTO aci_images (file_path, file_name, module_id, content, mime_type, updated_at)
        VALUES (${filePath}, ${fileName || filePath.split('/').pop()}, ${moduleId || null}, ${content}, ${mimeType || 'image/png'}, ${now})
        ON CONFLICT (file_path) 
        DO UPDATE SET 
          content = ${content},
          module_id = ${moduleId || null},
          mime_type = ${mimeType || 'image/png'},
          updated_at = ${now}
      `;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Image saved successfully",
          path: filePath,
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
  path: "/api/aci-image"
};
