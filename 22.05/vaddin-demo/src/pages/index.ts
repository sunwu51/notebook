import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import 'wired-elements/lib/wired-card.js';

@customElement('w-index')
export class Index extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];

  render() {
    return html`<div>
    <h1>2022/05/01-2022/05/07</h1>
    <!-- <vaadin-button theme="primary">vad</vaadin-button> -->
    <wired-card elevation="5" style="margin: 10px">
      <div style="padding: 10px 20px;">
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
      </div>
    </wired-card>
    <wired-card elevation="5" style="margin: 10px">
      <div style="padding: 10px 20px;">
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
      </div>
    </wired-card>
    <wired-card elevation="5" style="margin: 10px">
      <div style="padding: 10px 20px;">
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
      </div>
    </wired-card>
    <wired-card elevation="5" style="margin: 10px">
      <div style="padding: 10px 20px;">
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
      </div>
    </wired-card>
    <wired-card elevation="5" style="margin: 10px">
      <div style="padding: 10px 20px;">
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
      </div>
    </wired-card>
    <wired-card elevation="5" style="margin: 10px">
      <div style="padding: 10px 20px;">
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
      </div>
    </wired-card>
    <wired-card elevation="5" style="margin: 10px">
      <div style="padding: 10px 20px;">
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3 Elevation: 3</p>
      </div>
    </wired-card>
    <wired-card elevation="5" style="margin: 10px">
      <div style="padding: 10px 20px;">
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
        <p>Elevation: 3 Elevation: 3 Elevation: 3</p>
      </div>
    </wired-card>
    <!-- <div style="height:400px; background: green; display: flex; flex-direction: column; justify-content: end;">
      <span style="color: gray;">span</span>
    </div> -->
  </div>`;
  }
}
