/**
 * Process Database Client
 * 
 * Client wrapper for the Netlify Functions process-db API.
 * Uses shared storage (Netlify Blobs) for persistence.
 */

const API_BASE = "/api/process-db";

// Admin key for write operations (only set in development/admin context)
let adminKey: string | null = null;

/**
 * Set the admin key for write operations
 */
export const setAdminKey = (key: string | null) => {
  adminKey = key;
};

/**
 * Get headers for requests
 */
const getHeaders = (isWrite = false): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (isWrite && adminKey) {
    headers["X-Admin-Key"] = adminKey;
  }
  
  return headers;
};

/**
 * Process Item type
 */
export interface ProcessItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: string;
  modules?: any; // Full modules data for Process page
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response types
 */
interface ListResponse {
  items: ProcessItem[];
}

interface ErrorResponse {
  error: string;
  message?: string;
}

/**
 * Fetch all items from the database
 */
export const fetchAllItems = async (): Promise<ProcessItem[]> => {
  const response = await fetch(API_BASE, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || "Failed to fetch items");
  }

  const data: ListResponse = await response.json();
  return data.items;
};

/**
 * Fetch a single item by ID
 */
export const fetchItem = async (id: string): Promise<ProcessItem> => {
  const response = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || "Failed to fetch item");
  }

  return response.json();
};

/**
 * Create or update an item
 */
export const saveItem = async (item: Partial<ProcessItem> & { title: string }): Promise<ProcessItem> => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || "Failed to save item");
  }

  return response.json();
};

/**
 * Delete an item
 */
export const deleteItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || "Failed to delete item");
  }
};

/**
 * Save the current process state (modules) to the database
 * This is a convenience method for the Process page
 */
export const saveProcessState = async (
  id: string | null,
  title: string,
  modules: any
): Promise<ProcessItem> => {
  return saveItem({
    id: id || undefined,
    title,
    description: `Process state saved at ${new Date().toLocaleString()}`,
    tags: ["process", "auto-save"],
    status: "active",
    modules,
  });
};

/**
 * Load a saved process state
 */
export const loadProcessState = async (id: string): Promise<any | null> => {
  try {
    const item = await fetchItem(id);
    return item.modules || null;
  } catch {
    return null;
  }
};
