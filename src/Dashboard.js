/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { FeathersAdmin, listViews, docViews } from 'redux-admin';
import startCase from 'lodash/startCase';
// import {buildYup} from './utils/json-schema-to-yup/index';
import { buildYup } from 'json-schema-to-yup';
import cloneDeep from 'lodash/cloneDeep';
import { getDeepObjectValue } from 'validate.js';
import getInitialValues from './getInitialValues';
import getDocFields from './getDocFields';
import getListFields from './getListFields';
import { LOCALS } from './local';
import { getFieldName } from './utils.js';

class index extends Component {
  constructor(props) {
    super(props);
    this.docFields = null;
    this.listFields = null;
    this.yup = null;
  }

  getDocTitle = (data) => {
    const { dashboardConfig, url } = this.props;
    const localName = getDeepObjectValue(dashboardConfig, `i18n.${LOCALS.LANG_CODE}.serviceNameOne`);
    const name = localName || startCase(url);
    const { docTitleField } = dashboardConfig || {};
    if (data && data._id) {
      return `${name} ${data[docTitleField] || data.name || data.title || data._id}`;
    }
    return LOCALS.RENDER_NEW_DOC_NAME(name, data);
  }

  fixJsonSchemaRequires(jsonSchema, isNewDoc, dashboardConfig) {
    const _schema = cloneDeep(jsonSchema);
    if (_schema.properties) {
      // remove hidden fields and fix required fields
      const required = jsonSchema.required || [];
      const fields = Object.keys(_schema.properties);
      const newProperties = {};
      fields.forEach((filedKey) => {
        const field = _schema.properties[filedKey];
        const dashboard = getDeepObjectValue(field, 'meta.0.dashboard');
        if (dashboard && dashboard.allowNull) {
          field.type = [field.type, null];
        }
        if (field.type === 'object' && field.required) {
          required.push(filedKey);
          field.required.forEach((innerField) => required.push(`${filedKey}.${innerField}`));
        }
        if (dashboard && dashboard.hide) {
          return;
        }
        if (isNewDoc && dashboard && dashboard.doc && dashboard.doc.hideOnCreate) {
          return;
        }
        if (!isNewDoc && dashboard && dashboard.doc && dashboard.doc.hideOnUpdate) {
          return;
        }
        newProperties[filedKey] = field;
        const isRequired = required.includes(field);
        if (isRequired) {
          const fieldConfig = jsonSchema.properties[field];
          if (fieldConfig.type === 'string') {
            if (!fieldConfig.minLength) {
              _schema.properties[field] = { ..._schema.properties[field], minLength: 1 };
            }
          }
        }
      });
      _schema.properties = newProperties;
    }
    return _schema;
  }

  getJoiSchema(jsonSchema, newDoc, dashboardConfig) {
    if (newDoc && this.yupOnNew) return this.yupOnNew;
    if (!newDoc && this.yupOnUpdate) return this.yupOnUpdate;
    try {
      const _jsonSchema = this.fixJsonSchemaRequires(jsonSchema, newDoc, dashboardConfig);
      const yup = buildYup(_jsonSchema);
      if (newDoc) {
        if (yup) {
          this.yupOnNew = yup;
          return this.yupOnNew;
        }
      } else if (yup) {
        this.yupOnUpdate = yup;
        return this.yupOnUpdate;
      }
    } catch (error) {
      console.log('getJoiSchema error', error);
    }
    return newDoc ? this.yupOnNew : this.yupOnUpdate;
  }

  getDefaultOptions = () => {
    const { populate } = this.props;
    if (populate) {
      return {
        $populate: populate.join(','),
        '$sort[updatedAt]': -1,
      };
    }
    return {
      '$sort[updatedAt]': -1,
    };
  }

  getFilterTitle = (field) => {
    this.filtersNames = this.filtersNames || {};
    this.filtersNames[field.key] = this.filtersNames[field.key] || getFieldName({ target: 'filters', lang: LOCALS.LANG_CODE, itemKey: field.key, dashboardConfig: this.props.dashboardConfig });
    return this.filtersNames[field.key];
  }

