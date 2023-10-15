// node_modules/composed-offset-position/dist/composed-offset-position.browser.min.mjs
function t(t2) {
  return r(t2);
}
function o(t2) {
  return t2.assignedSlot ? t2.assignedSlot : t2.parentNode instanceof ShadowRoot ? t2.parentNode.host : t2.parentNode;
}
function r(t2) {
  for (let e = t2; e; e = o(e))
    if (e instanceof Element && "none" === getComputedStyle(e).display)
      return null;
  for (let e = o(t2); e; e = o(e)) {
    if (!(e instanceof Element))
      continue;
    const t3 = getComputedStyle(e);
    if ("contents" !== t3.display) {
      if ("static" !== t3.position || "none" !== t3.filter)
        return e;
      if ("BODY" === e.tagName)
        return e;
    }
  }
  return null;
}

export {
  t
};
