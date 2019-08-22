import * as wcHelpers from "../../core/helpers/webcomponent-helpers";
export class Input {
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
        this.invokeHitEnterCallback = wcHelpers.parseFunction(this.hitEnterCallback);
    }
    setInvokeChangeCallback() {
        this.invokeChangeCallback = wcHelpers.parseFunction(this.changeCallback);
    }
    setInvokeInputCallback() {
        this.invokeInputCallback = wcHelpers.parseFunction(this.inputCallback);
    }
    setInvokeFocusCallback() {
        this.invokeFocusCallback = wcHelpers.parseFunction(this.focusCallback);
    }
    setInvokeBlurCallback() {
        this.invokeBlurCallback = wcHelpers.parseFunction(this.blurCallback);
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
    static get style() { return "/**style-placeholder:sdx-input:**/"; }
}
