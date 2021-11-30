import {html, LitElement} from "lit";

class Page1 extends LitElement {
    render() {
        return html`<p>Page 1 :)</p>`
    }
}

customElements.define("page-1", Page1);
