import {html, LitElement} from "lit";
import {unsafeHTML} from "lit/directives/unsafe-html.js"

class Page1 extends LitElement {
    static properties = {
        count: { state: true, type: Number }
    }
    constructor() {
        super();
        this.count = 0;
    }
    click() {
        this.count++;
    }
    render() {
        return html`
            <p>Page 1 :) ${unsafeHTML("<span>oh no</span>")} 
            </p>
        <button @click=${this.click}>Count ${this.count}</button>
        `
    }
}

customElements.define("page-1", Page1);
