import Component from '../../components/copy-button/copy-button.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlCopyEvent } from '../../../src/events/events';
import type { SlErrorEvent } from '../../../src/events/events';
export type { SlCopyEvent } from '../../../src/events/events';
export type { SlErrorEvent } from '../../../src/events/events';
/**
 * @summary Copies text data to the clipboard when the user clicks the trigger.
 * @documentation https://shoelace.style/components/copy
 * @status experimental
 * @since 2.7
 *
 * @dependency sl-icon
 * @dependency sl-tooltip
 *
 * @event sl-copy - Emitted when the data has been copied.
 * @event sl-error - Emitted when the data could not be copied.
 *
 * @slot copy-icon - The icon to show in the default copy state. Works best with `<sl-icon>`.
 * @slot success-icon - The icon to show when the content is copied. Works best with `<sl-icon>`.
 * @slot error-icon - The icon to show when a copy error occurs. Works best with `<sl-icon>`.
 *
 * @csspart button - The internal `<button>` element.
 * @csspart copy-icon - The container that holds the copy icon.
 * @csspart success-icon - The container that holds the success icon.
 * @csspart error-icon - The container that holds the error icon.
 * @csspart tooltip__base - The tooltip's exported `base` part.
 * @csspart tooltip__base__popup - The tooltip's exported `popup` part.
 * @csspart tooltip__base__arrow - The tooltip's exported `arrow` part.
 * @csspart tooltip__body - The tooltip's exported `body` part.
 *
 * @cssproperty --success-color - The color to use for success feedback.
 * @cssproperty --error-color - The color to use for error feedback.
 *
 * @animation copy.in - The animation to use when feedback icons animate in.
 * @animation copy.out - The animation to use when feedback icons animate out.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlCopy: EventName<SlCopyEvent>;
    onSlError: EventName<SlErrorEvent>;
}>;
export default reactWrapper;
