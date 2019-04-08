import React, { Component } from 'react';
import {FeathersAdmin, listViews, docViews} from 'redux-admin' //  'src/components/redux-admin'
import getListFields from './getListFields';
import getDocFields from './getDocFields';
import getInitialValues from './getInitialValues';
import startCase from 'lodash/startCase';
// import {buildYup} from './utils/json-schema-to-yup/index';
import {buildYup} from 'json-schema-to-yup';
import cloneDeep from 'lodash/cloneDeep';
import { getDeepObjectValue } from 'validate.js';
class index extends Component {
  constructor(props) {
    super(props)
    this.docFields = null;
    this.listFields = null;
    this.yup = null;
  };

  getDocTitle = (data) => {
    const name = startCase(this.props.url)
    if(data && data._id) {
      return `${name} ${data.name || data._id}`
    }else {
      return `New ${name}`
    }
  }

  fixJsonSchemaRequires(jsonSchema) {
    const _schema = cloneDeep(jsonSchema);
    if(_schema.properties) {
      // remove hidden fields and fix required fields
      const required = jsonSchema.required || []
      let fields = Object.keys(_schema.properties) || [];
      const newProperties = {};
      fields.forEach(filedKey => {
        const field = _schema.properties[filedKey]
        if(field.type === 'object' && field.required) {
          required.push(filedKey)
          field.required.forEach(innerField => required.push(`${filedKey}.${innerField}`))
        }
        const dashboard = getDeepObjectValue(field, 'meta.0.dashboard');
        if(dashboard && dashboard.hide) {
          return;
        }
        newProperties[filedKey] = field;
        const isRequired = required.includes(field)
        if(isRequired) {
          const fieldConfig = jsonSchema.properties[field];
          if(fieldConfig.type === 'string') {
            if(!fieldConfig.minLength) {
              _schema.properties[field] = Object.assign({}, _schema.properties[field], {minLength: 1});
            }
          }
        }
      })
      _schema.properties = newProperties;
    }
    return _schema
  }
  getJoiSchema(jsonSchema) {
    if(this.yup) return this.yup
    try {
      const _jsonSchema = this.fixJsonSchemaRequires(jsonSchema)
      const yup = buildYup(_jsonSchema)
      if(yup) {
        this.yup = yup;
      }
      return this.yup;
    } catch (error) {
      console.log('getJoiSchema error', error)
    }
    return this.yup;
  }
  getDefaultOptions = () => {
    const {populate} = this.props
    if(populate) return {$populate: populate.join(',')};
    return null;
  }
  render() {
    const {url, jsonSchema, updateFields, createFields, showBreadcrumb, syncWithUrl, listTargetKeyPrefix, dashboardData, editAfterSaved} = this.props;
    if(!jsonSchema || !url) return ''
    this.joiSchema = this.joiSchema || this.getJoiSchema(jsonSchema);
    const defaultOptions = this.getDefaultOptions()
    return (
      <div className={`screen-${url}`}>
        <FeathersAdmin
          title={url}
          defaultOptions={defaultOptions}
          getDocTitle={this.getDocTitle}
          url={url}
          listTargetKeyPrefix={listTargetKeyPrefix}
          list={
            <listViews.Table
              getColumns={(props) => {
                this.listFields = this.listFields || getListFields(props, jsonSchema);
                return this.listFields;
              }}
              rowSelection={this.props.rowSelection}
              onRow={this.props.onRow}
            />
          }
          doc={
            <docViews.SimpleDoc
              immutableKeys={['_id', 'updatedAt', 'createdAt']}
              getDocFields={(props) => {
                this.docFields = this.docFields || getDocFields(props, jsonSchema, {createFields, updateFields}, dashboardData)
                return this.docFields;
              }}
              newDocInitialValues ={getInitialValues(jsonSchema)}
              validationSchema={this.joiSchema}
              getHeadersBeforeSubmit={({dataToSend}) => {
                const allFields = Object.keys(dataToSend)
                const hasFile = allFields.some(item => {
                  const val = dataToSend[item];
                  return (val && typeof val === 'object' && val instanceof File)
                })
                if(hasFile) return {'content-type': 'multipart/form-data'}
                return null
              }}
              parseDataBeforeSubmit={({dataToSend}) => {
                const allFields = Object.keys(dataToSend)
                const hasFile = allFields.some(item => {
                  const val = dataToSend[item];
                  return (val && typeof val === 'object' && val instanceof File)
                })
                if(!hasFile) return dataToSend
                else{
                  var formData = new FormData();
                  allFields.forEach(fieldKey => {
                    let value = dataToSend[fieldKey];
                    if(typeof value === 'object') {
                      const isFile = value instanceof File;
                      if(isFile) {
                        formData.append(fieldKey, value)
                      }else{
                        formData.append(fieldKey, JSON.stringify(value))
                      }
                    }else{
                      formData.append(fieldKey, value);
                    }
                  })
                  return formData;
                }
              }}
            />
          }
          roleConfig={{
            canRead: true,
            canCreate: this.props.canCreate,
            canUpdate: this.props.canUpdate,
            canDelete: this.props.canDelete
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
