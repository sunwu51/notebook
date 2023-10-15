import SlAlert from './alert.component.js';
export * from './alert.component.js';
export default SlAlert;
declare global {
    interface HTMLElementTagNameMap {
        'sl-alert': SlAlert;
    }
}
