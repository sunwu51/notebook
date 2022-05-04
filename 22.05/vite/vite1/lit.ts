import {customElement, property} from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';
import './main.scss'

@customElement('my-counter')
export class MyCounter extends LitElement {
  static styles = css`
    .btn { width: 100px; height: 100px }
  `
  
  @property({type: Number}) count = 0;

  // createRenderRoot() {
  //   return this;
  // }

  // 全局的css在shadow内不生效，通过上面createRenderRoot方法，return this可以不创建shadow的方式，使得css生效
  render() {
    return html`
    <div class="a">
      <button @click="${()=>this.count++}" class="b btn">${this.count}</button>
    </div>
    `
  }
}

