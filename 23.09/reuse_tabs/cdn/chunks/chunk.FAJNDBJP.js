import {
  waitForEvent
} from "./chunk.B4BZKR24.js";
import {
  prefersReducedMotion
} from "./chunk.65AZ2BGN.js";
import {
  __decorateClass
} from "./chunk.LKA3TPUC.js";

// src/internal/debounce.ts
var TIMER_ID_KEY = Symbol();
var debounce = (delay) => {
  return (_target, _propertyKey, descriptor) => {
    const fn = descriptor.value;
    descriptor.value = function(...args) {
      clearTimeout(this[TIMER_ID_KEY]);
      this[TIMER_ID_KEY] = window.setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };
};

// src/components/carousel/scroll-controller.ts
var ScrollController = class {
  constructor(host) {
    this.pointers = /* @__PURE__ */ new Set();
    this.dragging = false;
    this.scrolling = false;
    this.mouseDragging = false;
    this.handleScroll = () => {
      if (!this.scrolling) {
        this.scrolling = true;
        this.host.requestUpdate();
      }
      this.handleScrollEnd();
    };
    this.handlePointerDown = (event) => {
      if (event.pointerType === "touch") {
        return;
      }
      this.pointers.add(event.pointerId);
      const canDrag = this.mouseDragging && !this.dragging && event.button === 0;
      if (canDrag) {
        event.preventDefault();
        this.host.scrollContainer.addEventListener("pointermove", this.handlePointerMove);
      }
    };
    this.handlePointerMove = (event) => {
      const scrollContainer = this.host.scrollContainer;
      const hasMoved = !!event.movementX || !!event.movementY;
      if (!this.dragging && hasMoved) {
        scrollContainer.setPointerCapture(event.pointerId);
        this.handleDragStart();
      } else if (scrollContainer.hasPointerCapture(event.pointerId)) {
        this.handleDrag(event);
      }
    };
    this.handlePointerUp = (event) => {
      this.pointers.delete(event.pointerId);
      this.host.scrollContainer.releasePointerCapture(event.pointerId);
      if (this.pointers.size === 0) {
        this.handleDragEnd();
      }
    };
    this.handleTouchEnd = (event) => {
      for (const touch of event.changedTouches) {
        this.pointers.delete(touch.identifier);
      }
    };
    this.handleTouchStart = (event) => {
      for (const touch of event.touches) {
        this.pointers.add(touch.identifier);
      }
    };
    this.host = host;
    host.addController(this);
  }
  async hostConnected() {
    const host = this.host;
    await host.updateComplete;
    const scrollContainer = host.scrollContainer;
    scrollContainer.addEventListener("scroll", this.handleScroll, { passive: true });
    scrollContainer.addEventListener("pointerdown", this.handlePointerDown);
    scrollContainer.addEventListener("pointerup", this.handlePointerUp);
    scrollContainer.addEventListener("pointercancel", this.handlePointerUp);
    scrollContainer.addEventListener("touchstart", this.handleTouchStart, { passive: true });
    scrollContainer.addEventListener("touchend", this.handleTouchEnd);
  }
  hostDisconnected() {
    const host = this.host;
    const scrollContainer = host.scrollContainer;
    scrollContainer.removeEventListener("scroll", this.handleScroll);
    scrollContainer.removeEventListener("pointerdown", this.handlePointerDown);
    scrollContainer.removeEventListener("pointerup", this.handlePointerUp);
    scrollContainer.removeEventListener("pointercancel", this.handlePointerUp);
    scrollContainer.removeEventListener("touchstart", this.handleTouchStart);
    scrollContainer.removeEventListener("touchend", this.handleTouchEnd);
  }
  handleScrollEnd() {
    if (!this.pointers.size) {
      this.scrolling = false;
      this.host.scrollContainer.dispatchEvent(
        new CustomEvent("scrollend", {
          bubbles: false,
          cancelable: false
        })
      );
      this.host.requestUpdate();
    } else {
      this.handleScrollEnd();
    }
  }
  handleDragStart() {
    const host = this.host;
    this.dragging = true;
    host.scrollContainer.style.setProperty("scroll-snap-type", "unset");
    host.requestUpdate();
  }
  handleDrag(event) {
    this.host.scrollContainer.scrollBy({
      left: -event.movementX,
      top: -event.movementY
    });
  }
  async handleDragEnd() {
    const host = this.host;
    const scrollContainer = host.scrollContainer;
    scrollContainer.removeEventListener("pointermove", this.handlePointerMove);
    this.dragging = false;
    const startLeft = scrollContainer.scrollLeft;
    const startTop = scrollContainer.scrollTop;
    scrollContainer.style.removeProperty("scroll-snap-type");
    const finalLeft = scrollContainer.scrollLeft;
    const finalTop = scrollContainer.scrollTop;
    scrollContainer.style.setProperty("scroll-snap-type", "unset");
    scrollContainer.scrollTo({ left: startLeft, top: startTop, behavior: "auto" });
    scrollContainer.scrollTo({ left: finalLeft, top: finalTop, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    if (this.scrolling) {
      await waitForEvent(scrollContainer, "scrollend");
    }
    scrollContainer.style.removeProperty("scroll-snap-type");
    host.requestUpdate();
  }
};
__decorateClass([
  debounce(100)
], ScrollController.prototype, "handleScrollEnd", 1);

export {
  ScrollController
};
