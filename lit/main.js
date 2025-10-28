import {html, render} from '../node_modules/lit-html/lit-html.js';

let count = 0;

const app = document.querySelector('#app');

function doRender() {
  const template = html`<h1>${count}</h1>`;
  render(template, app);
}

setInterval(() => {
  count++;
  doRender();
}, 1000);
