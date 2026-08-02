import { loadMethodCatalog, setupMethodPicker, showResult } from "./schema-ui.js";

const endpointInput = document.querySelector("#endpointInput");
const connectButton = document.querySelector("#connectButton");
const connectionBadge = document.querySelector("#connectionBadge");
const connectionDetail = document.querySelector("#connectionDetail");
const targetPanel = document.querySelector("#targetPanel");
const targetSelect = document.querySelector("#targetSelect");
const targetCount = document.querySelector("#targetCount");
const targetDetail = document.querySelector("#targetDetail");
const refreshTargetsButton = document.querySelector("#refreshTargetsButton");
const commandPanel = document.querySelector("#commandPanel");
const commandForm = document.querySelector("#commandForm");
const methodInput = document.querySelector("#methodInput");
const methodList = document.querySelector("#methodList");
const methodDescription = document.querySelector("#methodDescription");
const paramsInput = document.querySelector("#paramsInput");
const methodCount = document.querySelector("#methodCount");
const submitButton = document.querySelector("#submitButton");
const resultOutput = document.querySelector("#resultOutput");
const clearButton = document.querySelector("#clearButton");
const eventOutput = document.querySelector("#eventOutput");
const clearEventButton = document.querySelector("#clearEventButton");

let socket = null;
let nextId = 1;
let pageSessionId = null;
let selectedTarget = null;
let pageTargets = [];
let selectionVersion = 0;
let recentEvents = [];
const pending = new Map();
const rootDomains = new Set(["Browser", "Target", "SystemInfo"]);

const { methods, typeIndex } = await loadMethodCatalog();
const picker = setupMethodPicker({ methods, typeIndex, input: methodInput, list: methodList, description: methodDescription, params: paramsInput, count: methodCount });
picker.select(methods.find((item) => item.method === "Runtime.evaluate") ?? methods[0]);

function clearEvents() {
  recentEvents = [];
  showResult(eventOutput, "尚未收到事件", "empty");
}

function addEvent(message) {
  recentEvents.unshift({
    receivedAt: new Date().toISOString(),
    method: message.method,
    sessionId: message.sessionId ?? null,
    params: message.params ?? {},
  });
  recentEvents = recentEvents.slice(0, 10);
  showResult(eventOutput, recentEvents);
}

function setConnection(state, label, detail = "") {
  connectionBadge.dataset.state = state;
  connectionBadge.textContent = label;
  connectionDetail.textContent = detail;
  connectionDetail.classList.toggle("error", state === "error");
  targetPanel.hidden = state !== "connected";
  if (state !== "connected") commandPanel.hidden = true;
}

function resetTargetUi() {
  pageSessionId = null;
  selectedTarget = null;
  pageTargets = [];
  targetSelect.replaceChildren(new Option("请选择一个页面 Target", ""));
  targetCount.textContent = "";
  targetDetail.textContent = "";
  targetDetail.classList.remove("error");
  commandPanel.hidden = true;
  clearEvents();
}

function closeSocket() {
  selectionVersion += 1;
  if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
  socket = null;
  resetTargetUi();
  for (const request of pending.values()) request.reject(new Error("WebSocket 已断开"));
  pending.clear();
}

function sendRaw(method, params = {}, sessionId = null) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return Promise.reject(new Error("WebSocket 尚未连接"));
  const id = nextId++;
  const message = { id, method, params };
  if (sessionId) message.sessionId = sessionId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, message });
    socket.send(JSON.stringify(message));
  });
}

async function detachCurrentTarget() {
  const sessionId = pageSessionId;
  pageSessionId = null;
  selectedTarget = null;
  commandPanel.hidden = true;
  clearEvents();
  if (sessionId && socket?.readyState === WebSocket.OPEN) {
    try { await sendRaw("Target.detachFromTarget", { sessionId }); } catch {}
  }
}

async function loadTargets() {
  refreshTargetsButton.disabled = true;
  targetSelect.disabled = true;
  selectionVersion += 1;
  await detachCurrentTarget();
  try {
    const { targetInfos } = await sendRaw("Target.getTargets");
    pageTargets = targetInfos.filter((target) => target.type === "page");
    targetSelect.replaceChildren(new Option("请选择一个页面 Target", ""));
    for (const target of pageTargets) {
      const option = new Option(`${target.title || "（无标题）"} — ${target.url}`, target.targetId);
      option.title = `${target.url}\n${target.targetId}`;
      targetSelect.add(option);
    }
    targetSelect.value = "";
    targetCount.textContent = `${pageTargets.length} 个 Page Target`;
    targetDetail.textContent = pageTargets.length ? "" : "当前浏览器没有可用的 Page Target。";
  } catch (error) {
    targetDetail.textContent = `读取 Target 失败：${error.message}`;
    targetDetail.classList.add("error");
  } finally {
    refreshTargetsButton.disabled = false;
    targetSelect.disabled = false;
  }
}

