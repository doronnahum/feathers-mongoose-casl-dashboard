module.exports = {
  npm: {
    umd: {
      externals: {
        'net-provider': 'net-provider',
        'redux-admin': 'redux-admin',
        'antd': 'antd',
        'formik': 'formik',
        'react': 'React',
        'yup': 'yup',
        'react-redux': 'react-redux',
        'react-dom': 'react-dom'
      }
    }
  }
}