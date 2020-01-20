import React, { Component } from 'react';
import { Button } from 'antd';
import { Formik } from 'formik';
import { docHelpers } from 'redux-admin'; //  ''redux-admin'';
import { NetProvider } from 'net-provider'; // 'src/components/net-provider';
import JSONPretty from 'react-json-pretty';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  renderForm = ({ crudActions }) => (
      <Formik
        validate={(values) => {
          const errors = {};
          if (!values.serviceName || !values.serviceName.length) {
            errors.serviceName = 'Required';
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(true);
          crudActions.Refresh({
            url: 'user-abilities',
            params: values,
            customHandleResponse: (res) => res.data,
            onEnd: () => setSubmitting(false),
            onFailed: () => setSubmitting(false),
          });
        }}
      >
        {({ isValid, resetForm, touched, values, errors, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
              {docHelpers.getDocField({
                key: 'serviceName',
                label: 'Service Name',
                type: 'string',
              })}
              {docHelpers.getDocField({
                referenceKey: 'users-abilities-ref',
                key: 'userId',
                label: 'User Id',
                type: 'string',
                ref: 'users',
                optionLabel: 'email',
                getParamsByValue: () => { },
              })}
              {docHelpers.getDocField({
                key: 'userId',
                label: 'User Id',
                type: 'string',
              })}
              <Button htmlType="submit" disabled={isSubmitting || !isValid}>SEND</Button>
            </form>
          )}
      </Formik>
    )

  renderResults(data) {
    return (data && data.data && data.data.result) ? (
<div>
      <h2>Result</h2>
      <JSONPretty id="json-pretty" data={data.data.result} />
</div>
) : '';
  }

  render() {
    return (
      <NetProvider
        targetKey="user-abilities-check"
        clearOnUnMount
      >
        {({ data, error, crudActions }) => (
            <div className="userAbilities__wrapper">
              <div className="userAbilities__form">{this.renderForm({ crudActions })}</div>
              <div className="userAbilities__results">
                {error && <div>{error}</div>}
                {this.renderResults({ data })}
              </div>
            </div>
          )}
      </NetProvider>
    );
  }
}

export default index;
