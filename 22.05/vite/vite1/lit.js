import { LitElement, css, html } from 'lit';


class MyCounter extends LitElement {
  static styles = css`
    button { width: 100px; height: 100px }
  `
  
  static properties = {
    count : {type: Number}
  }

  constructor() {
    super();
    this.count = 0;
  }
  render() {
    return html`
      <button @click="${()=>this.count++}">${this.count}</button>
    `
  }
}
customElements.define('my-counter', MyCounter)

