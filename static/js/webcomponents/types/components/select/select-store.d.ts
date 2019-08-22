import { Reducer } from "redux";
import { Selection, SelectDirection } from "./types";
import { SelectOption } from "./select-option/select-option";
export declare type SelectionBatchStrategy = "add" | "remove";
export interface SelectState {
    selection: Selection;
    selectionBatch: Selection;
    selectionSorted: Selection;
    multiple: boolean;
    direction: SelectDirection;
    select: (option: SelectOption, strategy: SelectionBatchStrategy, close?: boolean) => void;
    animationDuration: number;
    optionEls: HTMLSdxSelectOptionElement[];
    optionElsBatch: HTMLSdxSelectOptionElement[];
    optionElsSorted: HTMLSdxSelectOptionElement[];
    optgroupEls: HTMLSdxSelectOptgroupElement[];
    optgroupElsBatch: HTMLSdxSelectOptgroupElement[];
    filter: string;
    filterFunction: (optionEl: HTMLSdxSelectOptionElement, keyword: string) => boolean;
}
export declare enum SelectActionTypes {
    setSelectionBatch = "SET_SELECTION_BATCH",
    select = "SELECT",
    commitSelectionBatch = "COMMIT_SELECTION_BATCH",
    setMultiple = "SET_MULTIPLE",
    setDirection = "SET_DIRECTION",
    setSelect = "SET_SELECT",
    setAnimationDuration = "SET_ANIMATION_DURATION",
    toggleOptionEl = "TOGGLE_OPTION_EL",
    commitOptionElsBatch = "COMMIT_OPTION_ELS_BATCH",
    toggleOptGroupEl = "TOGGLE_OPTGROUP_EL",
    commitOptGroupElsBatch = "COMMIT_OPTGROUP_ELS_BATCH",
    setFilter = "SET_FILTER",
    setFilterFunction = "SET_FILTER_FUNCTION"
}
export interface SetSelectionBatchAction {
    type: SelectActionTypes.setSelectionBatch;
    optionEls: SelectState["selection"];
}
export interface SelectAction {
    type: SelectActionTypes.select;
    optionEl: HTMLSdxSelectOptionElement | null;
    strategy: SelectionBatchStrategy;
}
export interface CommitSelectionBatchAction {
    type: SelectActionTypes.commitSelectionBatch;
}
export interface SetMultipleAction {
    type: SelectActionTypes.setMultiple;
    multiple: SelectState["multiple"];
}
export interface SetDirectionAction {
    type: SelectActionTypes.setDirection;
    direction: SelectState["direction"];
}
export interface SetSelectAction {
    type: SelectActionTypes.setSelect;
    select: SelectState["select"];
}
export interface SetAnimationDurationAction {
    type: SelectActionTypes.setAnimationDuration;
    animationDuration: SelectState["animationDuration"];
}
export interface ToggleOptionElAction {
    type: SelectActionTypes.toggleOptionEl;
    optionEl: HTMLSdxSelectOptionElement;
}
export interface CommitOptionElsBatchAction {
    type: SelectActionTypes.commitOptionElsBatch;
}
export interface ToggleOptgroupElAction {
    type: SelectActionTypes.toggleOptGroupEl;
    optgroupEl: HTMLSdxSelectOptgroupElement;
}
export interface CommitOptgroupElsBatchAction {
    type: SelectActionTypes.commitOptGroupElsBatch;
}
export interface SetFilterAction {
    type: SelectActionTypes.setFilter;
    filter: SelectState["filter"];
}
export interface SetFilterFunctionAction {
    type: SelectActionTypes.setFilterFunction;
    filterFunction: SelectState["filterFunction"];
}
export declare type SelectActions = SetSelectionBatchAction | SelectAction | CommitSelectionBatchAction | SetMultipleAction | SetDirectionAction | SetSelectAction | SetAnimationDurationAction | ToggleOptionElAction | CommitOptionElsBatchAction | ToggleOptgroupElAction | CommitOptgroupElsBatchAction | SetFilterAction | SetFilterFunctionAction;
export declare const selectReducer: Reducer<SelectState, SelectActions>;
