import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { logout, createUser } from '../actionCreators';
import LoadingBar from './app/LoadingBar';
import ErrorBar from './app/ErrorBar';
import Home from './app/Home';
// import websocket from 'socket.io-client';

class App extends React.Component {
  
  render() {
    const { children, userId, records, logout, createUser, lastError } = this.props;
    
    return (
      <div> 
        <ErrorBar lastError={lastError} />
        <LoadingBar records={records} />
        { children ? children : <Home userId={userId} logout={logout} createUser={createUser} /> }
      </div>
    );
  }
}

const mapState = state => ({ 
  records: state.records,
  lastError: state.lastError,
  userId: state.session.userId,
});
const mapActions = dispatch => bindActionCreators({ logout, createUser }, dispatch);

export default connect(mapState, mapActions)(App);
