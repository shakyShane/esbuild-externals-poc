import {html, LitElement} from "lit";

class Page2 extends LitElement {
    render() {
        return html`<p>Page 2 :)</p>`
    }
}

customElements.define("page-2", Page2);
