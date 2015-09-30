import React from 'react';
import Icon from '../common/Icon';

export default class Message extends React.Component {
  
  render() {
    
    const { id, userId, type, content: {text}, createdAt } = this.props;
    
    return (
      <div className="message">
        <Icon name="disk" cssclass="message_icon" />
        <div className="message_body">
          <div className="message_author">
            {userId} {id}
          </div>
          <div className="message_content">
            {text}
          </div>
          {createdAt ? 
            <span>{createdAt}</span> : 
            <span>loading</span>}
        </div>
      </div>
    );
  }
}
