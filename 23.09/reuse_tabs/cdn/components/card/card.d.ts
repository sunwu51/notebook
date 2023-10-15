import SlCard from './card.component.js';
export * from './card.component.js';
export default SlCard;
declare global {
    interface HTMLElementTagNameMap {
        'sl-card': SlCard;
    }
}
