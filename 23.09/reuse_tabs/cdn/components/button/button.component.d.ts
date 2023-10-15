import ShoelaceElement from '../../internal/shoelace-element.js';
import SlIcon from '../icon/icon.component.js';
import SlSpinner from '../spinner/spinner.component.js';
import type { CSSResultGroup } from 'lit';
import type { ShoelaceFormControl } from '../../internal/shoelace-element.js';
/**
 * @summary Buttons represent actions that are available to the user.
 * @documentation https://shoelace.style/components/button
 * @status stable
 * @since 2.0
 *
 * @dependency sl-icon
 * @dependency sl-spinner
 *
 * @event sl-blur - Emitted when the button loses focus.
 * @event sl-focus - Emitted when the button gains focus.
 * @event sl-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @slot - The button's label.
 * @slot prefix - A presentational prefix icon or similar element.
 * @slot suffix - A presentational suffix icon or similar element.
 *
 * @csspart base - The component's base wrapper.
 * @csspart prefix - The container that wraps the prefix.
 * @csspart label - The button's label.
 * @csspart suffix - The container that wraps the suffix.
 * @csspart caret - The button's caret icon, an `<sl-icon>` element.
 * @csspart spinner - The spinner that shows when the button is in the loading state.
 */
export default class SlButton extends ShoelaceElement implements ShoelaceFormControl {
    static styles: CSSResultGroup;
    static dependencies: {
        'sl-icon': typeof SlIcon;
        'sl-spinner': typeof SlSpinner;
    };
    private readonly formControlController;
    private readonly hasSlotController;
    private readonly localize;
    button: HTMLButtonElement | HTMLLinkElement;
    private hasFocus;
    invalid: boolean;
    title: string;
    /** The button's theme variant. */
    variant: 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text';
    /** The button's size. */
    size: 'small' | 'medium' | 'large';
    /** Draws the button with a caret. Used to indicate that the button triggers a dropdown menu or similar behavior. */
    caret: boolean;
    /** Disables the button. */
    disabled: boolean;
    /** Draws the button in a loading state. */
    loading: boolean;
    /** Draws an outlined button. */
    outline: boolean;
    /** Draws a pill-style button with rounded edges. */
    pill: boolean;
    /**
     * Draws a circular icon button. When this attribute is present, the button expects a single `<sl-icon>` in the
     * default slot.
     */
    circle: boolean;
    /**
     * The type of button. Note that the default value is `button` instead of `submit`, which is opposite of how native
     * `<button>` elements behave. When the type is `submit`, the button will submit the surrounding form.
     */
    type: 'button' | 'submit' | 'reset';
    /**
     * The name of the button, submitted as a name/value pair with form data, but only when this button is the submitter.
     * This attribute is ignored when `href` is present.
     */
    name: string;
    /**
     * The value of the button, submitted as a pair with the button's name as part of the form data, but only when this
     * button is the submitter. This attribute is ignored when `href` is present.
     */
    value: string;
    /** When set, the underlying button will be rendered as an `<a>` with this `href` instead of a `<button>`. */
    href: string;
    /** Tells the browser where to open the link. Only used when `href` is present. */
    target: '_blank' | '_parent' | '_self' | '_top';
    /**
     * When using `href`, this attribute will map to the underlying link's `rel` attribute. Unlike regular links, the
     * default is `noreferrer noopener` to prevent security exploits. However, if you're using `target` to point to a
     * specific tab/window, this will prevent that from working correctly. You can remove or change the default value by
     * setting the attribute to an empty string or a value of your choice, respectively.
     */
    rel: string;
    /** Tells the browser to download the linked file as this filename. Only used when `href` is present. */
    download?: string;
    /**
     * The "form owner" to associate the button with. If omitted, the closest containing form will be used instead. The
     * value of this attribute must be an id of a form in the same document or shadow root as the button.
     */
    form: string;
    /** Used to override the form owner's `action` attribute. */
    formAction: string;
    /** Used to override the form owner's `enctype` attribute.  */
    formEnctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    /** Used to override the form owner's `method` attribute.  */
    formMethod: 'post' | 'get';
    /** Used to override the form owner's `novalidate` attribute. */
    formNoValidate: boolean;
    /** Used to override the form owner's `target` attribute. */
    formTarget: '_self' | '_blank' | '_parent' | '_top' | string;
    /** Gets the validity state object */
    get validity(): ValidityState;
    /** Gets the validation message */
    get validationMessage(): string;
    firstUpdated(): void;
    private handleBlur;
    private handleFocus;
    private handleClick;
    private handleInvalid;
    private isButton;
    private isLink;
    handleDisabledChange(): void;
    /** Simulates a click on the button. */
    click(): void;
    /** Sets focus on the button. */
    focus(options?: FocusOptions): void;
    /** Removes focus from the button. */
    blur(): void;
    /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
    checkValidity(): boolean;
    /** Gets the associated form, if one exists. */
    getForm(): HTMLFormElement | null;
    /** Checks for validity and shows the browser's validation message if the control is invalid. */
    reportValidity(): boolean;
    /** Sets a custom validation message. Pass an empty string to restore validity. */
    setCustomValidity(message: string): void;
    render(): import("lit-html").TemplateResult;
}
