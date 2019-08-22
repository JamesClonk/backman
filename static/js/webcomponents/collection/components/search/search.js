import * as wcHelpers from "../../core/helpers/webcomponent-helpers";
import { isDesktopOrLarger } from "../../core/helpers/breakpoint-helpers";
export class Search {
    constructor() {
        this.invokeSearchSubmitCallback = () => null;
        this.invokeValueChangeCallback = () => null;
        this.invokeChangeCallback = () => null;
        this.inputValue = "";
        this.placeholder = "";
        this.srHint = "";
        this.srHintForButton = "";
    }
    searchSubmitCallbackChanged() {
        this.setInvokeSearchSubmitCallback();
    }
    valueChangeCallbackChanged() {
        this.setInvokeValueChangeCallback();
    }
    changeCallbackChanged() {
        this.setInvokeChangeCallback();
    }
    onWindowResizeThrottled() {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(() => {
            this.el.forceUpdate();
        }, 10);
    }
    componentWillLoad() {
        this.setInvokeSearchSubmitCallback();
        this.setInvokeValueChangeCallback();
    }
    submitSearch() {
        if (this.sdxInputEl) {
            this.invokeSearchSubmitCallback(this.sdxInputEl.getValue());
        }
    }
    changeHandler(value) {
        this.inputValue = value;
        this.invokeValueChangeCallback(value);
        this.invokeChangeCallback(value);
    }
    setInvokeSearchSubmitCallback() {
        this.invokeSearchSubmitCallback = wcHelpers.parseFunction(this.searchSubmitCallback);
    }
    setInvokeValueChangeCallback() {
        this.invokeValueChangeCallback = wcHelpers.parseFunction(this.valueChangeCallback);
    }
    setInvokeChangeCallback() {
        this.invokeChangeCallback = wcHelpers.parseFunction(this.changeCallback);
    }
    showSearchIcon() {
        return isDesktopOrLarger() || !this.inputValue.length;
    }
    render() {
        return (h("div", { class: "wrapper" },
            h("sdx-input", { id: "searchField", srHint: this.srHint, clearable: !isDesktopOrLarger(), type: "search", placeholder: this.placeholder, hitEnterCallback: () => this.submitSearch(), changeCallback: (value) => this.changeHandler(value), ref: (el) => this.sdxInputEl = el, role: "search", inputStyle: {
                    paddingRight: this.showSearchIcon() ? "64px" : "0px"
                } }),
            h("sdx-button", { theme: "transparent", "sr-hint": this.srHintForButton, onClick: () => this.submitSearch() },
                h("sdx-icon", { iconName: "icon-077-search", size: 3, flip: "horizontal", hidden: !this.showSearchIcon(), "aria-hidden": "true" }))));
    }
    static get is() { return "sdx-search"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "changeCallback": {
            "type": String,
            "attr": "change-callback",
            "watchCallbacks": ["changeCallbackChanged"]
        },
        "el": {
            "elementRef": true
        },
        "inputValue": {
            "state": true
        },
        "placeholder": {
            "type": String,
            "attr": "placeholder"
        },
        "searchSubmitCallback": {
            "type": String,
            "attr": "search-submit-callback",
            "watchCallbacks": ["searchSubmitCallbackChanged"]
        },
        "srHint": {
            "type": String,
            "attr": "sr-hint"
        },
        "srHintForButton": {
            "type": String,
            "attr": "sr-hint-for-button"
        },
        "valueChangeCallback": {
            "type": String,
            "attr": "value-change-callback",
            "watchCallbacks": ["valueChangeCallbackChanged"]
        }
    }; }
    static get listeners() { return [{
            "name": "window:resize",
            "method": "onWindowResizeThrottled",
            "passive": true
        }]; }
    static get style() { return "/**style-placeholder:sdx-search:**/"; }
}
