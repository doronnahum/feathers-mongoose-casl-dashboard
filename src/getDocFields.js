import React from 'react';
import { docHelpers } from 'redux-admin';//  ''redux-admin'';
import startCase from 'lodash/startCase';
import { getDeepObjectValue } from 'validate.js';
import { Collapse } from 'antd';
import RefComponent from './RefComponent';
import { getFieldName, getI18nLabelName, validateWhen } from './utils.js';
import { getCustomField } from './customFields';

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


const isAble = function ({ isNewDoc, item, itemKey, preFix, abilityFields = {}, ref, dashboardData }) {
  const { createFields, updateFields } = abilityFields;
  const fields = isNewDoc ? createFields : updateFields;
  let isAble = false;
  if (fields && fields.length) {
    const fieldsWithSelect = fields.filter((field) => typeof field === 'object' && field.path === itemKey);
    if (fieldsWithSelect.length) {
      fieldsWithSelect.forEach((item) => {
        if (preFix && preFix.length) {
          if (item.select) {
            isAble = item.select.includes(itemKey);
          } else {
            isAble = true; // For now we cant support field.when on the server
          }
        }
      });
    } else {
      const isDeep = preFix && preFix.length;
      isAble = fields.includes(itemKey) || fields.includes('*');
      if (!isAble && isDeep) {
        isAble = fields.includes(preFix + itemKey) || fields.includes('*');
      }
    }
    if (isAble && ref) {
      const isDashboardScreenAvailable = dashboardData.find((item) => (item.result.name === ref));
      if (!isDashboardScreenAvailable) {
        console.log('src/screens/dashboard/getDocFields.js, remove fields from fields, user can"t see the ref');
        isAble = false;
      }
    }
    return isAble;
  }
  return true;
};
const getDocFields = function ({ documentRollConfig, isNewDoc, values, lang, rtl }, jsonSchema, abilityFields, dashboardData, preFix = '', dashboardConfig, customRenderField, customElements) {
  const properties = jsonSchema.properties || {};
  const requires = jsonSchema.required || [];
  const fields = [];
  const fieldsForLayout = [];
  const hasDocLayut = dashboardConfig && dashboardConfig.docLayout;
  Object.keys(properties).map((itemKey) => {
    const item = properties[itemKey];
    let options = (item.enum && item.enum.length) ? item.enum : getDeepObjectValue(item, 'items.enum');
    let { type } = item;
    let objectStructure;
    if (item.format === 'date-time') type = Date;
    let objectFields;
    if (item.properties && Object.keys(item.properties).length) {
      objectFields = getDocFields({ documentRollConfig, isNewDoc, values }, { properties: item.properties, required: requires }, abilityFields, dashboardData, `${itemKey}.`);
      if (objectFields.length) {
        const currentField = (
          <Collapse key={itemKey} className={`group-${itemKey} ra-mb15`} defaultActiveKey={isNewDoc ? ['1'] : null}>
            <Collapse.Panel key="1" header={<label>{startCase(itemKey)}:</label>}>
              {objectFields}
            </Collapse.Panel>
          </Collapse>
        );
        if (hasDocLayut) {
          fieldsForLayout[itemKey] = currentField;
        } else {
          fields.push(currentField);
        }
        return;
      }
    }
    const arrayItemType = getDeepObjectValue(item, 'items.type');
    const nestedArray = type === 'array' && !arrayItemType;
    if (type === 'array' && item.items && item.items.properties) {
      objectStructure = [];
      Object.keys(item.items.properties).forEach((itemKey) => {
        const arrayField = item.items.properties[itemKey];
        let _type = arrayField.type;
        if (arrayField.format === 'date-time') {
          _type = 'date';
        }
        objectStructure.push({
          key: itemKey,
          label: getFieldName({ target: 'doc', lang, itemKey, dashboardDoc, dashboard, dashboardConfig }),
          type: _type,
        });
      });
    }
    const dashboard = getDeepObjectValue(item, 'meta.0.dashboard') || {};
    const dashboardDoc = getDeepObjectValue(item, 'meta.0.dashboard.doc') || {};
    if (dashboard.hide) return null;
    if (dashboardDoc.hide) return null;
    if (isNewDoc && dashboardDoc.hideOnCreate) return null;
    if (!isNewDoc && dashboardDoc.hideOnUpdate) return null;
    if (dashboardDoc.options) { // When we want to display enums with labels
      options = dashboardDoc.options;
      dashboardDoc.optionKey = dashboardDoc.optionKey || 'value';
      dashboardDoc.displayKey = dashboardDoc.displayKey || 'label';
    }
    const ref = getDeepObjectValue(item, 'meta.0.ref') || getDeepObjectValue(item, 'items.meta.0.ref');
    const showField = isAble({ isNewDoc, item, itemKey, preFix, abilityFields, ref, dashboardData });
    if (!showField) return null;

    const fieldConfig = {
      key: preFix + itemKey,
      label: getFieldName({ target: 'doc', lang, itemKey, dashboardDoc, dashboard, dashboardConfig }),
      type,
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
      RefComponent,
      objectStructure,
      helpText: dashboardDoc.helpText,
    };
    if (dashboardDoc.options) {
      fieldConfig.renderLabel = ({
        label, option, optionKey,
      }) => {
        const optionFromOptions = dashboardDoc.options.find((o) => option[optionKey] === o.value);
        if (optionFromOptions && optionFromOptions.i18nLabels) {
          return optionFromOptions.i18nLabels[lang] || optionFromOptions.label || label;
        }
        return label;
      };
    }

    const currentField = docHelpers.getDocField(fieldConfig);
    if (hasDocLayut) {
      fieldsForLayout[itemKey] = currentField;
    } else {
      fields.push(currentField);
    }
  });
  if (dashboardConfig && dashboardConfig.docLayout) {

    const addItemField = function (item, key, _fields) {
      if (!item) return;
      const isArrayOfFields = Array.isArray(item);


      const getField = function (itemField, index) {
        const _key = key + (index || '');
        if (typeof itemField === 'object') {
          if (isNewDoc && itemField.hideOnCreate) return null;
          if (!isNewDoc && itemField.hideOnUpdate) return null;
          if (itemField.when) {
            const fieldsEquale = [];
            const fieldsNotEquale = [];
            addItemField(itemField.when.then, key, fieldsEquale);
            addItemField(itemField.when.otherwise, key, fieldsNotEquale);
            return (
              <span key={`group-${_key}-withCondiation`}>
                {
                  (validateWhen(values, itemField))
                    ? <span key={`group-true=${_key}`} className="ra-doc-layout-itemsGroup">{fieldsEquale}</span>
                    : <span key={`group-false=${_key}`} className="ra-doc-layout-itemsGroup">{fieldsNotEquale}</span>
                }
              </span>
            );
          }
          if (itemField.type === 'custom') {
            const displayLabel = getI18nLabelName({ lang, itemKey: itemField.itemKey, dashboardConfig }) || itemField.label || itemField.itemKey;
            return (<span key={_key}>{getCustomField({ item: itemField, key: itemField.itemKey, displayLabel, lang, rtl, customRenderField, customElements })}</span>);
          }
        }
        return fieldsForLayout[itemField];
      };

      if (isArrayOfFields) {
        const fieldsToAdd = item.map(getField).filter(Boolean);
        _fields.push(<span className="ra-doc-layout-itemsGroup" key={`group${key}`}>{fieldsToAdd}</span>);
      } else {
        const fieldToAdd = getField(item);
        if (fieldToAdd) {
          _fields.push(fieldToAdd);
        }
      }
    };
    dashboardConfig.docLayout.map((item, index) => addItemField(item, index, fields));
  }
  return fields;
};
export default getDocFields;
