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

// In-memory storage (will reset on function cold start)
// For persistent storage, configure Netlify Blobs in your Netlify dashboard
let memoryStore = {
  index: { items: [] },
  items: {},
};

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

// Generate ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Try to use Netlify Blobs if available
let blobStore = null;
const initBlobStore = async () => {
  if (blobStore !== null) return blobStore;
  
  try {
    const { getStore } = await import("@netlify/blobs");
    blobStore = getStore({ name: "process-db", consistency: "strong" });
    console.log("Netlify Blobs store initialized");
    return blobStore;
  } catch (e) {
    console.log("Netlify Blobs not available, using memory storage:", e.message);
    blobStore = false;
    return false;
  }
};

// Storage operations with fallback
const storage = {
  async getIndex() {
    const store = await initBlobStore();
    if (store) {
      try {
        const data = await store.get("index.json", { type: "json" });
        return data || { items: [] };
      } catch {
        return { items: [] };
      }
    }
    return memoryStore.index;
  },
  
  async saveIndex(index) {
    const store = await initBlobStore();
    if (store) {
      await store.setJSON("index.json", index);
    }
    memoryStore.index = index;
  },
  
  async getItem(id) {
    const store = await initBlobStore();
    if (store) {
      try {
        return await store.get(`items/${id}.json`, { type: "json" });
      } catch {
        return null;
      }
    }
    return memoryStore.items[id] || null;
  },
  
  async saveItem(id, item) {
    const store = await initBlobStore();
    if (store) {
      await store.setJSON(`items/${id}.json`, item);
    }
    memoryStore.items[id] = item;
  },
  
  async deleteItem(id) {
    const store = await initBlobStore();
    if (store) {
      try {
        await store.delete(`items/${id}.json`);
      } catch {
        // Ignore delete errors
      }
    }
    delete memoryStore.items[id];
  }
};

export default async (req) => {
  const method = req.method;
  const url = req.url;
  
  // Parse URL safely
  let id = null;
  try {
    const urlObj = new URL(url);
    id = urlObj.searchParams.get("id");
  } catch {
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
    // GET - List all items or get one item
    if (method === "GET") {
      if (id) {
        const item = await storage.getItem(id);
        if (!item) {
          return respond(404, { error: "Item not found" });
        }
        return respond(200, item, "public, max-age=10");
      } else {
        const index = await storage.getIndex();
        const items = [];
        
        for (const indexItem of index.items) {
          try {
            const item = await storage.getItem(indexItem.id);
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
      const headers = Object.fromEntries(req.headers.entries());
      if (!checkAdminKey(headers)) {
        return respond(403, { error: "Unauthorized: Invalid admin key" });
      }

      const bodyText = await req.text();
      
      if (bodyText.length > 1024 * 500) { // 500KB max
        return respond(413, { error: "Payload too large" });
      }

      let data;
      try {
        data = JSON.parse(bodyText);
      } catch {
        return respond(400, { error: "Invalid JSON" });
      }

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
        modules: data.modules || null,
        createdAt: isNew ? now : (data.createdAt || now),
        updatedAt: now,
      };

      await storage.saveItem(itemId, item);

      const index = await storage.getIndex();
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

      await storage.saveIndex(index);

      return respond(isNew ? 201 : 200, item);
    }

    // DELETE - Remove item
    if (method === "DELETE") {
      const headers = Object.fromEntries(req.headers.entries());
      if (!checkAdminKey(headers)) {
        return respond(403, { error: "Unauthorized: Invalid admin key" });
      }

      if (!id) {
        return respond(400, { error: "Missing id parameter" });
      }

      await storage.deleteItem(id);

      const index = await storage.getIndex();
      index.items = index.items.filter((i) => i.id !== id);
      await storage.saveIndex(index);

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
