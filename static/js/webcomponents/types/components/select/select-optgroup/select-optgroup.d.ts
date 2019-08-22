import '../../../stencil.core';
import { SelectState } from "../select-store";
export declare class SelectOptGroup {
    private store?;
    private unsubscribe;
    el: HTMLSdxSelectOptgroupElement;
    direction: SelectState["direction"];
    filter: SelectState["filter"];
    filterFunction: SelectState["filterFunction"];
    /**
     * Label of the group to be displayed.
     */
    name: string;
    componentWillLoad(): void;
    componentDidUnload(): void;
    private dispatch;
    /**
     * Returns true if an optgroup element matches the filter (or one of its option element children).
     * @param el The optgroup to be tested.
     * @param filter The keyword to be tested.
     */
    private optgroupElMatchesFilter;
    hostData(): {
        style: {
            display: string;
        };
        class: {
            [x: string]: boolean;
        };
    };
    render(): JSX.Element;
}
