import '../../../stencil.core';
import { SelectState } from "../select-store";
export declare class SelectOption {
    private store?;
    private unsubscribe;
    el: HTMLSdxSelectOptionElement;
    selectionSorted: SelectState["selectionSorted"];
    multiple: SelectState["multiple"];
    direction: SelectState["direction"];
    select: SelectState["select"];
    filter: SelectState["filter"];
    filterFunction: SelectState["filterFunction"];
    /**
     * Value of the option that will be returned in the selection.
     */
    value: any;
    /**
     * Whether this option is initially selected.
     */
    selected: boolean;
    /**
     * Not selectable (event propagation will be stopped).
     */
    disabled: boolean;
    /**
     * @private
     * Whether this option is the placeholder element.
     */
    placeholder: boolean;
    onClick(): void;
    selectedChanged(): void;
    componentWillLoad(): void;
    componentDidUnload(): void;
    isSelected(): boolean;
    private dispatch;
    hostData(): {
        style: {
            display: string;
        };
        class: {
            [x: string]: boolean;
            selected: boolean;
            multiple: boolean;
            disabled: boolean;
        };
    };
    render(): JSX.Element;
}
