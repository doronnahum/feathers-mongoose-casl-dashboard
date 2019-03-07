import React, { Component } from 'react';
import Dashboard from './Dashboard';
import connect from './connect';
import { getDeepObjectValue } from 'validate.js';
class DashboardWrapper extends Component {
  render() {
    const {showBreadcrumb, syncWithUrl, rowSelection, listTargetKeyPrefix, routePathname, routeQuery, url} = this.props
    if(!url) {
      return 'Missing Url'
    }
    const dashboardData = getDeepObjectValue(this.props, 'dashboard.data') || [];
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
        jsonSchema={data.schema}
        showBreadcrumb={showBreadcrumb}
        syncWithUrl={syncWithUrl}
        rowSelection={rowSelection}
        listTargetKeyPrefix={listTargetKeyPrefix}
        populate={dashboardConfig.populate}
        dashboardData={dashboardData}
        routePathname={routePathname}
        routeQuery={routeQuery}
      />
    );
  }
}

export default connect(DashboardWrapper);

DashboardWrapper.defaultProps = {
  syncWithUrl: true,
  showBreadcrumb: true
};
