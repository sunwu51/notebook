import ShoelaceElement from '../../internal/shoelace-element.js';
import SlIcon from '../icon/icon.component.js';
import type { CSSResultGroup } from 'lit';
/**
 * @summary Options define the selectable items within various form controls such as [select](/components/select).
 * @documentation https://shoelace.style/components/option
 * @status stable
 * @since 2.0
 *
 * @dependency sl-icon
 *
 * @slot - The option's label.
 * @slot prefix - Used to prepend an icon or similar element to the menu item.
 * @slot suffix - Used to append an icon or similar element to the menu item.
 *
 * @csspart checked-icon - The checked icon, an `<sl-icon>` element.
 * @csspart base - The component's base wrapper.
 * @csspart label - The option's label.
 * @csspart prefix - The container that wraps the prefix.
 * @csspart suffix - The container that wraps the suffix.
 */
export default class SlOption extends ShoelaceElement {
    static styles: CSSResultGroup;
    static dependencies: {
        'sl-icon': typeof SlIcon;
    };
    private cachedTextLabel;
    private readonly localize;
    defaultSlot: HTMLSlotElement;
    current: boolean;
    selected: boolean;
    hasHover: boolean;
    /**
     * The option's value. When selected, the containing form control will receive this value. The value must be unique
     * from other options in the same group. Values may not contain spaces, as spaces are used as delimiters when listing
     * multiple values.
     */
    value: string;
    /** Draws the option in a disabled state, preventing selection. */
    disabled: boolean;
    connectedCallback(): void;
    private handleDefaultSlotChange;
    private handleMouseEnter;
    private handleMouseLeave;
    handleDisabledChange(): void;
    handleSelectedChange(): void;
    handleValueChange(): void;
    /** Returns a plain text label based on the option's content. */
    getTextLabel(): string;
    render(): import("lit-html").TemplateResult<1>;
}
