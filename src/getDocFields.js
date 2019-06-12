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
const getDocFields = function({documentRollConfig, isNewDoc, values}, jsonSchema, abilityFields, dashboardData, preFix = '', dashboardConfig) {
  const properties = jsonSchema.properties || {};
  const requires = jsonSchema.required || [];
  const fields = []
  const fieldsForLayout = []
  const hasDocLayut = dashboardConfig && dashboardConfig.docLayout;
  Object.keys(properties).map(itemKey => {
    const item = properties[itemKey]
    let options = (item.enum && item.enum.length) ? item.enum : getDeepObjectValue(item, 'items.enum');
    let type = item.type;
    let objectStructure;
    if(item.format === 'date-time') type = Date;
    let objectFields;
    if(item.properties && Object.keys(item.properties).length) {
      objectFields = getDocFields({documentRollConfig, isNewDoc, values}, {properties: item.properties, required: requires}, abilityFields, dashboardData, `${itemKey}.`)
      if(objectFields.length) {
        const currentField = (<Collapse key={itemKey} className={`group-${itemKey} ra-mb15`} defaultActiveKey={isNewDoc ? ['1'] : null}>
          <Collapse.Panel key={'1'} header={<label>{startCase(itemKey)}:</label>}>
            {objectFields}
          </Collapse.Panel>
        </Collapse>);
        if(hasDocLayut) {
          fieldsForLayout[itemKey] = currentField
        }else{
          fields.push(currentField)
        }
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
    if(dashboardDoc.options) { // When we want to display enums with labels
      options = dashboardDoc.options;
      dashboardDoc.optionKey = dashboardDoc.optionKey || 'value';
      dashboardDoc.displayKey = dashboardDoc.displayKey || 'label';
    }
    const ref = getDeepObjectValue(item, 'meta.0.ref') || getDeepObjectValue(item, 'items.meta.0.ref');
    const showField = isAble({isNewDoc, item, itemKey, preFix, abilityFields, ref, dashboardData});
    if(!showField) return null;
    const currentField = docHelpers.getDocField({
      key: preFix + itemKey,
      label: dashboardDoc.label || dashboard.label || startCase(itemKey),
      type: type,
      required: requires.includes(preFix + itemKey),
      documentRollConfig,
      isNewDoc,
      arrayItemType,
      ref,
      optionLabel: dashboardDoc.displayKey || getDeepObjectValue(item, 'meta.0.displayKey') || getDeepObjectValue(item, 'items.meta.0.displayKey'),
      optionKey: dashboardDoc.optionKey || '_id',
      multiSelect: item.type === 'array' || item.type === Array,
      options: dashboardDoc.options || (options && options.length) ? options : null,
      nestedArray,
      disabled: item.readOnly || dashboard.readOnly || dashboardDoc.readOnly || (!isNewDoc && dashboardDoc.immutable),
      inputType: dashboardDoc.inputType,
      inputProps: dashboardDoc.inputProps ? JSON.parse(dashboardDoc.inputProps) : null,
      RefComponent: RefComponent,
      objectStructure,
      helpText: dashboardDoc.helpText
    })
    if(hasDocLayut) {
      fieldsForLayout[itemKey] = currentField
    }else{
      fields.push(currentField)
    }
  });
  if(dashboardConfig && dashboardConfig.docLayout) {
    const addItemField = function(item, key, _fields) {
      if(!item) return;
      if(typeof item === 'string') {
        _fields.push(fieldsForLayout[item])
      }else{
        if(Array.isArray(item)) {
          _fields.push(<span className='ra-doc-layout-itemsGroup' key={`group${key}`}>{item.map(itemKey => fieldsForLayout[itemKey])}</span>)
        }else if(typeof item === 'object') {
          if(item.when) {
            const fieldsEquale = [];
            const fieldsNotEquale = [];
            addItemField(item.when.then, key, fieldsEquale)
            addItemField(item.when.otherwise, key, fieldsNotEquale)
            fields.push(<span key={`group-${key}-withCondiation`}>
              {
                (values[item.when.field] === item.when.equalTo)
                  ? <span key={`group-true=${key}`} className='ra-doc-layout-itemsGroup'>{fieldsEquale}</span>
                  : <span key={`group-false=${key}`} className='ra-doc-layout-itemsGroup'>{fieldsNotEquale}</span>
              }
            </span>)
          }
        }
      }
    }
    dashboardConfig.docLayout.map((item, index) => addItemField(item, index, fields))
  }
  return fields;
}
export default getDocFields;
