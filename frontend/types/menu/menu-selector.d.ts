export interface MenuSelector {
  id: number;
  label: string;
  routeURL: string;
  iconURL: string;
  selected: boolean;
  htmlId?: string;
}

export interface BarMenu {
  id: string;
  ariaLabel: string;
  label: string;
  icon: string;
  isFontBold: boolean;
  panelButtons: MenuSelector[];
}
