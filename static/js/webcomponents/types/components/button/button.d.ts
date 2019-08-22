import '../../stencil.core';
import { ButtonTheme, ButtonSize } from "./types";
export declare class Button {
    /**
     * Button theme.
     */
    theme: ButtonTheme;
    /**
     * Button size.
     */
    size: ButtonSize;
    /**
     * Description text read by the screen reader.
     */
    srHint: string;
    hostData(): {
        class: {
            [x: string]: boolean;
        };
    };
    render(): JSX.Element;
}
