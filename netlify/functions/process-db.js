import { neon } from '@netlify/neon';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default async (req, context) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Parse ID from query
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  try {
    const sql = neon();

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS process_items (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        modules JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // GET
    if (req.method === "GET") {
      if (id) {
        const result = await sql`SELECT * FROM process_items WHERE id = ${id}`;
        if (result.length === 0) {
          return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });
        }
        const item = result[0];
        return new Response(JSON.stringify({
          id: item.id,
          title: item.title,
          description: item.description,
          modules: item.modules,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }), { status: 200, headers });
      }
      
      const result = await sql`SELECT * FROM process_items ORDER BY updated_at DESC`;
      const items = result.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        modules: item.modules,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      return new Response(JSON.stringify({ items }), { status: 200, headers });
    }

    // POST
    if (req.method === "POST") {
      let data;
      try {
        data = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
      }

      if (!data.title) {
        return new Response(JSON.stringify({ error: "Title required" }), { status: 400, headers });
      }

      const itemId = data.id || generateId();
      const now = new Date().toISOString();

      // Check if exists
      const existing = await sql`SELECT id, created_at FROM process_items WHERE id = ${itemId}`;
      const isNew = existing.length === 0;

      if (isNew) {
        await sql`
          INSERT INTO process_items (id, title, description, modules, created_at, updated_at)
          VALUES (${itemId}, ${data.title}, ${data.description || ''}, ${JSON.stringify(data.modules || null)}, ${now}, ${now})
        `;
      } else {
        await sql`
          UPDATE process_items 
          SET title = ${data.title}, 
              description = ${data.description || ''}, 
              modules = ${JSON.stringify(data.modules || null)}, 
              updated_at = ${now}
          WHERE id = ${itemId}
        `;
      }

      const result = await sql`SELECT * FROM process_items WHERE id = ${itemId}`;
      const item = result[0];
      
      return new Response(JSON.stringify({
        id: item.id,
        title: item.title,
        description: item.description,
        modules: item.modules,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }), { status: isNew ? 201 : 200, headers });
    }

    // DELETE
    if (req.method === "DELETE") {
      if (id) {
        await sql`DELETE FROM process_items WHERE id = ${id}`;
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

export const config = {
  path: "/api/process-db"
};
