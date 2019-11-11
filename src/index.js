import DashboardApp from './DashboardApp';
import DashboardMenu from './DashboardMenu';
import UserAbilities from './UserAbilities';
import UserAbilityMenu from './UserAbilityMenu';
import { setLocal } from './local';
import enUS from './local/en-US';
import heIL from './local/he-IL';

const locals = {
  enUS,
  heIL,
};
export {
  DashboardApp,
  DashboardMenu,
  UserAbilities,
  UserAbilityMenu,
  setLocal,
  locals,
};
