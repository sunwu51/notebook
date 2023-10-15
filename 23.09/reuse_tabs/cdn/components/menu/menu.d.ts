import SlMenu from './menu.component.js';
export * from './menu.component.js';
export default SlMenu;
declare global {
    interface HTMLElementTagNameMap {
        'sl-menu': SlMenu;
    }
}
