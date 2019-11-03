// eslint-disable-next-line no-unused-vars
import React from 'react';
import { connect } from 'formik';

const Consumer = props => {
  // All FormikProps available on props.formik!
  return props.children(props.formik)
};

export default connect(Consumer);
