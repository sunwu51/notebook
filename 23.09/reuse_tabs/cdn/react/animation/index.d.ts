import Component from '../../components/animation/animation.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlCancelEvent } from '../../../src/events/events';
import type { SlFinishEvent } from '../../../src/events/events';
import type { SlStartEvent } from '../../../src/events/events';
export type { SlCancelEvent } from '../../../src/events/events';
export type { SlFinishEvent } from '../../../src/events/events';
export type { SlStartEvent } from '../../../src/events/events';
/**
 * @summary Animate elements declaratively with nearly 100 baked-in presets, or roll your own with custom keyframes. Powered by the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).
 * @documentation https://shoelace.style/components/animation
 * @status stable
 * @since 2.0
 *
 * @event sl-cancel - Emitted when the animation is canceled.
 * @event sl-finish - Emitted when the animation finishes.
 * @event sl-start - Emitted when the animation starts or restarts.
 *
 * @slot - The element to animate. Avoid slotting in more than one element, as subsequent ones will be ignored. To
 *  animate multiple elements, either wrap them in a single container or use multiple `<sl-animation>` elements.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlCancel: EventName<SlCancelEvent>;
    onSlFinish: EventName<SlFinishEvent>;
    onSlStart: EventName<SlStartEvent>;
}>;
export default reactWrapper;
