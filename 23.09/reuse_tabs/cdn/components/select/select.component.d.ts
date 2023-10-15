import ShoelaceElement from '../../internal/shoelace-element.js';
import SlIcon from '../icon/icon.component.js';
import SlPopup from '../popup/popup.component.js';
import SlTag from '../tag/tag.component.js';
import type { CSSResultGroup, TemplateResult } from 'lit';
import type { ShoelaceFormControl } from '../../internal/shoelace-element.js';
import type SlOption from '../option/option.component.js';
/**
 * @summary Selects allow you to choose items from a menu of predefined options.
 * @documentation https://shoelace.style/components/select
 * @status stable
 * @since 2.0
 *
 * @dependency sl-icon
 * @dependency sl-popup
 * @dependency sl-tag
 *
 * @slot - The listbox options. Must be `<sl-option>` elements. You can use `<sl-divider>` to group items visually.
 * @slot label - The input's label. Alternatively, you can use the `label` attribute.
 * @slot prefix - Used to prepend a presentational icon or similar element to the combobox.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot expand-icon - The icon to show when the control is expanded and collapsed. Rotates on open and close.
 * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
 *
 * @event sl-change - Emitted when the control's value changes.
 * @event sl-clear - Emitted when the control's value is cleared.
 * @event sl-input - Emitted when the control receives input.
 * @event sl-focus - Emitted when the control gains focus.
 * @event sl-blur - Emitted when the control loses focus.
 * @event sl-show - Emitted when the select's menu opens.
 * @event sl-after-show - Emitted after the select's menu opens and all animations are complete.
 * @event sl-hide - Emitted when the select's menu closes.
 * @event sl-after-hide - Emitted after the select's menu closes and all animations are complete.
 * @event sl-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The select's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart combobox - The container the wraps the prefix, combobox, clear icon, and expand button.
 * @csspart prefix - The container that wraps the prefix slot.
 * @csspart display-input - The element that displays the selected option's label, an `<input>` element.
 * @csspart listbox - The listbox container where options are slotted.
 * @csspart tags - The container that houses option tags when `multiselect` is used.
 * @csspart tag - The individual tags that represent each multiselect option.
 * @csspart tag__base - The tag's base part.
 * @csspart tag__content - The tag's content part.
 * @csspart tag__remove-button - The tag's remove button.
 * @csspart tag__remove-button__base - The tag's remove button base part.
 * @csspart clear-button - The clear button.
 * @csspart expand-icon - The container that wraps the expand icon.
 */
export default class SlSelect extends ShoelaceElement implements ShoelaceFormControl {
    static styles: CSSResultGroup;
    static dependencies: {
        'sl-icon': typeof SlIcon;
        'sl-popup': typeof SlPopup;
        'sl-tag': typeof SlTag;
    };
    private readonly formControlController;
    private readonly hasSlotController;
    private readonly localize;
    private typeToSelectString;
    private typeToSelectTimeout;
    popup: SlPopup;
    combobox: HTMLSlotElement;
    displayInput: HTMLInputElement;
    valueInput: HTMLInputElement;
    listbox: HTMLSlotElement;
    private hasFocus;
    displayLabel: string;
    currentOption: SlOption;
    selectedOptions: SlOption[];
    /** The name of the select, submitted as a name/value pair with form data. */
    name: string;
    /**
     * The current value of the select, submitted as a name/value pair with form data. When `multiple` is enabled, the
     * value attribute will be a space-delimited list of values based on the options selected, and the value property will
     * be an array. **For this reason, values must not contain spaces.**
     */
    value: string | string[];
    /** The default value of the form control. Primarily used for resetting the form control. */
    defaultValue: string | string[];
    /** The select's size. */
    size: 'small' | 'medium' | 'large';
    /** Placeholder text to show as a hint when the select is empty. */
    placeholder: string;
    /** Allows more than one option to be selected. */
    multiple: boolean;
    /**
     * The maximum number of selected options to show when `multiple` is true. After the maximum, "+n" will be shown to
     * indicate the number of additional items that are selected. Set to 0 to remove the limit.
     */
    maxOptionsVisible: number;
    /** Disables the select control. */
    disabled: boolean;
    /** Adds a clear button when the select is not empty. */
    clearable: boolean;
    /**
     * Indicates whether or not the select is open. You can toggle this attribute to show and hide the menu, or you can
     * use the `show()` and `hide()` methods and this attribute will reflect the select's open state.
     */
    open: boolean;
    /**
     * Enable this option to prevent the listbox from being clipped when the component is placed inside a container with
     * `overflow: auto|scroll`. Hoisting uses a fixed positioning strategy that works in many, but not all, scenarios.
     */
    hoist: boolean;
    /** Draws a filled select. */
    filled: boolean;
    /** Draws a pill-style select with rounded edges. */
    pill: boolean;
    /** The select's label. If you need to display HTML, use the `label` slot instead. */
    label: string;
    /**
     * The preferred placement of the select's menu. Note that the actual placement may vary as needed to keep the listbox
     * inside of the viewport.
     */
    placement: 'top' | 'bottom';
    /** The select's help text. If you need to display HTML, use the `help-text` slot instead. */
    helpText: string;
    /**
     * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
     * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
     * the same document or shadow root for this to work.
     */
    form: string;
    /** The select's required attribute. */
    required: boolean;
    /**
     * A function that customizes the tags to be rendered when multiple=true. The first argument is the option, the second
     * is the current tag's index.  The function should return either a Lit TemplateResult or a string containing trusted HTML of the symbol to render at
     * the specified value.
     */
    getTag: (option: SlOption, index: number) => TemplateResult | string | HTMLElement;
    /** Gets the validity state object */
    get validity(): ValidityState;
    /** Gets the validation message */
    get validationMessage(): string;
    connectedCallback(): void;
    private addOpenListeners;
    private removeOpenListeners;
    private handleFocus;
    private handleBlur;
    private handleDocumentFocusIn;
    private handleDocumentKeyDown;
    private handleDocumentMouseDown;
    private handleLabelClick;
    private handleComboboxMouseDown;
    private handleComboboxKeyDown;
    private handleClearClick;
    private handleClearMouseDown;
    private handleOptionClick;
    private handleDefaultSlotChange;
    private handleTagRemove;
    private getAllOptions;
    private getFirstOption;
    private setCurrentOption;
    private setSelectedOptions;
    private toggleOptionSelection;
    private selectionChanged;
    protected get tags(): TemplateResult<1>[];
    private handleInvalid;
    handleDisabledChange(): void;
    handleValueChange(): void;
    handleOpenChange(): Promise<void>;
    /** Shows the listbox. */
    show(): Promise<void>;
    /** Hides the listbox. */
    hide(): Promise<void>;
    /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
    checkValidity(): boolean;
    /** Gets the associated form, if one exists. */
    getForm(): HTMLFormElement | null;
    /** Checks for validity and shows the browser's validation message if the control is invalid. */
    reportValidity(): boolean;
    /** Sets a custom validation message. Pass an empty string to restore validity. */
    setCustomValidity(message: string): void;
    /** Sets focus on the control. */
    focus(options?: FocusOptions): void;
    /** Removes focus from the control. */
    blur(): void;
    render(): TemplateResult<1>;
}
