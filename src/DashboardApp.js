import React, { Component } from 'react';
import Dashboard from './Dashboard';
import { Selector } from 'net-provider'
class DashboardWrapper extends Component {
  render() {
    const {showBreadcrumb, syncWithUrl, rowSelection, listTargetKeyPrefix, url, onRow, editAfterSaved} = this.props
    if(!url) {
      return 'Missing Url'
    }
    const dashboardData = this.props.dashboardData || [];
    const data = dashboardData.find(item => (item.result.name === url));
    if(!data) return '...'
    const dashboardConfig = data.data.dashboardConfig || {};
    return (
      <Dashboard
        key={url}
        url={url}
        canCreate={data.result.canCreate}
        canUpdate={data.result.canUpdate}
        canDelete={data.result.canDelete}
        updateFields={data.result.updateFields}
        createFields={data.result.createFields}
        dashboardConfig={dashboardConfig}
        jsonSchema={data.schema}
        showBreadcrumb={showBreadcrumb}
        syncWithUrl={syncWithUrl}
        rowSelection={rowSelection}
        listTargetKeyPrefix={listTargetKeyPrefix}
        populate={dashboardConfig.populate}
        dashboardData={dashboardData}
        onRow={onRow}
        editAfterSaved={editAfterSaved}
      />
    );
  }
}

export default class DashboardApp extends Component {
  render() {
    return (
      <Selector targetKey={'dashboard'}>
        {({data}) => {
          return <DashboardWrapper dashboardData={data} {...this.props}/>
        }}
      </Selector>
    )
  }
}

DashboardWrapper.defaultProps = {
  syncWithUrl: true,
  showBreadcrumb: true,
  editAfterSaved: true
};
