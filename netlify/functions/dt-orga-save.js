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

    // GET - Load dt-orga associations
    if (req.method === "GET") {
      const rows = await sql`
        SELECT service_id, sub_module_ids, updated_at 
        FROM dt_orga_associations
      `;
      
      const customAssociations = rows.map(row => ({
        serviceId: row.service_id,
        subModuleIds: row.sub_module_ids
      }));

      const lastUpdate = rows.length > 0 
        ? rows.reduce((latest, row) => 
            new Date(row.updated_at) > new Date(latest) ? row.updated_at : latest, 
            rows[0].updated_at
          )
        : null;

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { customAssociations },
          savedAt: lastUpdate
        }),
        { status: 200, headers }
      );
    }

    // POST - Save dt-orga associations
    if (req.method === "POST") {
      const body = await req.json();
      const customAssociations = body.customAssociations || [];
      const now = new Date().toISOString();

      // Upsert each association
      for (const assoc of customAssociations) {
        await sql`
          INSERT INTO dt_orga_associations (service_id, sub_module_ids, updated_at)
          VALUES (${assoc.serviceId}, ${JSON.stringify(assoc.subModuleIds)}, ${now})
          ON CONFLICT (service_id) 
          DO UPDATE SET 
            sub_module_ids = ${JSON.stringify(assoc.subModuleIds)},
            updated_at = ${now}
        `;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "DT Orga associations saved successfully",
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
  path: "/api/dt-orga-save"
};
