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

    // GET - Load all team members
    if (req.method === "GET") {
      const rows = await sql`
        SELECT member_id, first_name, last_name, role, service, company, updated_at 
        FROM team_members
        ORDER BY last_name, first_name
      `;
      
      const members = rows.map(row => ({
        id: row.member_id,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        service: row.service,
        company: row.company
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
          data: { members },
          savedAt: lastUpdate
        }),
        { status: 200, headers }
      );
    }

    // POST - Save all team members (bulk upsert)
    if (req.method === "POST") {
      const body = await req.json();
      const members = body.members || [];
      const now = new Date().toISOString();

      // Clear and re-insert all members
      await sql`DELETE FROM team_members`;
      
      for (const member of members) {
        await sql`
          INSERT INTO team_members (member_id, first_name, last_name, role, service, company, updated_at)
          VALUES (${member.id}, ${member.firstName}, ${member.lastName}, ${member.role || ''}, ${member.service || ''}, ${member.company || null}, ${now})
        `;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Team members saved successfully",
          count: members.length,
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
  path: "/api/services-save"
};
