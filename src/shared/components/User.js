import React from 'react';
import { Link } from 'react-router';
import Icon from './common/Icon';

export default class User extends React.Component {
  
  render() {
    // CSS temporaire
    const _user_ = {
      width: '100%',
      fontSize: '2rem'
    };
    const _user_name_ = {
      marginTop: '5%',
      textAlign: 'center',
      width: '100%',
      fontSize: '5rem'
    };
    
    const { session: {userId}, users } = this.props;
    const { id, firstName, lastName, email, bio, picture } = users[userId];
    
    return (
      <div style={_user_}>
        <div style={_user_name_}>
          {id}
          <br/>
          <br/>
        <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/y1txYjoSQQc?rel=0&amp;showinfo=0" frameBorder="0" allowFullScreen></iframe>
        </div>
      </div>
    );
  }
}
