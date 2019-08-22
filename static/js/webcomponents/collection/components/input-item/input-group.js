import * as wcHelpers from "../../core/helpers/webcomponent-helpers";
import { createAndInstallStore, mapStateToProps } from "../../core/helpers/store-helpers";
import { InputGroupActionTypes, inputGroupReducer } from "./input-group-store";
export class InputGroup {
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
            let nextEl = wcHelpers.getNextFromList(this.inputItemElsSorted, this.selectNextInputItemElFrom);
            while (nextEl !== this.selectNextInputItemElFrom && nextEl.disabled) {
                nextEl = wcHelpers.getNextFromList(this.inputItemElsSorted, nextEl);
            }
            this.store.dispatch({
                type: InputGroupActionTypes.selectInputItemEl,
                inputItemEl: nextEl
            });
        }
    }
    selectPreviousInputItemElFromChanged() {
        if (this.selectPreviousInputItemElFrom) {
            let prevEl = wcHelpers.getPreviousFromList(this.inputItemElsSorted, this.selectPreviousInputItemElFrom);
            while (prevEl !== this.selectPreviousInputItemElFrom && prevEl.disabled) {
                prevEl = wcHelpers.getPreviousFromList(this.inputItemElsSorted, prevEl);
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
        this.invokeChangeCallback = wcHelpers.parseFunction(this.changeCallback);
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
    static get style() { return "/**style-placeholder:sdx-input-group:**/"; }
}
