import '../../stencil.core';
import { Design, Position, Size } from "./types";
export declare class Ribbon {
    /**
     * Text content.
     */
    label: string;
    /**
     * Look.
     */
    design: Design;
    /**
     * Location.
     */
    position: Position;
    /**
     * Dimension.
     */
    size: Size;
    hostData(): {
        class: {
            [x: string]: boolean;
        };
    };
    render(): JSX.Element;
}
