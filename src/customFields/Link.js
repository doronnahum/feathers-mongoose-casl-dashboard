import React from 'react';
import FormikConnect from './FormikConnect';
import nunjucks from 'nunjucks';

const LinkField = (props) => {
  const { item, displayLabel } = props
  return (
    <span>
      <FormikConnect>
        {(form) => {
          const { values } = form
          const link = nunjucks.renderString(item.linkTemplate, values);
          const className = item.style === 'button' ? 'ant-btn ant-btn-primary' : ''
          return <a className={className} href={link}><p>{displayLabel}</p></a>
        }}
      </FormikConnect>
    </span>
  )
}


export default LinkField;