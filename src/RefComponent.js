/* eslint-disable react/prefer-stateless-function */
/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { fields } from 'redux-admin'; //  ''redux-admin'';
import { Modal, Tag, Icon, Form } from 'antd';
import isEmpty from 'lodash/isEmpty';
import { NetProvider } from 'net-provider'; // 'src/components/net-provider';
import Dashboard from './DashboardApp.js';
import { LOCALS } from './local';

const { Consumer } = fields;

const getValue = function (props) {
  return props.multiSelect ? (props.value || []) : (props.value ? [props.value] : []);
};
class RefComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      selectedRowKeys: getValue(this.props),
      selectedRowKeysData: [],
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
      selectedRowKeys: getValue(this.props),
    });
  }

  handleOk = (e) => {
    this.props.setFieldValue(this.props.fieldName, this.props.multiSelect ? this.state.selectedRowKeys : this.state.selectedRowKeys[0]);
    this.setState({
      visible: false,
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      selectedRowKeys: getValue(this.props),
    });
  }

  removeItem = (val) => {
    const value = getValue(this.props);
    this.props.setFieldValue(this.props.fieldName, this.props.multiSelect ? value.filter((item) => item !== val) : null);
  }

  renderItem = (item, _disabled) => {
    const { optionKey, optionLabel, multiSelect, disabled, inputType } = this.props;
    const isString = typeof item === 'string';

    const val = isString ? item : item[optionKey];
    const render = (d, imageSrc) => (
      <Tag
        className={multiSelect ? 'ra-refModal__multiTag ra-text-ellipsis' : 'ra-refModal__oneTag ra-text-ellipsis'}
        key={val}
        closable={!disabled || !_disabled}
        onClose={() => this.removeItem(val)}
      ><a href={`/dashboard?screen=${this.props.url}&e=${isString ? item : item._id}`} target="_blank">{imageSrc ? <img className='ra-refModal__tag_image' src={imageSrc} height={45} style={{ margin: 15 }} alt={d} /> : d}</a>
      </Tag>
    );
    // item is object
    if (!isString) {
      const imageSrc = inputType === 'imageView' && item.file;
      return render(item[optionLabel] || item[optionKey], imageSrc);
    }
    // item is String
    if (optionLabel) {
      let fullObject = this.state.selectedRowKeysData.find((obj) => obj[optionKey] === item);
      const imageSrc = inputType === 'imageView' && fullObject && fullObject.file;
      // if (fullObject && fullObject.)
      if (fullObject) return render(fullObject[optionLabel] || item, imageSrc);
      return (
        <NetProvider
          loadData={{
            url: `${this.props.url}/${item}`,
            targetKey: `ref-displayKey-${this.props.url}/${item}`,
            customHandleResponse: (res) => res.data,
            onEnd: ({ data }) => {
              const selectedRowKeysData = [...this.state.selectedRowKeysData, data];
              this.setState({ selectedRowKeysData });
            },
          }}
        >
          {({ data }) => {
            fullObject = data || {};
            const imageSrc = inputType === 'imageView' && fullObject.file;
            return render(fullObject[optionLabel] || item, imageSrc);
          }}
        </NetProvider>
      );
    }
    return render(item);
  }

  renderValue = () => {
    const { value, multiSelect, disabled } = this.props;
    const _isEmpty = isEmpty(value);
    const showPanIcon = !multiSelect && !_isEmpty;
    return (
      <div className={`ra-refModal__input ${_isEmpty ? ' --empty' : ''} ${disabled ? ' --disabled' : ''}`} onClick={(_isEmpty && !disabled) && this.showModal}>
        {_isEmpty
          ? this.renderEmpty()
          : multiSelect
            ? value.map((item) => this.renderItem(item, disabled))
            : this.renderItem(value, disabled)}
        {!disabled && <Icon className="ra-refModal__input__plus" type={showPanIcon ? 'edit' : 'plus-square'} onClick={this.showModal} />}
      </div>
    );
  }

  renderEmpty = () => (this.props.multiSelect ? LOCALS.CLICK_TO_SELECT_MANY : LOCALS.CLICK_TO_SELECT_ONE)

  onSelect = (record) => {
    let selectedRowKeys = [...this.state.selectedRowKeys];
    const selectedRowKeysData = [...this.state.selectedRowKeysData, record];
    const isSelected = selectedRowKeys.find((item) => item === record._id);
    if (isSelected) {
      selectedRowKeys = selectedRowKeys.filter((item) => item !== record._id);
    } else {
      selectedRowKeysData.push(record);
      selectedRowKeys.push(record._id);
    }
    if (this.props.multiSelect) {
      this.setState({ selectedRowKeys, selectedRowKeysData });
    } else {
      if (isSelected) this.setState({ selectedRowKeys: [], selectedRowKeysData });
      if (!isSelected) this.setState({ selectedRowKeys: [record._id], selectedRowKeysData });
    }
  }

  render() {
    const { selectedRowKeys } = this.state;
    const { url, multiSelect, fieldName, label, fieldError, required, helpText } = this.props;
    const selectRowCounter = ` - (${selectedRowKeys.length})`;
    return (
      <Form.Item label={label} className={`ra-docFieldWrapper ra-docField-${fieldName}`} required={required} hasFeedback={fieldError} help={fieldError || helpText} validateStatus={fieldError ? 'error' : 'validating'}>
        {this.renderValue()}
        <Modal
          title={LOCALS.RENDER_SELECT_MODAL_TITLE(fieldName, selectRowCounter)}
          destroyOnClose
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="calc(100% - 20px)"
          style={{ top: 10 }}
          className="ra-refModal"
          closable={false}
          okText={LOCALS.SELECT}
        >
          <Dashboard
            listTargetKeyPrefix="RefComponent"
            selectMode
            url={url}
            // onSelect={value => setFieldValue(name, value)}
            showBreadcrumb={false}
            syncWithUrl={false}
            rowSelection={{
              selectedRowKeys: this.state.selectedRowKeys,
              onSelect: (row, record, rows) => this.onSelect(row),
              type: multiSelect ? 'checkbox' : 'radio',
            }}
            onRow={(record) => ({
              onClick: () => this.onSelect(record),
            })}
            editAfterSaved={false}
            customElements={this.props.customElements}
          />
        </Modal>
      </Form.Item>
    );
  }
}

class RefComponentWithValue extends React.Component {
  render() {
    const { inputType } = this.props;
    const { name, multiSelect, optionKey, optionLabel, label, required, disabled, helpText, customElements } = this.props.fieldProps;
    console.log({
      p: this.props
    })
    return (
      <Consumer>
        {(form) => {
          const { setFieldValue, values, errors } = form;
          const value = fields.util.getFieldValueByName(name, values);
          const fieldError = fields.util.getFieldErrorByName(name, errors);
          return <RefComponent disabled={disabled} fieldError={fieldError} required={required} label={label} optionKey={optionKey} optionLabel={optionLabel} url={this.props.url} value={value} setFieldValue={setFieldValue} fieldName={name} multiSelect={multiSelect} inputType={inputType} helpText={helpText} customElements={customElements} />;
        }}
      </Consumer>
    );
  }
}

export default RefComponentWithValue;
