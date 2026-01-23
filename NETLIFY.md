# Netlify Deployment Guide

This application uses **Netlify Functions** and **Netlify Blobs** for a simple shared database on the Process page.

## Features

- **Shared Storage**: All users see the same data (read/write via Netlify Blobs)
- **No External Database**: Uses Netlify Blobs as a JSON-based key/value store
- **Simple API**: CRUD operations via `/api/process-db` endpoint

## Local Development

### Option 1: Using Netlify Dev (Recommended for full functionality)

```bash
# Install dependencies
pnpm install

# Run with Netlify CLI (includes functions)
pnpm dev:netlify
```

This starts the app at `http://localhost:8888` with both the frontend and Netlify Functions running.

### Option 2: Frontend Only (No API)

```bash
# Run Vite dev server only
pnpm dev
```

> **Note**: The API calls will fail unless you also run `netlify dev` in parallel or have a Netlify site linked.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PROCESS_ADMIN_KEY` | No | Shared secret for write operations. If not set, writes are allowed (dev mode). |

### Setting Environment Variables

**Local (.env file):**
```env
PROCESS_ADMIN_KEY=your-secret-key
```

**Netlify Dashboard:**
1. Go to Site Settings → Environment variables
2. Add `PROCESS_ADMIN_KEY` with a secure value

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/process-db` | List all saved items |
| `GET` | `/api/process-db?id=<id>` | Get a single item |
| `POST` | `/api/process-db` | Create or update an item |
| `DELETE` | `/api/process-db?id=<id>` | Delete an item |

### Write Protection

If `PROCESS_ADMIN_KEY` is set, write operations (POST, DELETE) require the `X-Admin-Key` header:

```javascript
fetch('/api/process-db', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Key': 'your-secret-key'
  },
  body: JSON.stringify({ title: 'My Item', ... })
});
```

## Data Model

```typescript
interface ProcessItem {
  id: string;           // Auto-generated if not provided
  title: string;        // Required
  description: string;
  tags: string[];
  status: string;
  modules: any;         // Full Process page state
  createdAt: string;    // ISO-8601
  updatedAt: string;    // ISO-8601
}
```

## Deployment to Netlify

### 1. Connect Repository

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository

### 2. Configure Build Settings

The `netlify.toml` file already configures:
- Build command: `pnpm run build:netlify`
- Publish directory: `dist/public`
- Functions directory: `netlify/functions`
- API redirects

### 3. Set Environment Variables (Optional)

Add `PROCESS_ADMIN_KEY` in Netlify Dashboard for production write protection.

### 4. Deploy

Push to your main branch or trigger a manual deploy.

## File Structure

```
├── netlify.toml              # Netlify configuration
├── netlify/
│   └── functions/
│       └── process-db.js     # API function
├── client/
│   └── src/
│       └── lib/
│           └── processDbClient.ts  # Client API wrapper
```

## Troubleshooting

### API calls return 404

- Make sure you're running `pnpm dev:netlify` instead of `pnpm dev`
- Check that the `netlify.toml` redirects are correct

### "Unauthorized" error on POST/DELETE

- Check if `PROCESS_ADMIN_KEY` is set in your environment
- Ensure the `X-Admin-Key` header matches the env variable

### Data not persisting

- Netlify Blobs requires a deployed site or local Netlify CLI
- Check the Netlify Functions logs for errors
