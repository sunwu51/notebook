import {
  t
} from "./chunk.MGAW64L2.js";

// src/internal/tabbable.ts
function isTabbable(el) {
  const tag = el.tagName.toLowerCase();
  if (el.getAttribute("tabindex") === "-1") {
    return false;
  }
  if (el.hasAttribute("disabled")) {
    return false;
  }
  if (el.hasAttribute("aria-disabled") && el.getAttribute("aria-disabled") !== "false") {
    return false;
  }
  if (tag === "input" && el.getAttribute("type") === "radio" && !el.hasAttribute("checked")) {
    return false;
  }
  if (el.offsetParent === null && t(el) === null) {
    return false;
  }
  if (window.getComputedStyle(el).visibility === "hidden") {
    return false;
  }
  if ((tag === "audio" || tag === "video") && el.hasAttribute("controls")) {
    return true;
  }
  if (el.hasAttribute("tabindex")) {
    return true;
  }
  if (el.hasAttribute("contenteditable") && el.getAttribute("contenteditable") !== "false") {
    return true;
  }
  return ["button", "input", "select", "textarea", "a", "audio", "video", "summary"].includes(tag);
}
function getTabbableBoundary(root) {
  var _a, _b;
  const tabbableElements = getTabbableElements(root);
  const start = (_a = tabbableElements[0]) != null ? _a : null;
  const end = (_b = tabbableElements[tabbableElements.length - 1]) != null ? _b : null;
  return { start, end };
}
function getTabbableElements(root) {
  const tabbableElements = [];
  function walk(el) {
    if (el instanceof Element) {
      if (el.hasAttribute("inert")) {
        return;
      }
      if (!tabbableElements.includes(el) && isTabbable(el)) {
        tabbableElements.push(el);
      }
      const slotChildrenOutsideRootElement = (slotElement) => {
        var _a;
        return ((_a = slotElement.getRootNode({ composed: true })) == null ? void 0 : _a.host) !== root;
      };
      if (el instanceof HTMLSlotElement && slotChildrenOutsideRootElement(el)) {
        el.assignedElements({ flatten: true }).forEach((assignedEl) => {
          walk(assignedEl);
        });
      }
      if (el.shadowRoot !== null && el.shadowRoot.mode === "open") {
        walk(el.shadowRoot);
      }
    }
    [...el.children].forEach((e) => walk(e));
  }
  walk(root);
  return tabbableElements;
}

export {
  getTabbableBoundary,
  getTabbableElements
};
