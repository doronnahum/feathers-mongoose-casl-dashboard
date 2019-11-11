import { getDeepObjectValue } from 'validate.js';

const getInitialValues = function (jsonSchema = {}) {
  const properties = jsonSchema.properties || {};
  const initialValues = {};
  Object.keys(properties).forEach((itemKey) => {
    const item = properties[itemKey];
    const docDashboard = getDeepObjectValue(item, 'meta.0.dashboard.doc');
    if (docDashboard && docDashboard.initialValue) {
      initialValues[itemKey] = docDashboard.initialValue;
      if (docDashboard.initialValue === 'date-now') {
        initialValues[itemKey] = new Date().toISOString();
      }
    }
  });
  return initialValues;
};
export default getInitialValues;
