import { Reducer } from "redux";
import { Type } from "./types";
export declare enum InputGroupActionTypes {
    setTypeState = "SET_INPUT_TYPE",
    setNameState = "SET_INPUT_NAME",
    setInline = "SET_INLINE",
    selectInputItemEl = "SELECT_INPUT_ITEM_EL",
    selectNextInputItemEl = "SELECT_NEXT_INPUT_ITEM_EL",
    selectPreviousInputItemEl = "SELECT_PREVIOUS_INPUT_ITEM_EL",
    registerInputItemEl = "REGISTER_INPUT_ITEM_EL",
    unregisterInputItemEl = "UNREGISTER_INPUT_ITEM_EL"
}
export interface InputGroupState {
    typeState: Type;
    nameState: string;
    inline: boolean;
    selectedInputItemEls: HTMLSdxInputItemElement[];
    selectNextInputItemElFrom: HTMLSdxInputItemElement | undefined;
    selectPreviousInputItemElFrom: HTMLSdxInputItemElement | undefined;
    inputItemElsSorted: HTMLSdxInputItemElement[];
}
export interface SetTypeStateAction {
    type: InputGroupActionTypes.setTypeState;
    typeState: InputGroupState["typeState"];
}
export interface SetNameStateAction {
    type: InputGroupActionTypes.setNameState;
    nameState: InputGroupState["nameState"];
}
export interface SetInlineAction {
    type: InputGroupActionTypes.setInline;
    inline: InputGroupState["inline"];
}
export interface SelectInputItemElAction {
    type: InputGroupActionTypes.selectInputItemEl;
    inputItemEl: HTMLSdxInputItemElement;
}
export interface SelectNextInputItemElAction {
    type: InputGroupActionTypes.selectNextInputItemEl;
    currentSelectedInputItemEl: HTMLSdxInputItemElement;
}
export interface SelectPreviousInputItemElAction {
    type: InputGroupActionTypes.selectPreviousInputItemEl;
    currentSelectedInputItemEl: HTMLSdxInputItemElement;
}
export interface RegisterInputItemElAction {
    type: InputGroupActionTypes.registerInputItemEl;
    inputItemEl: HTMLSdxInputItemElement;
}
export interface UnregisterInputItemElAction {
    type: InputGroupActionTypes.unregisterInputItemEl;
    inputItemEl: HTMLSdxInputItemElement;
}
export declare type InputGroupActions = SetTypeStateAction | SetNameStateAction | SetInlineAction | SelectInputItemElAction | SelectNextInputItemElAction | SelectPreviousInputItemElAction | RegisterInputItemElAction | UnregisterInputItemElAction;
export declare const inputGroupReducer: Reducer<InputGroupState, InputGroupActions>;
