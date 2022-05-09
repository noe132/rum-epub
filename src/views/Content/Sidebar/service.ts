import { action, observable } from 'mobx';

const state = observable({
  collapsed: true,
});

const toggleSidebar = action(() => {
  state.collapsed = !state.collapsed;
});

export const sidebarService = {
  state,

  toggleSidebar,
};
