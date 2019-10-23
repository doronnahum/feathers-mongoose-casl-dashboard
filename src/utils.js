import startCase from 'lodash/startCase';
import { getDeepObjectValue } from 'validate.js';

export const getFieldName = ({ target, lang, itemKey, dashboardList, dashboardDoc = {}, dashboard = {}, dashboardConfig = {} }) => {
  const i18n = getDeepObjectValue(dashboardConfig, `i18n.${lang}.fields.${itemKey}`)
  if (i18n) return i18n;
  if (target === 'filters') {
    return startCase(itemKey)
  } else if (target === 'doc') {
    return dashboardDoc.label || dashboard.label || startCase(itemKey)
  } else if (target === 'list') {
    return dashboardList.label || dashboard.label || startCase(itemKey)
  } else {
    throw new Error('getFieldName first argument must be list or doc')
  }
}