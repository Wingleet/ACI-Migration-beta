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

    // =============================================
    // TABLE: DT Orga Associations
    // =============================================
    await sql`
      CREATE TABLE IF NOT EXISTS dt_orga_associations (
        id SERIAL PRIMARY KEY,
        service_id VARCHAR(255) NOT NULL UNIQUE,
        sub_module_ids JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // =============================================
    // TABLE: Process Modules (Gap Analysis data)
    // =============================================
    await sql`
      CREATE TABLE IF NOT EXISTS process_modules (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // =============================================
    // TABLE: Project Data
    // =============================================
    await sql`
      CREATE TABLE IF NOT EXISTS project_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // =============================================
    // TABLE: Gantt Project (tasks, lanes, dependencies)
    // =============================================
    await sql`
      CREATE TABLE IF NOT EXISTS gantt_project (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL UNIQUE,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // =============================================
    // TABLE: Services / Team Members
    // =============================================
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        member_id VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        service VARCHAR(255),
        company VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // =============================================
    // TABLE: Flowchart Files (.drawio XML)
    // =============================================
    await sql`
      CREATE TABLE IF NOT EXISTS flowchart_files (
        id SERIAL PRIMARY KEY,
        file_path VARCHAR(500) NOT NULL UNIQUE,
        file_name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // =============================================
    // TABLE: Document Files (.docx, stored as base64)
    // =============================================
    await sql`
      CREATE TABLE IF NOT EXISTS document_files (
        id SERIAL PRIMARY KEY,
        file_path VARCHAR(500) NOT NULL UNIQUE,
        file_name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // =============================================
    // TABLE: Process Items (Gap Analysis saves)
    // =============================================
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

    // =============================================
    // INDEXES
    // =============================================
    await sql`CREATE INDEX IF NOT EXISTS idx_dt_orga_service_id ON dt_orga_associations(service_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gantt_project_id ON gantt_project(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_member_id ON team_members(member_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_flowchart_path ON flowchart_files(file_path)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_document_path ON document_files(file_path)`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "All database tables initialized successfully",
        tables: [
          'dt_orga_associations',
          'process_modules', 
          'project_data',
          'gantt_project',
          'team_members',
          'flowchart_files',
          'document_files',
          'process_items'
        ]
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Database init error:", error);
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
  path: "/api/db-init"
};
