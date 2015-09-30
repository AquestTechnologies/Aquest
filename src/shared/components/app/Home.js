import React from 'react';
import Login from '../Login';
import Signup from './Signup';
import { Link } from 'react-router';
// import { createActivists } from '../../../client/activityGenerator';

export default class Home extends React.Component {
  
  renderLogin() {
    const { userId, logout, createUser } = this.props;
    const s2 = {
      marginTop: '20',
    };
    const s3 = { 
      display : 'flex', 
      alignContent: 'space-between',
    };
    
    return userId ?
      <div style={s2}>
        <button onClick={logout}>Logout</button>
      </div> 
      :
      <div style={s3}>
        <Login />
        <Signup createUser={createUser}/>
      </div>;
  }
  
  render() {
    const s1 = {
      fontSize: '2rem',
      width: '60%',
      margin: '0 auto 0 auto',
    };
    
    return (
      <div style={s1}>    
        <h1>Aquest</h1>
        <Link to='/Explore'>Explore</Link>
        { ' - ' }
        <Link to='/~YOLO404'>Test 404</Link>
        
        { this.renderLogin() }
      </div>
    );
  }
}
