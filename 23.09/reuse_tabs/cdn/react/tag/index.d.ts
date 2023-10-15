import Component from '../../components/tag/tag.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlRemoveEvent } from '../../../src/events/events';
export type { SlRemoveEvent } from '../../../src/events/events';
/**
 * @summary Tags are used as labels to organize things or to indicate a selection.
 * @documentation https://shoelace.style/components/tag
 * @status stable
 * @since 2.0
 *
 * @dependency sl-icon-button
 *
 * @slot - The tag's content.
 *
 * @event sl-remove - Emitted when the remove button is activated.
 *
 * @csspart base - The component's base wrapper.
 * @csspart content - The tag's content.
 * @csspart remove-button - The tag's remove button, an `<sl-icon-button>`.
 * @csspart remove-button__base - The remove button's exported `base` part.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlRemove: EventName<SlRemoveEvent>;
}>;
export default reactWrapper;
