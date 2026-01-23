// Simple in-memory storage for Process module
const store = { items: {} };

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Parse ID from query
  const id = event.queryStringParameters?.id || null;

  try {
    // GET
    if (event.httpMethod === "GET") {
      if (id) {
        const item = store.items[id];
        if (!item) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: "Not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(item) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ items: Object.values(store.items) }) };
    }

    // POST
    if (event.httpMethod === "POST") {
      let data;
      try {
        data = JSON.parse(event.body || "{}");
      } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
      }

      if (!data.title) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Title required" }) };
      }

      const itemId = data.id || generateId();
      const now = new Date().toISOString();
      const isNew = !store.items[itemId];

      store.items[itemId] = {
        id: itemId,
        title: data.title,
        description: data.description || "",
        modules: data.modules || null,
        createdAt: isNew ? now : (store.items[itemId]?.createdAt || now),
        updatedAt: now,
      };

      return { statusCode: isNew ? 201 : 200, headers, body: JSON.stringify(store.items[itemId]) };
    }

    // DELETE
    if (event.httpMethod === "DELETE") {
      if (id) delete store.items[id];
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (error) {
    console.error("Function error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
