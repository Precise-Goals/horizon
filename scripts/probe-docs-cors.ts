import { app } from '../api/v1/[[...route]]';

async function fullProbeMatrix() {
  console.log('========================================================================');
  console.log('           HORIZON DOCUMENTATION & CORS PROBE AUDIT MATRIX              ');
  console.log('========================================================================\n');

  // 1. Edge API Routes (In-Process Hono Edge Runtime)
  const edgeEndpoints = [
    { name: 'Edge API Swagger UI', path: '/api/v1/docs', method: 'GET' },
    { name: 'Edge API ReDoc UI', path: '/api/v1/redoc', method: 'GET' },
    { name: 'Edge API OpenAPI JSON', path: '/api/v1/openapi.json', method: 'GET' },
    { name: 'Edge API Health with Origin', path: '/api/v1/health', method: 'GET' },
    { name: 'Edge API CORS Preflight (OPTIONS)', path: '/api/v1/chaos', method: 'OPTIONS' }
  ];

  console.log('--- 1. EDGE REST API (api/v1 - Hono Edge Runtime) ---');
  for (const ep of edgeEndpoints) {
    const t0 = performance.now();
    const reqHeaders: Record<string, string> = {
      'Origin': 'https://horizon-aiops.vercel.app',
    };
    if (ep.method === 'OPTIONS') {
      reqHeaders['Access-Control-Request-Method'] = 'POST';
      reqHeaders['Access-Control-Request-Headers'] = 'Content-Type, Authorization';
    }

    const res = await app.request(ep.path, {
      method: ep.method,
      headers: reqHeaders
    });
    const dur = (performance.now() - t0).toFixed(2);
    console.log(`[${ep.method}] ${ep.path.padEnd(26)} -> Status: ${res.status} (${dur}ms)`);
    console.log(`     Content-Type: ${res.headers.get('content-type') || '(none)'}`);
    console.log(`     CORS Allow-Origin: ${res.headers.get('access-control-allow-origin') || '(none)'}`);
    console.log(`     CORS Allow-Methods: ${res.headers.get('access-control-allow-methods') || '(none)'}`);
    console.log(`     CORS Allow-Headers: ${res.headers.get('access-control-allow-headers') || '(none)'}\n`);
  }

  // 2. Local Frontend Web Routes (Vite Dev Server)
  console.log('--- 2. LOCAL FRONTEND WEB DOCS (http://localhost:5173 - React 19 / Vite) ---');
  const webEndpoints = [
    { name: 'Web Docs Portal', url: 'http://localhost:5173/docs' },
    { name: 'Web MCP Catalogue', url: 'http://localhost:5173/mcp' }
  ];
  for (const ep of webEndpoints) {
    try {
      const t0 = performance.now();
      const res = await fetch(ep.url);
      const dur = (performance.now() - t0).toFixed(2);
      console.log(`[GET] ${ep.url.padEnd(30)} -> Status: ${res.status} ${res.statusText} (${dur}ms)`);
      console.log(`     Content-Type: ${res.headers.get('content-type')}\n`);
    } catch(err: any) {
      console.log(`[GET] ${ep.url} -> Error: ${err.message}\n`);
    }
  }

  // 3. Remote Production REST / FastMCP Server (Render)
  console.log('--- 3. REMOTE REST & MCP SERVER (https://horizon-mcp-server-phf8.onrender.com) ---');
  const remoteEndpoints = [
    { name: 'FastAPI Swagger UI', url: 'https://horizon-mcp-server-phf8.onrender.com/docs', method: 'GET' },
    { name: 'FastAPI ReDoc UI', url: 'https://horizon-mcp-server-phf8.onrender.com/redoc', method: 'GET' },
    { name: 'FastAPI OpenAPI Schema', url: 'https://horizon-mcp-server-phf8.onrender.com/openapi.json', method: 'GET' },
    { name: 'FastAPI Health Probe', url: 'https://horizon-mcp-server-phf8.onrender.com/health', method: 'GET' },
    { name: 'CORS Preflight (OPTIONS)', url: 'https://horizon-mcp-server-phf8.onrender.com/mcp', method: 'OPTIONS' }
  ];
  for (const ep of remoteEndpoints) {
    try {
      const t0 = performance.now();
      const headers: Record<string, string> = {
        'Origin': 'https://horizon-aiops.vercel.app',
      };
      if (ep.method === 'OPTIONS') {
        headers['Access-Control-Request-Method'] = 'POST';
        headers['Access-Control-Request-Headers'] = 'Content-Type, Authorization';
      }

      const res = await fetch(ep.url, { method: ep.method, headers });
      const dur = (performance.now() - t0).toFixed(2);
      console.log(`[${ep.method}] ${ep.url.padEnd(58)} -> Status: ${res.status} (${dur}ms)`);
      console.log(`     Content-Type: ${res.headers.get('content-type') || '(none)'}`);
      console.log(`     CORS Allow-Origin: ${res.headers.get('access-control-allow-origin') || '(none)'}`);
      console.log(`     CORS Allow-Methods: ${res.headers.get('access-control-allow-methods') || '(none)'}`);
      console.log(`     CORS Allow-Headers: ${res.headers.get('access-control-allow-headers') || '(none)'}\n`);
    } catch(err: any) {
      console.log(`[${ep.method}] ${ep.url} -> Error: ${err.message}\n`);
    }
  }
}

fullProbeMatrix();
