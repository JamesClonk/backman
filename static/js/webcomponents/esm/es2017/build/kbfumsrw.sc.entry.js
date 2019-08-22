/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

class Dummy {
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-dummy"; }
    static get encapsulation() { return "shadow"; }
}

export { Dummy as SdxDummy };
