import {listHelpers} from 'redux-admin';
import { getDeepObjectValue } from 'validate.js';
import startCase from 'lodash/startCase';
const EMPTY_OBJ = {};

const DEFAULT_FIELDS = ['_id','createdAt', 'updatedAt'];

const getListFields = function (props, jsonSchema = {}, dashboardConfig = {}) {
  const properties = jsonSchema.properties || EMPTY_OBJ;
  const fields = []
  Object.keys(properties).forEach(itemKey => {
    const item = properties[itemKey]
    let meta = getDeepObjectValue(item, 'meta.0') || EMPTY_OBJ
    if((item.type === 'object' || item.type === Object) && meta === EMPTY_OBJ) {
      // in this case the meta can be found at the children as parentDashboard, this is a workaround;
      let metaFromInnerField;
      Object.keys(item.properties).forEach(itemKey => {
        if(!metaFromInnerField) {
          const innerField = item.properties[itemKey];
          metaFromInnerField = getDeepObjectValue(innerField, 'meta.0.parentDashboard')
        }
      })
      if(metaFromInnerField) {
        meta = {dashboard: metaFromInnerField};
      }
    }
    const dashboard = getDeepObjectValue(meta, 'dashboard') || EMPTY_OBJ
    const dashboardList = getDeepObjectValue(meta, 'dashboard.list') || EMPTY_OBJ
    const dashboardConfigDefaultFields = dashboardConfig.defaultFieldsToDisplay;
    debugger
    if(dashboardConfigDefaultFields && DEFAULT_FIELDS.includes(itemKey) && !dashboardConfigDefaultFields.includes(itemKey)){
      return null;
    }
    let type = item.type;
    if(item.format === 'date-time') type = Date;
    if(meta.ref) {
      type = Object;
    }
    if(dashboard.hide) return null
    if(dashboardList.hide) return null;
    const fieldConfig = {
      key: itemKey,
      title: dashboardList.label || dashboard.label || startCase(itemKey),
      type: dashboardList.type || type,
      sorter: dashboardList.sorter === false ? false : (dashboardList.sorter || true),
      width: dashboardList.width,
      labelKey: meta.displayKey
    };
    fields.push(listHelpers.getListField(fieldConfig))
  })
  return fields;
}
export default getListFields;
