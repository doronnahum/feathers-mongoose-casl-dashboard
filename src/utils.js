import startCase from 'lodash/startCase';
import { getDeepObjectValue } from 'validate.js';
import sift from 'sift';

export const getFieldName = ({ target, lang, itemKey, dashboardList, dashboardDoc = {}, dashboard = {}, dashboardConfig = {} }) => {
  const i18n = getDeepObjectValue(dashboardConfig, `i18n.${lang}.fields.${itemKey}`);
  if (i18n) return i18n;
  if (target === 'filters') {
    return startCase(itemKey);
  } if (target === 'doc') {
    return dashboardDoc.label || dashboard.label || startCase(itemKey);
  } if (target === 'list') {
    return dashboardList.label || dashboard.label || startCase(itemKey);
  }
  throw new Error('getFieldName first argument must be list or doc');
};
export const getI18nLabelName = ({ lang, itemKey, dashboardConfig = {} }) => getDeepObjectValue(dashboardConfig, `i18n.${lang}.fields.${itemKey}`);


export const validateWhen = (values, itemField) => {
  const { when } = itemField;
  if (when.equalTo) {
    const value = values[itemField.when.field]
    return when.equalTo === value;
  };
  if (when.conditions) {
    return sift(when.conditions)(values);
  }
  return false;
};
