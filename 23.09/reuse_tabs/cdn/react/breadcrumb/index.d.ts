import Component from '../../components/breadcrumb/breadcrumb.component.js';
/**
 * @summary Breadcrumbs provide a group of links so users can easily navigate a website's hierarchy.
 * @documentation https://shoelace.style/components/breadcrumb
 * @status stable
 * @since 2.0
 *
 * @slot - One or more breadcrumb items to display.
 * @slot separator - The separator to use between breadcrumb items. Works best with `<sl-icon>`.
 *
 * @dependency sl-icon
 *
 * @csspart base - The component's base wrapper.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {}>;
export default reactWrapper;
