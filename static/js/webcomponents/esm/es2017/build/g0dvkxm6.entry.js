/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList } from './chunk-c2033b1f.js';

class Input {
    constructor() {
        this.invokeHitEnterCallback = () => null;
        this.invokeChangeCallback = () => null;
        this.invokeInputCallback = () => null;
        this.invokeFocusCallback = () => null;
        this.invokeBlurCallback = () => null;
        this.id = "";
        this.srHint = "";
        this.placeholder = "";
        this.type = "text";
        this.value = "";
        this.clearable = false;
        this.selectTextOnFocus = false;
        this.inputStyle = {};
        this.autocomplete = true;
        this.editable = true;
        this.valueState = "";
    }
    valueChanged() {
        this.valueState = this.value;
    }
    hitEnterCallbackChanged() {
        this.setInvokeHitEnterCallback();
    }
    changeCallbackChanged() {
        this.setInvokeChangeCallback();
    }
    inputCallbackChanged() {
        this.setInvokeInputCallback();
    }
    focusCallbackChanged() {
        this.setInvokeFocusCallback();
    }
    blurCallbackChanged() {
        this.setInvokeBlurCallback();
    }
    valueStateChanged() {
        this.invokeChangeCallback(this.valueState);
    }
    getValue() {
        return this.valueState;
    }
    setFocus() {
        this.inputEl.focus();
    }
    unsetFocus() {
        this.inputEl.blur();
    }
    componentWillLoad() {
        this.setInvokeHitEnterCallback();
        this.setInvokeChangeCallback();
        this.setInvokeInputCallback();
        this.valueState = this.value;
    }
    onFocus() {
        if (this.selectTextOnFocus) {
            this.selectText();
        }
    }
    resetInput() {
        this.valueState = "";
        this.invokeChangeCallback(this.valueState);
    }
    onInputKeyPress(e) {
        if (e.which === 13) {
            this.invokeHitEnterCallback();
            return;
        }
    }
    onInputInput(e) {
        this.valueState = e.target.value;
        this.invokeInputCallback(this.valueState);
    }
    setInvokeHitEnterCallback() {
        this.invokeHitEnterCallback = parseFunction(this.hitEnterCallback);
    }
    setInvokeChangeCallback() {
        this.invokeChangeCallback = parseFunction(this.changeCallback);
    }
    setInvokeInputCallback() {
        this.invokeInputCallback = parseFunction(this.inputCallback);
    }
    setInvokeFocusCallback() {
        this.invokeFocusCallback = parseFunction(this.focusCallback);
    }
    setInvokeBlurCallback() {
        this.invokeBlurCallback = parseFunction(this.blurCallback);
    }
    onInputFocus() {
        this.invokeFocusCallback();
    }
    onInputBlur() {
        this.invokeBlurCallback();
    }
    selectText() {
        setTimeout(() => {
            this.inputEl.setSelectionRange(0, this.inputEl.value.length);
        });
    }
    render() {
        return (h("div", { class: "wrapper" },
            h("label", { htmlFor: this.id, class: "sr-only" }, this.srHint),
            this.editable &&
                h("input", { id: this.id, class: "input", type: this.type, placeholder: `${this.placeholder}`, onInput: (e) => this.onInputInput(e), onKeyPress: (e) => this.onInputKeyPress(e), value: this.valueState, ref: (el) => this.inputEl = el, style: this.inputStyle, onFocus: () => this.onInputFocus(), onBlur: () => this.onInputBlur(), autoComplete: this.autocomplete ? undefined : "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: false }),
            this.editable && this.clearable &&
                h("sdx-icon", { iconName: "icon-202-clear-circle", onClick: () => this.resetInput(), colorClass: "navy", hidden: !this.valueState }),
            !this.editable &&
                h("div", { class: "input", style: this.inputStyle, tabIndex: 0 },
                    h("sdx-text-truncate", null, this.valueState))));
    }
    static get is() { return "sdx-input"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "autocomplete": {
            "type": Boolean,
            "attr": "autocomplete"
        },
        "blurCallback": {
            "type": String,
            "attr": "blur-callback",
            "watchCallbacks": ["blurCallbackChanged"]
        },
        "changeCallback": {
            "type": String,
            "attr": "change-callback",
            "watchCallbacks": ["changeCallbackChanged"]
        },
        "clearable": {
            "type": Boolean,
            "attr": "clearable"
        },
        "editable": {
            "type": Boolean,
            "attr": "editable"
        },
        "el": {
            "elementRef": true
        },
        "focusCallback": {
            "type": String,
            "attr": "focus-callback",
            "watchCallbacks": ["focusCallbackChanged"]
        },
        "getValue": {
            "method": true
        },
        "hitEnterCallback": {
            "type": String,
            "attr": "hit-enter-callback",
            "watchCallbacks": ["hitEnterCallbackChanged"]
        },
        "id": {
            "type": String,
            "attr": "id"
        },
        "inputCallback": {
            "type": String,
            "attr": "input-callback",
            "watchCallbacks": ["inputCallbackChanged"]
        },
        "inputStyle": {
            "type": "Any",
            "attr": "input-style"
        },
        "placeholder": {
            "type": String,
            "attr": "placeholder"
        },
        "selectTextOnFocus": {
            "type": Boolean,
            "attr": "select-text-on-focus"
        },
        "setFocus": {
            "method": true
        },
        "srHint": {
            "type": String,
            "attr": "sr-hint"
        },
        "type": {
            "type": String,
            "attr": "type"
        },
        "unsetFocus": {
            "method": true
        },
        "value": {
            "type": String,
            "attr": "value",
            "watchCallbacks": ["valueChanged"]
        },
        "valueState": {
            "state": true,
            "watchCallbacks": ["valueStateChanged"]
        }
    }; }
    static get listeners() { return [{
            "name": "focus",
            "method": "onFocus",
            "capture": true
        }]; }
    static get style() { return "\@charset \"UTF-8\";:host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.sr-only-focusable:active,.sr-only-focusable:focus{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}:host{width:100%}:host .wrapper{display:-ms-flexbox;display:flex;position:relative;width:100%}:host .wrapper>sdx-icon{position:absolute;right:10px;top:2px;padding:10px;cursor:pointer}:host .wrapper .input{border:1px solid #d6d6d6;border-radius:5px;height:48px;padding:0 16px;line-height:24px;letter-spacing:-.1px;font:inherit;font-size:18px;font-weight:300;position:relative;outline:none;background-color:#fff;width:100%;color:#333;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-appearance:none;-moz-appearance:none;appearance:none;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}:host .wrapper .input,:host .wrapper .input::-webkit-input-placeholder{-webkit-transition:all .15s cubic-bezier(.4,0,.2,1);transition:all .15s cubic-bezier(.4,0,.2,1)}:host .wrapper .input,:host .wrapper .input:-ms-input-placeholder{-webkit-transition:all .15s cubic-bezier(.4,0,.2,1);transition:all .15s cubic-bezier(.4,0,.2,1)}:host .wrapper .input,:host .wrapper .input::-ms-input-placeholder{-webkit-transition:all .15s cubic-bezier(.4,0,.2,1);transition:all .15s cubic-bezier(.4,0,.2,1)}:host .wrapper .input,:host .wrapper .input::placeholder{-webkit-transition:all .15s cubic-bezier(.4,0,.2,1);transition:all .15s cubic-bezier(.4,0,.2,1)}:host .wrapper .input::-webkit-input-placeholder{opacity:1;color:#bbb}:host .wrapper .input:-ms-input-placeholder{opacity:1;color:#bbb}:host .wrapper .input::-ms-input-placeholder{opacity:1;color:#bbb}:host .wrapper .input::placeholder{opacity:1;color:#bbb}:host .wrapper .input[type=search]{-webkit-appearance:none}:host .wrapper .input[type=search]::-webkit-search-cancel-button,:host .wrapper .input[type=search]::-webkit-search-decoration{-webkit-appearance:none}:host .wrapper .input[type=search]::-ms-clear{display:none}:host .wrapper .input:focus:not([readonly]){border-color:#1781e3;color:#333}:host .wrapper .input:focus:not([readonly])::-webkit-input-placeholder{opacity:0}:host .wrapper .input:focus:not([readonly]):-ms-input-placeholder{opacity:0}:host .wrapper .input:focus:not([readonly])::-ms-input-placeholder{opacity:0}:host .wrapper .input:focus:not([readonly])::placeholder{opacity:0}"; }
}

export { Input as SdxInput };
