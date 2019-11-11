import React, { Component } from 'react';
import { NetProvider } from 'net-provider';

export default class DashboardMenu extends Component {
  render() {
    return (
      <NetProvider
        loadData={{
          targetKey: 'dashboard',
          url: 'dashboard',
          customHandleResponse: (res) => res.data.data,
          getCountFromResponse: (res) => res.data.total,
        }}
        clearOnUnMount={false}
      >
        {({ data }) => {
          if (!data) return '';
          return data.filter((item) => item.schema).map(this.props.renderItem);
        }}
      </NetProvider>
    );
  }
}
