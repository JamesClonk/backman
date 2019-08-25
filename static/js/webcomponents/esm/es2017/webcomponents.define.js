
// webcomponents: Custom Elements Define Library, ES Module/es2017 Target

import { defineCustomElement } from './webcomponents.core.js';
import {
  Accordion,
  Arrow,
  Body,
  Button,
  Dummy,
  Header,
  Icon,
  Input,
  InputGroup,
  InputItem,
  Item,
  ItunesAutocomplete,
  LoadingSpinner,
  MenuFlyout,
  MenuFlyoutContent,
  MenuFlyoutCta,
  MenuFlyoutList,
  MenuFlyoutListItem,
  MenuFlyoutToggle,
  Price,
  ProgressFull,
  ProgressFullStep,
  Ribbon,
  Search,
  Section,
  Select,
  SelectOptGroup,
  SelectOption,
  ShowMore,
  StickerCircle,
  TextTruncate
} from './webcomponents.components.js';

export function defineCustomElements(win, opts) {
  return defineCustomElement(win, [
    Accordion,
    Arrow,
    Body,
    Button,
    Dummy,
    Header,
    Icon,
    Input,
    InputGroup,
    InputItem,
    Item,
    ItunesAutocomplete,
    LoadingSpinner,
    MenuFlyout,
    MenuFlyoutContent,
    MenuFlyoutCta,
    MenuFlyoutList,
    MenuFlyoutListItem,
    MenuFlyoutToggle,
    Price,
    ProgressFull,
    ProgressFullStep,
    Ribbon,
    Search,
    Section,
    Select,
    SelectOptGroup,
    SelectOption,
    ShowMore,
    StickerCircle,
    TextTruncate
  ], opts);
}