/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

var SelectActionTypes;
(function (SelectActionTypes) {
    SelectActionTypes["setSelectionBatch"] = "SET_SELECTION_BATCH";
    SelectActionTypes["select"] = "SELECT";
    SelectActionTypes["commitSelectionBatch"] = "COMMIT_SELECTION_BATCH";
    SelectActionTypes["setMultiple"] = "SET_MULTIPLE";
    SelectActionTypes["setDirection"] = "SET_DIRECTION";
    SelectActionTypes["setSelect"] = "SET_SELECT";
    SelectActionTypes["setAnimationDuration"] = "SET_ANIMATION_DURATION";
    SelectActionTypes["toggleOptionEl"] = "TOGGLE_OPTION_EL";
    SelectActionTypes["commitOptionElsBatch"] = "COMMIT_OPTION_ELS_BATCH";
    SelectActionTypes["toggleOptGroupEl"] = "TOGGLE_OPTGROUP_EL";
    SelectActionTypes["commitOptGroupElsBatch"] = "COMMIT_OPTGROUP_ELS_BATCH";
    SelectActionTypes["setFilter"] = "SET_FILTER";
    SelectActionTypes["setFilterFunction"] = "SET_FILTER_FUNCTION";
})(SelectActionTypes || (SelectActionTypes = {}));
const selectReducer = (state = {}, action) => {
    switch (action.type) {
        case SelectActionTypes.setSelectionBatch:
            return Object.assign({}, state, { selectionBatch: action.optionEls });
        case SelectActionTypes.commitSelectionBatch:
            let selectionSorted = state.selectionSorted;
            if (state.selection !== state.selectionBatch) {
                selectionSorted = state.selectionBatch.concat().sort((a, b) => {
                    const aIndex = state.optionElsSorted.indexOf(a);
                    const bIndex = state.optionElsSorted.indexOf(b);
                    if (aIndex > bIndex) {
                        return 1;
                    }
                    if (aIndex < bIndex) {
                        return -1;
                    }
                    return 0;
                });
            }
            return Object.assign({}, state, { selection: state.selectionBatch, selectionSorted });
        case SelectActionTypes.select:
            let selectionBatch = state.selectionBatch;
            if (action.optionEl) {
                if (state.multiple) {
                    const selectionIndex = selectionBatch.indexOf(action.optionEl);
                    const alreadySelected = selectionIndex > -1;
                    if (alreadySelected || action.strategy === "remove") {
                        selectionBatch = selectionBatch.filter((optionElFromSelection) => optionElFromSelection !== action.optionEl);
                    }
                    else {
                        selectionBatch = selectionBatch.concat(action.optionEl);
                    }
                }
                else {
                    const alreadySelected = selectionBatch[0] === action.optionEl;
                    if (alreadySelected) {
                        if (action.strategy === "remove") {
                            selectionBatch = [];
                        }
                    }
                    else {
                        if (action.strategy === "add") {
                            selectionBatch = [action.optionEl];
                        }
                    }
                }
            }
            else {
                if (selectionBatch.length) {
                    selectionBatch = [];
                }
            }
            return Object.assign({}, state, { selectionBatch });
        case SelectActionTypes.setMultiple:
            return Object.assign({}, state, { multiple: action.multiple });
        case SelectActionTypes.setDirection:
            return Object.assign({}, state, { direction: action.direction });
        case SelectActionTypes.setSelect:
            return Object.assign({}, state, { select: action.select });
        case SelectActionTypes.setAnimationDuration:
            return Object.assign({}, state, { animationDuration: action.animationDuration });
        case SelectActionTypes.toggleOptionEl:
            if (state.optionElsBatch.indexOf(action.optionEl) === -1) {
                return Object.assign({}, state, { optionElsBatch: [...state.optionElsBatch, action.optionEl] });
            }
            return Object.assign({}, state, { optionElsBatch: state.optionElsBatch.filter((optionEl) => optionEl !== action.optionEl) });
        case SelectActionTypes.toggleOptGroupEl:
            if (state.optgroupElsBatch.indexOf(action.optgroupEl) === -1) {
                return Object.assign({}, state, { optgroupElsBatch: [...state.optgroupElsBatch, action.optgroupEl] });
            }
            return Object.assign({}, state, { optgroupElsBatch: state.optgroupElsBatch.filter((optgroupEl) => optgroupEl !== action.optgroupEl) });
        case SelectActionTypes.commitOptionElsBatch:
            let optionsSorted = state.optionElsSorted;
            if (state.optionEls !== state.optionElsBatch) {
                optionsSorted = state.optionElsBatch.concat().sort((a, b) => {
                    const position = a.compareDocumentPosition(b);
                    return ((position <= Node.DOCUMENT_POSITION_PRECEDING) ? -1 : ((position <= Node.DOCUMENT_POSITION_FOLLOWING) ? 1 : 0));
                }).reverse();
            }
            return Object.assign({}, state, { optionEls: state.optionElsBatch, optionElsSorted: optionsSorted });
        case SelectActionTypes.commitOptGroupElsBatch:
            return Object.assign({}, state, { optgroupEls: state.optgroupElsBatch });
        case SelectActionTypes.setFilter:
            return Object.assign({}, state, { filter: action.filter });
        case SelectActionTypes.setFilterFunction:
            return Object.assign({}, state, { filterFunction: action.filterFunction });
        default:
            return state;
    }
};

export { selectReducer as a, SelectActionTypes as b };
