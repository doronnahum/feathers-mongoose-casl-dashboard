
import { connect } from 'react-redux';
import {selectors} from 'net-provider' // 'src/components/net-provider'

const mapStateToProps = state => ({
  dashboard: selectors.getCrudObject(state, 'dashboard')
});


export default comp => connect(mapStateToProps, null)(comp);
