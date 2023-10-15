import ShoelaceElement from '../../internal/shoelace-element.js';
import SlMenuItem from '../menu-item/menu-item.component.js';
import type { CSSResultGroup } from 'lit';
export interface MenuSelectEventDetail {
    item: SlMenuItem;
}
/**
 * @summary Menus provide a list of options for the user to choose from.
 * @documentation https://shoelace.style/components/menu
 * @status stable
 * @since 2.0
 *
 * @slot - The menu's content, including menu items, menu labels, and dividers.
 *
 * @event {{ item: SlMenuItem }} sl-select - Emitted when a menu item is selected.
 */
export default class SlMenu extends ShoelaceElement {
    static styles: CSSResultGroup;
    defaultSlot: HTMLSlotElement;
    connectedCallback(): void;
    private handleClick;
    private handleKeyDown;
    private handleMouseDown;
    private handleSlotChange;
    private isMenuItem;
    /** @internal Gets all slotted menu items, ignoring dividers, headers, and other elements. */
    getAllItems(): SlMenuItem[];
    /**
     * @internal Gets the current menu item, which is the menu item that has `tabindex="0"` within the roving tab index.
     * The menu item may or may not have focus, but for keyboard interaction purposes it's considered the "active" item.
     */
    getCurrentItem(): SlMenuItem | undefined;
    /**
     * @internal Sets the current menu item to the specified element. This sets `tabindex="0"` on the target element and
     * `tabindex="-1"` to all other items. This method must be called prior to setting focus on a menu item.
     */
    setCurrentItem(item: SlMenuItem): void;
    render(): import("lit-html").TemplateResult<1>;
}
