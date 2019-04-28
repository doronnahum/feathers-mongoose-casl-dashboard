import React from 'react';
import {docHelpers} from 'redux-admin' //  'src/components/redux-admin';
import startCase from 'lodash/startCase';
import { getDeepObjectValue } from 'validate.js';
import RefComponent from './RefComponent'
import { Collapse } from 'antd';

/*
getDocField({
    key,
    type,
    label,
    required,
    ref,
    RefComponent = Reference,
    referenceKey,
    labelInValue,
    arrayItemType = String,
    multiSelect = false,
    disabled = false,
    documentRollConfig,
    isNewDoc,
    optionLabel,
    optionKey,
    options,
    getParamsByValue,
    placeholder,
    objectStructure
})
*/

const isAble = function({isNewDoc, item, itemKey, preFix, abilityFields = {}, ref, dashboardData}) {
  const {createFields, updateFields} = abilityFields;
  const fields = isNewDoc ? createFields : updateFields;
  let isAble = false;
  if(fields && fields.length) {
    const fieldsWithSelect = fields.filter(field => {
      return typeof field === 'object' && field.path === itemKey
    });
    if(fieldsWithSelect.length) {
      fieldsWithSelect.forEach(item => {
        if(preFix && preFix.length) {
          if(item.select) {
            isAble = item.select.includes(itemKey)
          }else{
            isAble = true; // For now we cant support field.when on the server
          }
        }
      })
    }else{
      const isDeep = preFix && preFix.length;
      isAble = fields.includes(itemKey) || fields.includes('*');
      if(!isAble && isDeep) {
        isAble = fields.includes(preFix + itemKey) || fields.includes('*')
      }
    }
    if(isAble && ref) {
      const isDashboardScreenAvailable = dashboardData.find(item => (item.result.name === ref));
      if(!isDashboardScreenAvailable) {
        console.log('src/screens/dashboard/getDocFields.js, remove fields from fields, user can"t see the ref')
        isAble = false;
      };
    }
    return isAble
  }else{
    return true;
  }
}
const getDocFields = function({documentRollConfig, isNewDoc, values}, jsonSchema, abilityFields, dashboardData, preFix = '') {
  const properties = jsonSchema.properties || {};
  const requires = jsonSchema.required || [];
  const fields = []
  Object.keys(properties).map(itemKey => {
    const item = properties[itemKey]
    const options = (item.enum && item.enum.length) ? item.enum : getDeepObjectValue(item, 'items.enum');
    let type = item.type;
    let objectStructure;
    if(item.format === 'date-time') type = Date;
    let objectFields;
    if(item.properties && Object.keys(item.properties).length) {
      objectFields = getDocFields({documentRollConfig, isNewDoc, values}, {properties: item.properties, required: requires}, abilityFields, dashboardData, `${itemKey}.`)
      if(objectFields && objectFields.length) {
        fields.push(
          <Collapse key={itemKey} className={`group-${itemKey} ra-mb15`} defaultActiveKey={isNewDoc ? ['1'] : null}>
            <Collapse.Panel key={1} header={<label>{startCase(itemKey)}:</label>}>
              {objectFields}
            </Collapse.Panel>
          </Collapse>
        )
        return;
      }
    }
    const arrayItemType = getDeepObjectValue(item, 'items.type');
    const nestedArray = type === 'array' && !arrayItemType;
    if(type === 'array' && item.items && item.items.properties) {
      objectStructure = [];
      Object.keys(item.items.properties).forEach(itemKey => {
        const arrayField = item.items.properties[itemKey];
        let _type = arrayField.type;
        if(arrayField.format === 'date-time') {
          _type = 'date'
        }
        objectStructure.push({
          key: itemKey,
          label: itemKey,
          type: _type
        })
      })
    }
    const dashboard = getDeepObjectValue(item, 'meta.0.dashboard') || {}
    const dashboardDoc = getDeepObjectValue(item, 'meta.0.dashboard.doc') || {}
    if(dashboard.hide) return null
    if(dashboardDoc.hide) return null
    if(isNewDoc && dashboardDoc.hideOnCreate) return null
    if(!isNewDoc && dashboardDoc.hideOnUpdate) return null
    const ref = getDeepObjectValue(item, 'meta.0.ref') || getDeepObjectValue(item, 'items.meta.0.ref');
    const showField = isAble({isNewDoc, item, itemKey, preFix, abilityFields, ref, dashboardData});
    if(!showField) return null;
    fields.push(
      docHelpers.getDocField({
        key: preFix + itemKey,
        label: dashboardDoc.label || dashboard.label || startCase(itemKey),
        type: type,
        required: requires.includes(preFix + itemKey),
        documentRollConfig,
        isNewDoc,
        arrayItemType,
        ref,
        optionLabel: getDeepObjectValue(item, 'meta.0.displayKey') || getDeepObjectValue(item, 'items.meta.0.displayKey') || dashboardDoc.displayKey,
        optionKey: dashboardDoc.optionKey || '_id',
        multiSelect: item.type === 'array' || item.type === Array,
        options: (options && options.length) ? options : null,
        nestedArray,
        disabled: item.readOnly || dashboard.readOnly || dashboardDoc.readOnly || (!isNewDoc && dashboardDoc.immutable),
        inputType: dashboardDoc.inputType,
        inputProps: dashboardDoc.inputProps ? JSON.parse(dashboardDoc.inputProps) : null,
        RefComponent: RefComponent,
        objectStructure,
        helpText: dashboardDoc.helpText
      })
    )
  });
  return fields;
}
export default getDocFields;
