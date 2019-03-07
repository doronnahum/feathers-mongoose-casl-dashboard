import React, { Component } from 'react'
import { NetProvider } from 'net-provider';

export default class UserAbilityMenu extends Component {
  render() {
    return (
      <NetProvider
        loadData={{
          targetKey: 'user-abilities',
          url: 'user-abilities',
          params: {serviceName: 'user-abilities'},
          customHandleResponse: (res) => { return res.data.data },
          getCountFromResponse: (res) => { return res.data.total },
        }}
        clearOnUnMount={false}
      >
        {({data, error}) => {
          if (!data || error) return null
          return this.props.renderItem();
        }}
      </NetProvider>
    )
  }
}
