import {html, render} from '../../node_modules/lit-html/lit-html.js';
import {effect, isReactive, reactive} from '../../node_modules/@vue/reactivity/dist/reactivity.cjs.prod.js';

export default class BaseHTMLElement extends HTMLElement {
  html = html;

  connectedCallback() {
    if (isReactive(this.state)) {
      this.state = reactive(this.state) || {};
    }
    effect(() => {
      const content = this.render();
      render(content, this);
    });
  }
}
