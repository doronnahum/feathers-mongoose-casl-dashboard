/* eslint-disable react/prefer-stateless-function */
/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { Selector } from 'net-provider';
import Dashboard from './Dashboard';

class DashboardWrapper extends Component {
  render() {
    const {
      renderDefaultScreen,
      showBreadcrumb,
      syncWithUrl,
      rowSelection,
      listTargetKeyPrefix,
      url,
      onRow,
      editAfterSaved,
      customRenderField,
      customElements,
      docProps,
      listProps,
    } = this.props;
    if (!url) {
      return renderDefaultScreen ? renderDefaultScreen(this.props) : '';
    }
    const dashboardData = this.props.dashboardData || [];
    const data = dashboardData.find((item) => (item.result.name === url));
    if (!data) return '...';
    const dashboardConfig = data.data.dashboardConfig || {};
    return (
      <Dashboard
        key={url}
        url={url}
        canCreate={data.result.canCreate && !dashboardConfig.hideNewButton === true}
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
        customRenderField={customRenderField}
        customElements={customElements}
        docProps={docProps}
        listProps={listProps}
        actionButtonsPosition={dashboardConfig.actionButtonsPosition || 'end'}
      />
    );
  }
}

export default class DashboardApp extends Component {
  render() {
    return (
      <Selector targetKey="dashboard">
        {({ data }) => <DashboardWrapper dashboardData={data} {...this.props} />}
      </Selector>
    );
  }
}

DashboardWrapper.defaultProps = {
  syncWithUrl: true,
  showBreadcrumb: true,
  editAfterSaved: true,
};
