/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList, i as isDesktopOrLarger } from './chunk-c2033b1f.js';

class Search {
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
        this.invokeSearchSubmitCallback = parseFunction(this.searchSubmitCallback);
    }
    setInvokeValueChangeCallback() {
        this.invokeValueChangeCallback = parseFunction(this.valueChangeCallback);
    }
    setInvokeChangeCallback() {
        this.invokeChangeCallback = parseFunction(this.changeCallback);
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
    static get style() { return "\@charset \"UTF-8\";:host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.sr-only-focusable:active,.sr-only-focusable:focus{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}.wrapper{position:relative}.wrapper>sdx-button{padding:6px;position:absolute;right:5px;top:2px}"; }
}

export { Search as SdxSearch };
