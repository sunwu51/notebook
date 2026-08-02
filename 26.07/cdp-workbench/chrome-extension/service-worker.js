const attachedTabs = new Set();
const portTabs = new Map();

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

function attach(debuggee) {
  if (attachedTabs.has(debuggee.tabId)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    chrome.debugger.attach(debuggee, "1.3", () => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else {
        attachedTabs.add(debuggee.tabId);
        resolve();
      }
    });
  });
}

function sendCommand(debuggee, method, params) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand(debuggee, method, params, (result) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(result ?? {});
    });
  });
}

function detach(tabId) {
  if (!attachedTabs.has(tabId)) return Promise.resolve();
  return new Promise((resolve) => {
    chrome.debugger.detach({ tabId }, () => {
      void chrome.runtime.lastError;
      attachedTabs.delete(tabId);
      resolve();
    });
  });
}

chrome.debugger.onDetach.addListener((source) => {
  if (source.tabId) attachedTabs.delete(source.tabId);
});

chrome.debugger.onEvent.addListener((source, method, params) => {
  if (!source.tabId) return;
  for (const [port, tabs] of portTabs) {
    if (!tabs.has(source.tabId)) continue;
    try {
      port.postMessage({ type: "cdp-event", tabId: source.tabId, method, params: params ?? {} });
    } catch {}
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "cdp-side-panel") return;
  portTabs.set(port, new Set());

  port.onMessage.addListener(async (message) => {
    if (message.type === "release") {
      portTabs.get(port)?.delete(message.tabId);
      await detach(message.tabId);
      return;
    }
    if (message.type !== "execute") return;

    const debuggee = { tabId: message.tabId };
    try {
      await attach(debuggee);
      if (!portTabs.has(port)) {
        await detach(message.tabId);
        return;
      }
      portTabs.get(port).add(message.tabId);
      const result = await sendCommand(debuggee, message.method, message.params ?? {});
      if (portTabs.has(port)) port.postMessage({ requestId: message.requestId, ok: true, result });
    } catch (error) {
      if (portTabs.has(port)) port.postMessage({ requestId: message.requestId, ok: false, error: error.message });
    }
  });

  port.onDisconnect.addListener(() => {
    const tabs = [...(portTabs.get(port) ?? [])];
    portTabs.delete(port);
    Promise.all(tabs.map(detach)).catch(() => {});
  });
});
