import React from 'react';
import Link from './Link';
export const getCustomField = function ({ item, key, displayLabel }) {
  const { customFieldType } = item;
  if (customFieldType === 'link') {
    return <Link item={item} key={key} displayLabel={displayLabel} />
  };
}