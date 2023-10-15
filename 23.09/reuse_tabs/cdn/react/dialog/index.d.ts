import Component from '../../components/dialog/dialog.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlShowEvent } from '../../../src/events/events';
import type { SlAfterShowEvent } from '../../../src/events/events';
import type { SlHideEvent } from '../../../src/events/events';
import type { SlAfterHideEvent } from '../../../src/events/events';
import type { SlInitialFocusEvent } from '../../../src/events/events';
import type { SlRequestCloseEvent } from '../../../src/events/events';
export type { SlShowEvent } from '../../../src/events/events';
export type { SlAfterShowEvent } from '../../../src/events/events';
export type { SlHideEvent } from '../../../src/events/events';
export type { SlAfterHideEvent } from '../../../src/events/events';
export type { SlInitialFocusEvent } from '../../../src/events/events';
export type { SlRequestCloseEvent } from '../../../src/events/events';
/**
 * @summary Dialogs, sometimes called "modals", appear above the page and require the user's immediate attention.
 * @documentation https://shoelace.style/components/dialog
 * @status stable
 * @since 2.0
 *
 * @dependency sl-icon-button
 *
 * @slot - The dialog's main content.
 * @slot label - The dialog's label. Alternatively, you can use the `label` attribute.
 * @slot header-actions - Optional actions to add to the header. Works best with `<sl-icon-button>`.
 * @slot footer - The dialog's footer, usually one or more buttons representing various options.
 *
 * @event sl-show - Emitted when the dialog opens.
 * @event sl-after-show - Emitted after the dialog opens and all animations are complete.
 * @event sl-hide - Emitted when the dialog closes.
 * @event sl-after-hide - Emitted after the dialog closes and all animations are complete.
 * @event sl-initial-focus - Emitted when the dialog opens and is ready to receive focus. Calling
 *   `event.preventDefault()` will prevent focusing and allow you to set it on a different element, such as an input.
 * @event {{ source: 'close-button' | 'keyboard' | 'overlay' }} sl-request-close - Emitted when the user attempts to
 *   close the dialog by clicking the close button, clicking the overlay, or pressing escape. Calling
 *   `event.preventDefault()` will keep the dialog open. Avoid using this unless closing the dialog will result in
 *   destructive behavior such as data loss.
 *
 * @csspart base - The component's base wrapper.
 * @csspart overlay - The overlay that covers the screen behind the dialog.
 * @csspart panel - The dialog's panel (where the dialog and its content are rendered).
 * @csspart header - The dialog's header. This element wraps the title and header actions.
 * @csspart header-actions - Optional actions to add to the header. Works best with `<sl-icon-button>`.
 * @csspart title - The dialog's title.
 * @csspart close-button - The close button, an `<sl-icon-button>`.
 * @csspart close-button__base - The close button's exported `base` part.
 * @csspart body - The dialog's body.
 * @csspart footer - The dialog's footer.
 *
 * @cssproperty --width - The preferred width of the dialog. Note that the dialog will shrink to accommodate smaller screens.
 * @cssproperty --header-spacing - The amount of padding to use for the header.
 * @cssproperty --body-spacing - The amount of padding to use for the body.
 * @cssproperty --footer-spacing - The amount of padding to use for the footer.
 *
 * @animation dialog.show - The animation to use when showing the dialog.
 * @animation dialog.hide - The animation to use when hiding the dialog.
 * @animation dialog.denyClose - The animation to use when a request to close the dialog is denied.
 * @animation dialog.overlay.show - The animation to use when showing the dialog's overlay.
 * @animation dialog.overlay.hide - The animation to use when hiding the dialog's overlay.
 *
 * @property modal - Exposes the internal modal utility that controls focus trapping. To temporarily disable focus
 *   trapping and allow third-party modals spawned from an active Shoelace modal, call `modal.activateExternal()` when
 *   the third-party modal opens. Upon closing, call `modal.deactivateExternal()` to restore Shoelace's focus trapping.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlShow: EventName<SlShowEvent>;
    onSlAfterShow: EventName<SlAfterShowEvent>;
    onSlHide: EventName<SlHideEvent>;
    onSlAfterHide: EventName<SlAfterHideEvent>;
    onSlInitialFocus: EventName<SlInitialFocusEvent>;
    onSlRequestClose: EventName<SlRequestCloseEvent>;
}>;
export default reactWrapper;
