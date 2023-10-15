import Component from '../../components/option/option.component.js';
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
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {}>;
export default reactWrapper;