async function selectTarget(targetId) {
  const version = ++selectionVersion;
  targetSelect.disabled = true;
  targetDetail.classList.remove("error");
  await detachCurrentTarget();
  if (!targetId) {
    targetDetail.textContent = "";
    targetSelect.disabled = false;
    return;
  }

  const target = pageTargets.find((item) => item.targetId === targetId);
  if (!target) {
    targetDetail.textContent = "所选 Target 已不存在，请刷新列表。";
    targetDetail.classList.add("error");
    targetSelect.disabled = false;
    return;
  }

  try {
    const attached = await sendRaw("Target.attachToTarget", { targetId, flatten: true });
    if (version !== selectionVersion) {
      await sendRaw("Target.detachFromTarget", { sessionId: attached.sessionId });
      return;
    }
    pageSessionId = attached.sessionId;
    selectedTarget = target;
    targetDetail.textContent = `${target.url} · targetId ${target.targetId}`;
    commandPanel.hidden = false;
  } catch (error) {
    targetDetail.textContent = `附加 Target 失败：${error.message}`;
    targetDetail.classList.add("error");
  } finally {
    if (version === selectionVersion) targetSelect.disabled = false;
  }
}

async function connect() {
  connectButton.disabled = true;
  setConnection("idle", "连接中", "Node 代理正在解析端点并连接 Chrome…");
  closeSocket();
  try {
    const endpoint = endpointInput.value.trim();
    if (!/^(https?|wss?):\/\//i.test(endpoint)) throw new Error("请输入有效的 WebSocket URL 或 Version URL");
    const proxyProtocol = location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(`${proxyProtocol}//${location.host}/cdp?endpoint=${encodeURIComponent(endpoint)}`);
    const connectedSocket = socket;

    const proxyReady = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Node 代理连接 Chrome 超时")), 12000);
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        if (!message.$proxy) return;
        if (message.$proxy.state === "connected") { clearTimeout(timer); resolve(message.$proxy); }
        else if (message.$proxy.state === "error") { clearTimeout(timer); reject(new Error(message.$proxy.message)); }
      });
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.$proxy) return;
      if (!message.id) {
        if (message.method && (!message.sessionId || message.sessionId === pageSessionId)) {
          addEvent(message);
        }
        return;
      }
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(Object.assign(new Error(message.error.message), { cdpError: message.error, request: request.message }));
      else request.resolve(message.result ?? {});
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Node 代理 WebSocket 连接超时")), 10000);
      socket.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
      socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("Node 代理 WebSocket 握手失败")); }, { once: true });
    });
    socket.addEventListener("close", () => {
      if (socket === connectedSocket) setConnection("idle", "已断开", "Node 代理或 Chrome CDP 连接已关闭。");
    });

    const proxy = await proxyReady;
    setConnection("connected", "已连接", `Node 代理已连接 ${proxy.webSocketDebuggerUrl}`);
    await loadTargets();
  } catch (error) {
    closeSocket();
    setConnection("error", "连接失败", error.message);
  } finally {
    connectButton.disabled = false;
  }
}

connectButton.addEventListener("click", connect);
refreshTargetsButton.addEventListener("click", loadTargets);
targetSelect.addEventListener("change", () => selectTarget(targetSelect.value));

commandForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selected = picker.getSelected();
  if (!selected) return showResult(resultOutput, "请选择协议列表中的有效 method。", "error");
  let params;
  try { params = JSON.parse(paramsInput.value || "{}"); }
  catch (error) { return showResult(resultOutput, `Params 不是有效 JSON：${error.message}`, "error"); }

  submitButton.disabled = true;
  showResult(resultOutput, "调用中…", "empty");
  try {
    const sessionId = rootDomains.has(selected.domain) ? null : pageSessionId;
    if (!sessionId && !rootDomains.has(selected.domain)) throw new Error("该命令需要先选择 Page Target");
    const result = await sendRaw(selected.method, params, sessionId);
    showResult(resultOutput, { method: selected.method, target: selectedTarget, sessionId, result });
  } catch (error) {
    showResult(resultOutput, { message: error.message, cdpError: error.cdpError, request: error.request }, "error");
  } finally {
    submitButton.disabled = false;
  }
});

clearButton.addEventListener("click", () => showResult(resultOutput, "尚未调用", "empty"));
clearEventButton.addEventListener("click", clearEvents);