  render() {
    const { url, jsonSchema, dashboardConfig, updateFields, createFields, showBreadcrumb, syncWithUrl, listTargetKeyPrefix, dashboardData, editAfterSaved, customRenderField, customElements } = this.props;
    if (!jsonSchema || !url) return '';
    this.joiSchemaOnCreate = this.joiSchemaOnCreate || this.getJoiSchema(jsonSchema, true, dashboardConfig);
    this.joiSchemaOnUpdate = this.joiSchemaOnUpdate || this.getJoiSchema(jsonSchema, false, dashboardConfig);
    const defaultOptions = this.getDefaultOptions();
    const localName = getDeepObjectValue(dashboardConfig, `i18n.${LOCALS.LANG_CODE}.serviceName`);
    return (
      <div className={`screen-${url}`}>
        <FeathersAdmin
          title={localName || url}
          defaultOptions={defaultOptions}
          getDocTitle={this.getDocTitle}
          url={url}
          listTargetKeyPrefix={listTargetKeyPrefix}
          lang={LOCALS.LANG_CODE}
          rtl={LOCALS.LANG_DIR === 'rtl'}
          list={(
            <listViews.Table
              lang={LOCALS.LANG_CODE}
              rtl={LOCALS.LANG_DIR === 'rtl'}
              getFilterTitle={this.getFilterTitle}
              // renderOnTop={(props) => {
              //   console.log({props})
              //   return (
              //     <div className='onTopBoxRow'>
              //       <div className='onTopBox'>
              //         <div className='onTopBoxValue__number'>{props.count || 0}</div>
              //         <div className='onTopBox__text'>Total</div>
              //       </div>
              //       <div className='onTopBox primary'>
              //         <div className='onTopBoxValue__number'><Icon type="user-add" /></div>
              //         <div className='onTopBox__text'>Add</div>
              //       </div>
              //     </div>

              //   )
              // }}
              getColumns={(props) => {
                this.listFields = this.listFields || getListFields(props, jsonSchema, dashboardConfig);
                return this.listFields;
              }}
              rowSelection={this.props.rowSelection}
              onRow={this.props.onRow}
            />
          )}
          doc={(
            <docViews.SimpleDoc
              lang={LOCALS.LANG_CODE}
              rtl={LOCALS.LANG_DIR === 'rtl'}
              immutableKeys={['_id', 'updatedAt', 'createdAt']}
              getDocFields={(props) => {
                const { isNewDoc } = props;
                this.newDocFields = this.newDocFields || isNewDoc ? getDocFields(props, jsonSchema, { createFields, updateFields }, dashboardData, '', dashboardConfig, customRenderField, customElements) : null;
                this.editDocFields = this.editDocFields || !isNewDoc ? getDocFields(props, jsonSchema, { createFields, updateFields }, dashboardData, '', dashboardConfig, customRenderField, customElements) : null;
                return (isNewDoc ? this.newDocFields : this.editDocFields);
              }}
              newDocInitialValues={getInitialValues(jsonSchema)}
              validationSchema={this.joiSchemaOnCreate} // We can remove this
              validationSchemaOnCreate={this.joiSchemaOnCreate}
              validationSchemaOnUpdate={this.joiSchemaOnUpdate}
              getHeadersBeforeSubmit={({ dataToSend }) => {
                const allFields = Object.keys(dataToSend);
                const hasFile = allFields.some((item) => {
                  const val = dataToSend[item];
                  return (val && typeof val === 'object' && val instanceof File);
                });
                if (hasFile) return { 'content-type': 'multipart/form-data' };
                return null;
              }}
              parseDataBeforeSubmit={({ dataToSend }) => {
                const allFields = Object.keys(dataToSend);
                const hasFile = allFields.some((item) => {
                  const val = dataToSend[item];
                  return (val && typeof val === 'object' && val instanceof File);
                });
                if (!hasFile) return dataToSend;

                const formData = new FormData();
                allFields.forEach((fieldKey) => {
                  const value = dataToSend[fieldKey];
                  if (typeof value === 'object') {
                    const isFile = value instanceof File;
                    if (isFile) {
                      formData.append(fieldKey, value);
                    } else {
                      formData.append(fieldKey, JSON.stringify(value));
                    }
                  } else {
                    formData.append(fieldKey, value);
                  }
                });
                return formData;
              }}
            />
          )}
          roleConfig={{
            canRead: true,
            canCreate: this.props.canCreate,
            canUpdate: this.props.canUpdate,
            canDelete: this.props.canDelete,
          }}
          showBreadcrumb={showBreadcrumb}
          syncWithUrl={syncWithUrl}
          editAfterSaved={editAfterSaved}
        />
      </div>
    );
  }
}

export default index;
