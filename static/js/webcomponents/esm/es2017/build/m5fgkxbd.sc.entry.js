/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList } from './chunk-c2033b1f.js';
import { a as createAndInstallStore, b as mapStateToProps } from './chunk-6a8011c5.js';
import { a as InputGroupActionTypes, b as inputGroupReducer } from './chunk-45c4a97b.js';

class InputGroup {
    constructor() {
        this.invokeChangeCallback = () => null;
        this.componentDidLoadComplete = false;
        this.type = "radio";
        this.name = "";
        this.inline = false;
        this.label = "";
    }
    typeChanged() {
        this.store.dispatch({ type: InputGroupActionTypes.setTypeState, typeState: this.type });
    }
    changeCallbackChanged() {
        this.setInvokeChangeCallback();
    }
    nameChanged() {
        this.dispatchNameAction();
    }
    inlineChanged() {
        this.store.dispatch({ type: InputGroupActionTypes.setInline, inline: this.inline });
    }
    selectedInputItemElsChanged() {
        if (this.componentDidLoadComplete) {
            this.invokeChangeCallback(this.getSelection());
        }
    }
    selectNextInputItemElFromChanged() {
        if (this.selectNextInputItemElFrom) {
            let nextEl = getNextFromList(this.inputItemElsSorted, this.selectNextInputItemElFrom);
            while (nextEl !== this.selectNextInputItemElFrom && nextEl.disabled) {
                nextEl = getNextFromList(this.inputItemElsSorted, nextEl);
            }
            this.store.dispatch({
                type: InputGroupActionTypes.selectInputItemEl,
                inputItemEl: nextEl
            });
        }
    }
    selectPreviousInputItemElFromChanged() {
        if (this.selectPreviousInputItemElFrom) {
            let prevEl = getPreviousFromList(this.inputItemElsSorted, this.selectPreviousInputItemElFrom);
            while (prevEl !== this.selectPreviousInputItemElFrom && prevEl.disabled) {
                prevEl = getPreviousFromList(this.inputItemElsSorted, prevEl);
            }
            this.store.dispatch({ type: InputGroupActionTypes.selectInputItemEl, inputItemEl: prevEl });
        }
    }
    getSelection() {
        return this.selectedInputItemEls.map((inputItemEl) => inputItemEl.value);
    }
    componentWillLoad() {
        this.setInvokeChangeCallback();
        this.store = createAndInstallStore(this, inputGroupReducer, this.getInitialState());
        this.unsubscribe = mapStateToProps(this, this.store, [
            "typeState",
            "selectedInputItemEls",
            "selectNextInputItemElFrom",
            "selectPreviousInputItemElFrom",
            "inputItemElsSorted"
        ]);
        this.store.dispatch({ type: InputGroupActionTypes.setTypeState, typeState: this.type });
    }
    componentDidLoad() {
        if (this.name) {
            this.dispatchNameAction();
        }
        this.store.dispatch({ type: InputGroupActionTypes.setInline, inline: this.inline });
        this.componentDidLoadComplete = true;
    }
    componentDidUnload() {
        this.unsubscribe();
    }
    getInitialState() {
        return {
            typeState: "radio",
            nameState: "",
            inline: false,
            selectedInputItemEls: [],
            selectNextInputItemElFrom: undefined,
            selectPreviousInputItemElFrom: undefined,
            inputItemElsSorted: []
        };
    }
    dispatchNameAction() {
        this.store.dispatch({
            type: InputGroupActionTypes.setNameState,
            nameState: this.name
        });
    }
    setInvokeChangeCallback() {
        this.invokeChangeCallback = parseFunction(this.changeCallback);
    }
    hostData() {
        return {
            role: this.typeState === "radio" ? "radiogroup" : null
        };
    }
    render() {
        return (h("div", { class: "wrapper" },
            this.label && h("label", null, this.label),
            h("slot", null)));
    }
    static get is() { return "sdx-input-group"; }
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
        "getSelection": {
            "method": true
        },
        "inline": {
            "type": Boolean,
            "attr": "inline",
            "watchCallbacks": ["inlineChanged"]
        },
        "inputItemElsSorted": {
            "state": true
        },
        "label": {
            "type": String,
            "attr": "label"
        },
        "name": {
            "type": String,
            "attr": "name",
            "watchCallbacks": ["nameChanged"]
        },
        "nameState": {
            "state": true
        },
        "selectedInputItemEls": {
            "state": true,
            "watchCallbacks": ["selectedInputItemElsChanged"]
        },
        "selectNextInputItemElFrom": {
            "state": true,
            "watchCallbacks": ["selectNextInputItemElFromChanged"]
        },
        "selectPreviousInputItemElFrom": {
            "state": true,
            "watchCallbacks": ["selectPreviousInputItemElFromChanged"]
        },
        "type": {
            "type": String,
            "attr": "type",
            "watchCallbacks": ["typeChanged"]
        },
        "typeState": {
            "state": true
        }
    }; }
    static get style() { return ".sc-sdx-input-group-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-input-group, .sc-sdx-input-group:after, .sc-sdx-input-group:before{-webkit-box-sizing:inherit;box-sizing:inherit}label.sc-sdx-input-group{display:block;margin-bottom:6px;cursor:text;color:#666;font-size:14px}"; }
}

export { InputGroup as SdxInputGroup };
