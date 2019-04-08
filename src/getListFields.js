import React from 'react';
import {listHelpers} from 'redux-admin';
import { getDeepObjectValue } from 'validate.js';
import startCase from 'lodash/startCase';

const getListFields = function (props, jsonSchema = {}) {
  const properties = jsonSchema.properties || {};
  const fields = []
  Object.keys(properties).map(itemKey => {
    const item = properties[itemKey]
    const meta = getDeepObjectValue(item, 'meta.0') || {}

    const dashboard = getDeepObjectValue(meta, 'dashboard') || {}
    const dashboardList = getDeepObjectValue(meta, 'dashboard.list') || {}
    let type = item.type;
    if(item.format === 'date-time') type = Date;
    if(meta.ref) {
      type = Object;
    }
    if(dashboard.hide) return null
    if(dashboardList.hide) return null;
    console.log({itemKey})
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
