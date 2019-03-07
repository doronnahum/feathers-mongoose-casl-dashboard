import React, { Component } from 'react'
import { NetProvider } from 'net-provider';

export default class DashboardMenu extends Component {
  render() {
    return (
      <NetProvider
        loadData={{
          targetKey: 'dashboard',
          url: 'dashboard',
          customHandleResponse: (res) => { return res.data.data },
          getCountFromResponse: (res) => { return res.data.total },
        }}
        clearOnUnMount={false}
      >
        {({data}) => {
          if (!data) return ''
          return data.filter(item => item.schema).map(this.props.renderItem)
        }}
      </NetProvider>
    )
  }
}
