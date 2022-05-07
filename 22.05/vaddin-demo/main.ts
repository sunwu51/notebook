import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import {Router} from '@vaadin/router';
import './src/layout'
import './src/pages/index'
import './src/pages/search'

@customElement('w-main')
export class Main extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];

  pathes = ['/', '/search'];

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    const outlet = this.shadowRoot.getElementById('main')
    console.log(outlet)
    const router = new Router(outlet);

    router.setRoutes([
        {path: this.pathes[0], component: 'w-index'},
        {path: this.pathes[1], component: 'w-search'}
    ]);
  }

  render() {
    return html`
      <w-layout .pathes=${this.pathes}>
        <div id="main" style="height: 100%">
        </div>
      </w-layout>
    `;
  }
}
