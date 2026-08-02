import { loadMethodCatalog, setupMethodPicker, showResult } from "./schema-ui.js";

const connectionBadge = document.querySelector("#connectionBadge");
const targetLabel = document.querySelector("#targetLabel");
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

const port = chrome.runtime.connect({ name: "cdp-side-panel" });
const pending = new Map();
let requestId = 1;
let targetTab = null;
let recentEvents = [];
const currentWindow = await chrome.windows.getCurrent();

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
    tabId: message.tabId,
    params: message.params ?? {},
  });
  recentEvents = recentEvents.slice(0, 10);
  showResult(eventOutput, recentEvents);
}

function setUnavailable(message) {
  targetTab = null;
  connectionBadge.dataset.state = "error";
  connectionBadge.textContent = "无目标";
  targetLabel.textContent = message;
  submitButton.disabled = true;
  clearEvents();
}

async function setTarget(tabId = null) {
  try {
    const tab = tabId === null
      ? (await chrome.tabs.query({ active: true, windowId: currentWindow.id }))[0]
      : await chrome.tabs.get(tabId);
    if (!tab?.id) return setUnavailable("当前窗口没有活动标签页");

    const previousTabId = targetTab?.id;
    if (previousTabId && previousTabId !== tab.id) {
      port.postMessage({ type: "release", tabId: previousTabId });
      clearEvents();
    }
    targetTab = tab;
    connectionBadge.dataset.state = "idle";
    connectionBadge.textContent = "就绪";
    targetLabel.textContent = `${tab.title || "当前标签页"} · tabId ${tab.id}`;
    submitButton.disabled = false;
  } catch (error) {
    setUnavailable(error.message);
  }
}

await setTarget();
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  if (windowId === currentWindow.id) void setTarget(tabId);
});
chrome.tabs.onRemoved.addListener((tabId) => {
  if (targetTab?.id === tabId) setUnavailable("当前目标标签页已关闭");
});

port.onMessage.addListener((message) => {
  if (message.type === "cdp-event") {
    if (targetTab?.id === message.tabId) {
      addEvent(message);
    }
    return;
  }
  const request = pending.get(message.requestId);
  if (!request) return;
  pending.delete(message.requestId);
  if (message.ok) request.resolve(message.result);
  else request.reject(new Error(message.error));
});

function execute(method, params) {
  const id = requestId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    port.postMessage({ type: "execute", requestId: id, tabId: targetTab.id, method, params });
  });
}

commandForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selected = picker.getSelected();
  if (!selected) return showResult(resultOutput, "请选择协议列表中的有效 method。", "error");
  let params;
  try { params = JSON.parse(paramsInput.value || "{}"); }
  catch (error) { return showResult(resultOutput, `Params 不是有效 JSON：${error.message}`, "error"); }

  submitButton.disabled = true;
  connectionBadge.dataset.state = "idle";
  connectionBadge.textContent = "调用中";
  showResult(resultOutput, "调用中…", "empty");
  try {
    const result = await execute(selected.method, params);
    connectionBadge.dataset.state = "connected";
    connectionBadge.textContent = "已附加";
    showResult(resultOutput, { method: selected.method, tabId: targetTab.id, result });
  } catch (error) {
    connectionBadge.dataset.state = "error";
    connectionBadge.textContent = "调用失败";
    showResult(resultOutput, { method: selected.method, tabId: targetTab.id, error: error.message }, "error");
  } finally {
    submitButton.disabled = false;
  }
});

clearButton.addEventListener("click", () => showResult(resultOutput, "尚未调用", "empty"));
clearEventButton.addEventListener("click", clearEvents);
