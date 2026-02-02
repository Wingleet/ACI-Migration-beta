/**
 * Local development API server
 * Connects directly to Neon DB for local testing
 */

import express from 'express';
import { neon } from '@netlify/neon';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 8888;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));

const sql = neon(process.env.NETLIFY_DATABASE_URL);

// ============================================
// FLOWCHART SAVE API
// ============================================
app.get('/api/flowchart-save', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (filePath) {
      const rows = await sql`
        SELECT file_path, file_name, content, updated_at 
        FROM flowchart_files 
        WHERE file_path = ${filePath}
        LIMIT 1
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "File not found in database" });
      }

      return res.json({ 
        success: true, 
        data: {
          path: rows[0].file_path,
          name: rows[0].file_name,
          content: rows[0].content
        },
        savedAt: rows[0].updated_at 
      });
    } else {
      const rows = await sql`
        SELECT file_path, file_name, updated_at 
        FROM flowchart_files
        ORDER BY file_path
      `;
      
      return res.json({ 
        success: true, 
        data: rows.map(r => ({
          path: r.file_path,
          name: r.file_name,
          updatedAt: r.updated_at
        }))
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/flowchart-save', async (req, res) => {
  try {
    const { path: filePath, name: fileName, content } = req.body;
    const now = new Date().toISOString();

    if (!filePath || !content) {
      return res.status(400).json({ success: false, error: "path and content are required" });
    }

    await sql`
      INSERT INTO flowchart_files (file_path, file_name, content, updated_at)
      VALUES (${filePath}, ${fileName || filePath.split('/').pop()}, ${content}, ${now})
      ON CONFLICT (file_path) 
      DO UPDATE SET 
        content = ${content},
        updated_at = ${now}
    `;

    console.log(`✅ Flowchart saved: ${filePath}`);
    res.json({ 
      success: true, 
      message: "Flowchart saved successfully",
      path: filePath,
      savedAt: now 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PROCESS-DB API
// ============================================
app.get('/api/process-db', async (req, res) => {
  try {
    const { id } = req.query;
    
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
    
    if (id) {
      const result = await sql`SELECT * FROM process_items WHERE id = ${id}`;
      if (result.length === 0) {
        return res.status(404).json({ error: "Not found" });
      }
      const item = result[0];
      return res.json({
        id: item.id,
        title: item.title,
        description: item.description,
        modules: item.modules,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      });
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
    res.json({ items });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/process-db', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data.title) {
      return res.status(400).json({ error: "Title required" });
    }

    const itemId = data.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

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
    
    console.log(`✅ Process saved: ${itemId}`);
    res.status(isNew ? 201 : 200).json({
      id: item.id,
      title: item.title,
      description: item.description,
      modules: item.modules,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DT-ORGA-SAVE API
// ============================================
app.get('/api/dt-orga-save', async (req, res) => {
  try {
    const rows = await sql`SELECT service_id, sub_module_ids FROM dt_orga_associations`;
    const associations = {};
    rows.forEach(row => {
      associations[row.service_id] = row.sub_module_ids || [];
    });
    res.json({ success: true, data: associations });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/dt-orga-save', async (req, res) => {
  try {
    const { associations } = req.body;
    const now = new Date().toISOString();

    for (const [serviceId, subModuleIds] of Object.entries(associations)) {
      await sql`
        INSERT INTO dt_orga_associations (service_id, sub_module_ids, updated_at)
        VALUES (${serviceId}, ${JSON.stringify(subModuleIds)}, ${now})
        ON CONFLICT (service_id) 
        DO UPDATE SET sub_module_ids = ${JSON.stringify(subModuleIds)}, updated_at = ${now}
      `;
    }

    console.log(`✅ DT Orga associations saved`);
    res.json({ success: true, savedAt: now });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PROCESS-SAVE API
// ============================================
app.get('/api/process-save', async (req, res) => {
  try {
    const result = await sql`SELECT data FROM process_modules ORDER BY updated_at DESC LIMIT 1`;
    if (result.length === 0) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: result[0].data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/process-save', async (req, res) => {
  try {
    const { modules } = req.body;
    const now = new Date().toISOString();

    await sql`DELETE FROM process_modules`;
    await sql`INSERT INTO process_modules (data, updated_at) VALUES (${JSON.stringify(modules)}, ${now})`;

    console.log(`✅ Process modules saved`);
    res.json({ success: true, savedAt: now });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GANTT-SAVE API
// ============================================
app.get('/api/gantt-save', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ success: false, error: "projectId required" });
    }
    
    const result = await sql`SELECT data FROM gantt_project WHERE project_id = ${projectId}`;
    if (result.length === 0) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: result[0].data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/gantt-save', async (req, res) => {
  try {
    const { projectId, data } = req.body;
    const now = new Date().toISOString();

    if (!projectId) {
      return res.status(400).json({ success: false, error: "projectId required" });
    }

    await sql`
      INSERT INTO gantt_project (project_id, data, updated_at)
      VALUES (${projectId}, ${JSON.stringify(data)}, ${now})
      ON CONFLICT (project_id) 
      DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = ${now}
    `;

    console.log(`✅ Gantt project saved: ${projectId}`);
    res.json({ success: true, savedAt: now });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SERVICES-SAVE API
// ============================================
app.get('/api/services-save', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM team_members ORDER BY id`;
    const members = result.map(m => ({
      id: m.member_id,
      firstName: m.first_name,
      lastName: m.last_name,
      role: m.role,
      service: m.service,
      company: m.company,
    }));
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ACI-IMAGE API (Images PNG ACI)
// ============================================
app.get('/api/aci-image', async (req, res) => {
  try {
    const { path: filePath, moduleId } = req.query;
    
    if (filePath) {
      // Get single image by path
      const result = await sql`
        SELECT file_path, file_name, module_id, content, mime_type, updated_at 
        FROM aci_images 
        WHERE file_path = ${filePath}
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ success: false, error: "Image not found" });
      }
      
      const img = result[0];
      return res.json({ 
        success: true, 
        data: {
          path: img.file_path,
          name: img.file_name,
          moduleId: img.module_id,
          content: img.content,
          mimeType: img.mime_type,
          updatedAt: img.updated_at
        }
      });
    } else if (moduleId) {
      // Get image by module ID
      const result = await sql`
        SELECT file_path, file_name, module_id, content, mime_type, updated_at 
        FROM aci_images 
        WHERE module_id = ${moduleId}
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ success: false, error: "Image not found for module" });
      }
      
      const img = result[0];
      return res.json({ 
        success: true, 
        data: {
          path: img.file_path,
          name: img.file_name,
          moduleId: img.module_id,
          content: img.content,
          mimeType: img.mime_type,
          updatedAt: img.updated_at
        }
      });
    } else {
      // List all images
      const result = await sql`
        SELECT file_path, file_name, module_id, updated_at 
        FROM aci_images
        ORDER BY module_id
      `;
      
      return res.json({ 
        success: true, 
        data: result.map(r => ({
          path: r.file_path,
          name: r.file_name,
          moduleId: r.module_id,
          updatedAt: r.updated_at
        }))
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/aci-image', async (req, res) => {
  try {
    const { path: filePath, name: fileName, moduleId, content, mimeType } = req.body;
    const now = new Date().toISOString();

    if (!filePath || !content) {
      return res.status(400).json({ success: false, error: "path and content are required" });
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

    console.log(`✅ ACI Image saved: ${filePath}`);
    res.json({ 
      success: true, 
      message: "Image saved successfully",
      path: filePath,
      savedAt: now 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Dev API server running at http://localhost:${PORT}`);
  console.log(`   Connected to Neon DB\n`);
});
