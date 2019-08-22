/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

var InputGroupActionTypes;
(function (InputGroupActionTypes) {
    InputGroupActionTypes["setTypeState"] = "SET_INPUT_TYPE";
    InputGroupActionTypes["setNameState"] = "SET_INPUT_NAME";
    InputGroupActionTypes["setInline"] = "SET_INLINE";
    InputGroupActionTypes["selectInputItemEl"] = "SELECT_INPUT_ITEM_EL";
    InputGroupActionTypes["selectNextInputItemEl"] = "SELECT_NEXT_INPUT_ITEM_EL";
    InputGroupActionTypes["selectPreviousInputItemEl"] = "SELECT_PREVIOUS_INPUT_ITEM_EL";
    InputGroupActionTypes["registerInputItemEl"] = "REGISTER_INPUT_ITEM_EL";
    InputGroupActionTypes["unregisterInputItemEl"] = "UNREGISTER_INPUT_ITEM_EL";
})(InputGroupActionTypes || (InputGroupActionTypes = {}));
const inputGroupReducer = (state = {}, action) => {
    switch (action.type) {
        case InputGroupActionTypes.setTypeState:
            return Object.assign({}, state, { typeState: action.typeState });
        case InputGroupActionTypes.setNameState:
            return Object.assign({}, state, { nameState: action.nameState });
        case InputGroupActionTypes.setInline:
            return Object.assign({}, state, { inline: action.inline });
        case InputGroupActionTypes.selectInputItemEl:
            let selectedInputItemEls = state.selectedInputItemEls;
            if (state.typeState === "radio") {
                const alreadySelected = state.selectedInputItemEls[0] === action.inputItemEl;
                if (!alreadySelected) {
                    selectedInputItemEls = [action.inputItemEl];
                }
            }
            else {
                const selectionIndex = state.selectedInputItemEls.indexOf(action.inputItemEl);
                const alreadySelected = selectionIndex > -1;
                if (alreadySelected) {
                    selectedInputItemEls = selectedInputItemEls.filter((inputItemElFromSelection) => inputItemElFromSelection !== action.inputItemEl);
                }
                else {
                    selectedInputItemEls = selectedInputItemEls.concat(action.inputItemEl);
                }
            }
            return Object.assign({}, state, { selectedInputItemEls, selectNextInputItemElFrom: undefined, selectPreviousInputItemElFrom: undefined });
        case InputGroupActionTypes.selectNextInputItemEl:
            return Object.assign({}, state, { selectNextInputItemElFrom: action.currentSelectedInputItemEl, selectPreviousInputItemElFrom: undefined });
        case InputGroupActionTypes.selectPreviousInputItemEl:
            return Object.assign({}, state, { selectNextInputItemElFrom: undefined, selectPreviousInputItemElFrom: action.currentSelectedInputItemEl });
        case InputGroupActionTypes.registerInputItemEl:
            state.inputItemElsSorted.push(action.inputItemEl);
            state.inputItemElsSorted.sort((a, b) => {
                const position = a.compareDocumentPosition(b);
                return ((position > Node.DOCUMENT_POSITION_PRECEDING) ? -1 : ((position > Node.DOCUMENT_POSITION_FOLLOWING) ? 1 : 0));
            });
            return state;
        case InputGroupActionTypes.unregisterInputItemEl:
            const deleteIndex = state.inputItemElsSorted.indexOf(action.inputItemEl);
            if (deleteIndex >= 0) {
                state.inputItemElsSorted.splice(deleteIndex, 1);
            }
            return state;
        default:
            return state;
    }
};

export { InputGroupActionTypes as a, inputGroupReducer as b };
