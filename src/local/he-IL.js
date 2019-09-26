const local = {
  LANG_CODE: 'heIL',
  LANG_DIR: 'rtl',
  RENDER_NEW_DOC_NAME: (name, data) => `${name} חדש`,
  SELECT: 'בחר',
  RENDER_SELECT_MODAL_TITLE: (fieldName, selectRowCounter) => {
    return ` נבחרו ${selectRowCounter}`
  }
}
export default local;