# CDP Workbench

This folder contains the filtered protocol Schema and two CDP clients.

## Protocol data

`protocol.json` was downloaded from `http://127.0.0.1:9223/json/protocol`. Objects marked with `deprecated: true` were removed from arrays. Identical copies are bundled with both clients.

## Node WebSocket client

The browser only connects to the same-origin Node server. Node resolves a supplied `/json/version` URL when necessary, connects to Chrome as the upstream WebSocket client, and forwards CDP messages in both directions. This avoids browser CORS and WebSocket Origin restrictions.

```powershell
Set-Location .\websocket-client
npm install
npm start
```

Open `http://127.0.0.1:8087`. The input accepts either:

- `http://127.0.0.1:9223/json/version`
- `ws://127.0.0.1:9223/devtools/browser/<id>`

For safety, the proxy only connects to `127.0.0.1`, `localhost`, or `::1`. Set `PORT` or `HOST` before `npm start` to change the web server listener.

The proxy connects to the browser-level CDP endpoint. After connecting, the UI lists every `type: "page"` Target with its title, URL, and `targetId`. Select a Target URL explicitly before calling page-scoped domains such as `Runtime`, `Page`, and `DOM`. Switching or refreshing the selection detaches the previous session before attaching the new Target.

CDP events without a request `id` are shown in the **Latest Event** panel when their `sessionId` matches the selected Target. For example, call `Page.enable` and then navigate or reload the selected page to see `Page.*` events.

## Chrome extension

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Select **Load unpacked** and choose the `chrome-extension` folder.
4. Open a normal web page and click the extension icon.

Clicking the icon opens `sidepanel.html` in Chrome's Side Panel. The panel itself is not a browser tab. Its CDP target is always the active tab in the same Chrome window.

When the active tab changes, the panel detaches the previous target and switches to the new active `tabId`. Closing the panel detaches any target used by that panel. Chrome restricts some protocol domains when CDP is used through `chrome.debugger`; those failures are displayed in the result panel.

The service worker forwards `chrome.debugger.onEvent` messages only to the Side Panel that owns the matching `tabId`. The panel displays the latest event with its method, timestamp, tab ID, and parameters.
