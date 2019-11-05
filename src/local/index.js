import enUS from './en-US';
import heIL from './he-IL';

export let LOCALS = enUS;

export const setLocal = function (values = {}) {
  LOCALS = { ...enUS, ...values }
}
