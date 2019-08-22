import '../../stencil.core';
import { InputGroupState } from "./input-group-store";
import { Type } from "./types";
export declare class InputGroup {
    private store;
    private unsubscribe;
    private invokeChangeCallback;
    private componentDidLoadComplete;
    el: HTMLSdxInputGroupElement;
    typeState: InputGroupState["typeState"];
    nameState: InputGroupState["nameState"];
    selectedInputItemEls: InputGroupState["selectedInputItemEls"];
    selectNextInputItemElFrom: InputGroupState["selectNextInputItemElFrom"];
    selectPreviousInputItemElFrom: InputGroupState["selectPreviousInputItemElFrom"];
    inputItemElsSorted: InputGroupState["inputItemElsSorted"];
    /**
     * The form input variant of the item.
     */
    type: Type;
    /**
     * Callback when the selected radio changed.
     */
    changeCallback: ((checked: boolean) => void) | string | undefined;
    /**
     * Name parameter (useful when the item is embedded in a traditional HTML form submit).
     */
    name: string;
    /**
     * Display all input items in a row.
     */
    inline: boolean;
    /**
     * Label of the input group.
     */
    label: string;
    typeChanged(): void;
    changeCallbackChanged(): void;
    nameChanged(): void;
    inlineChanged(): void;
    selectedInputItemElsChanged(): void;
    selectNextInputItemElFromChanged(): void;
    selectPreviousInputItemElFromChanged(): void;
    /**
     * Returns the current selection.
     */
    getSelection(): any[];
    componentWillLoad(): void;
    componentDidLoad(): void;
    componentDidUnload(): void;
    private getInitialState;
    private dispatchNameAction;
    private setInvokeChangeCallback;
    hostData(): {
        role: string | null;
    };
    render(): JSX.Element;
}
