const local = {
  LANG_CODE: 'enUS',
  LANG_DIR: 'ltr',
  RENDER_NEW_DOC_NAME: (name, data) => `New ${name}`,
  SELECT: 'Select',
  RENDER_SELECT_MODAL_TITLE: (fieldName, selectRowCounter) => {
    return `${selectRowCounter} selected`
  }
}
export default local;