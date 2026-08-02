import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket, WebSocketServer } from "ws";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number.parseInt(process.env.PORT ?? "8087", 10);
const host = process.env.HOST ?? "127.0.0.1";
const allowedHosts = new Set(["127.0.0.1", "localhost", "::1"]);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function validateEndpoint(value, protocols) {
  let endpoint;
  try { endpoint = new URL(value); } catch { throw new Error("端点 URL 格式无效"); }
  if (!protocols.includes(endpoint.protocol)) throw new Error(`不支持 ${endpoint.protocol} 协议`);
  if (!allowedHosts.has(endpoint.hostname)) throw new Error("只允许连接本机 Chrome 调试端点");
  return endpoint;
}

async function resolveWebSocketUrl(value) {
  const endpoint = validateEndpoint(value, ["http:", "https:", "ws:", "wss:"]);
  if (endpoint.protocol === "ws:" || endpoint.protocol === "wss:") return endpoint.href;
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Version URL 返回 HTTP ${response.status}`);
  const version = await response.json();
  if (typeof version.webSocketDebuggerUrl !== "string") throw new Error("Version JSON 中没有 webSocketDebuggerUrl 字段");
  return validateEndpoint(version.webSocketDebuggerUrl, ["ws:", "wss:"]).href;
}

function sendStatus(socket, state, extra = {}) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ $proxy: { state, ...extra } }));
}

function bridge(client, endpoint) {
  let upstream;
  resolveWebSocketUrl(endpoint).then((webSocketDebuggerUrl) => {
    if (client.readyState !== WebSocket.OPEN) return;
    upstream = new WebSocket(webSocketDebuggerUrl, { handshakeTimeout: 10000 });
    upstream.on("open", () => sendStatus(client, "connected", { webSocketDebuggerUrl }));
    upstream.on("message", (data, isBinary) => {
      if (client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary });
    });
    upstream.on("error", (error) => sendStatus(client, "error", { message: error.message }));
    upstream.on("close", (code, reason) => {
      sendStatus(client, "closed", { code, reason: reason.toString() });
      if (client.readyState === WebSocket.OPEN) client.close(1011, "CDP upstream closed");
    });
  }).catch((error) => {
    sendStatus(client, "error", { message: error.message });
    client.close(1008, "Invalid CDP endpoint");
  });

  client.on("message", (data, isBinary) => {
    if (upstream?.readyState === WebSocket.OPEN) upstream.send(data, { binary: isBinary });
  });
  client.on("close", () => {
    if (upstream && upstream.readyState <= WebSocket.OPEN) upstream.close();
  });
  client.on("error", () => {
    if (upstream && upstream.readyState <= WebSocket.OPEN) upstream.close();
  });
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(`${root}${path.sep}`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": contentTypes[path.extname(filePath)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
});

const webSocketServer = new WebSocketServer({ noServer: true });
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const endpoint = url.searchParams.get("endpoint");
  if (url.pathname !== "/cdp" || !endpoint) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }
  webSocketServer.handleUpgrade(request, socket, head, (client) => bridge(client, endpoint));
});

server.listen(port, host, () => console.log(`CDP WebSocket Workbench: http://${host}:${port}`));
