import { getStore } from "@netlify/blobs";

const STORE_NAME = "process-db";
const INDEX_KEY = "index.json";
const MAX_PAYLOAD_SIZE = 1024 * 100; // 100KB max

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

// Response helper
const respond = (statusCode, body, cacheControl = "no-store") => ({
  statusCode,
  headers: {
    ...corsHeaders,
    "Content-Type": "application/json",
    "Cache-Control": cacheControl,
  },
  body: JSON.stringify(body),
});

// Check admin key for write operations
const checkAdminKey = (headers) => {
  const adminKey = process.env.PROCESS_ADMIN_KEY;
  
  // If no admin key is set, allow writes (dev mode)
  if (!adminKey) {
    return true;
  }
  
  // Check the provided key
  const providedKey = headers["x-admin-key"] || headers["X-Admin-Key"];
  return providedKey === adminKey;
};

// Get or create index
const getIndex = async (store) => {
  try {
    const indexData = await store.get(INDEX_KEY, { type: "json" });
    return indexData || { items: [] };
  } catch {
    return { items: [] };
  }
};

// Save index
const saveIndex = async (store, index) => {
  await store.setJSON(INDEX_KEY, index);
};

// Generate ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default async (req, context) => {
  const method = req.method;
  const url = req.url;
  
  // Parse URL safely
  let id = null;
  try {
    const urlObj = new URL(url);
    id = urlObj.searchParams.get("id");
  } catch {
    // Fallback: parse query string manually
    const queryIndex = url.indexOf("?");
    if (queryIndex !== -1) {
      const queryString = url.substring(queryIndex + 1);
      const params = new URLSearchParams(queryString);
      id = params.get("id");
    }
  }

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });

    // GET - List all items or get one item
    if (method === "GET") {
      if (id) {
        // Get single item
        const itemKey = `items/${id}.json`;
        const item = await store.get(itemKey, { type: "json" });
        
        if (!item) {
          return respond(404, { error: "Item not found" });
        }
        
        return respond(200, item, "public, max-age=10");
      } else {
        // List all items
        const index = await getIndex(store);
        const items = [];
        
        for (const indexItem of index.items) {
          try {
            const itemKey = `items/${indexItem.id}.json`;
            const item = await store.get(itemKey, { type: "json" });
            if (item) {
              items.push(item);
            }
          } catch {
            // Skip items that fail to load
          }
        }
        
        return respond(200, { items }, "public, max-age=5");
      }
    }

    // POST - Create or update item
    if (method === "POST") {
      // Check admin key
      const headers = Object.fromEntries(req.headers.entries());
      if (!checkAdminKey(headers)) {
        return respond(403, { error: "Unauthorized: Invalid admin key" });
      }

      // Parse body
      const bodyText = await req.text();
      
      if (bodyText.length > MAX_PAYLOAD_SIZE) {
        return respond(413, { error: "Payload too large" });
      }

      let data;
      try {
        data = JSON.parse(bodyText);
      } catch {
        return respond(400, { error: "Invalid JSON" });
      }

      // Validate required fields
      if (!data.title || typeof data.title !== "string") {
        return respond(400, { error: "Missing or invalid title" });
      }

      const now = new Date().toISOString();
      const isNew = !data.id;
      const itemId = data.id || generateId();

      const item = {
        id: itemId,
        title: data.title,
        description: data.description || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        status: data.status || "draft",
        modules: data.modules || null, // Store full modules data for Process page
        createdAt: isNew ? now : (data.createdAt || now),
        updatedAt: now,
      };

      // Save item
      const itemKey = `items/${itemId}.json`;
      await store.setJSON(itemKey, item);

      // Update index
      const index = await getIndex(store);
      const existingIndex = index.items.findIndex((i) => i.id === itemId);
      
      const indexEntry = {
        id: itemId,
        title: item.title,
        updatedAt: item.updatedAt,
      };

      if (existingIndex >= 0) {
        index.items[existingIndex] = indexEntry;
      } else {
        index.items.push(indexEntry);
      }

      await saveIndex(store, index);

      return respond(isNew ? 201 : 200, item);
    }

    // DELETE - Remove item
    if (method === "DELETE") {
      // Check admin key
      const headers = Object.fromEntries(req.headers.entries());
      if (!checkAdminKey(headers)) {
        return respond(403, { error: "Unauthorized: Invalid admin key" });
      }

      if (!id) {
        return respond(400, { error: "Missing id parameter" });
      }

      // Delete item
      const itemKey = `items/${id}.json`;
      await store.delete(itemKey);

      // Update index
      const index = await getIndex(store);
      index.items = index.items.filter((i) => i.id !== id);
      await saveIndex(store, index);

      return respond(200, { success: true, id });
    }

    return respond(405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Process DB Error:", error);
    return respond(500, { error: "Internal server error", message: error.message });
  }
};

export const config = {
  path: "/api/process-db",
};
