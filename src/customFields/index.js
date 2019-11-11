/* eslint-disable react/prop-types */
import React from 'react';
import Link from './Link';
import FormikConnect from './FormikConnect';

// eslint-disable-next-line func-names
export const getCustomField = function ({ item, key, displayLabel, lang, rtl, customRenderField, customElements }) {
  const { customFieldType, customElementName, customElementProps } = item;
  if (customFieldType === 'link') {
    return <Link item={item} key={key} displayLabel={displayLabel} />;
  }
  if (customFieldType === 'customRenderField') {
    if (!customRenderField) {
      throw new Error('Missing customRenderField in your <DashboardApp />');
    }
    return (
      <FormikConnect>
        {(form) => customRenderField({
          field: item,
          fieldKey: key,
          fieldLabel: displayLabel,
          lang,
          rtl,
          form,
        })}
      </FormikConnect>
    );
  }
  if (customFieldType === 'customElements') {
    if (!customElements) {
      throw new Error('Missing customElements in your <DashboardApp />');
    }
    if (!customElements[customElementName]) {
      throw new Error(`Missing ${customElementName} in customElements in your <DashboardApp />`);
    }
    const Element = customElements[customElementName];
    return (
      <FormikConnect>
        {(form) => <Element field={item} fieldKey={key} fieldLabel={displayLabel} lang={lang} rtl={rtl} form={form} customElementProps={customElementProps} />}
      </FormikConnect>
    );
  }
  // eslint-disable-next-line no-console
  console.error('customFieldType is not valid');
  return null;
};
