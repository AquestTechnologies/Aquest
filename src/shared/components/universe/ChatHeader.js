import React from 'react';
import Icon from '../common/Icon';

export default class ChatHeader extends React.Component {
  
  render() {
    
    return (
      <div className="chatHeader">
        <div className="chatHeader_left"><Icon name="pin2" cssclass="chatHeader_left_icon" /></div>
        <div className="chatHeader_title">{this.props.chatName}</div>
        <div className="chatHeader_right"></div>
      </div>
    );
  }
}
