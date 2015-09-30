import React from 'react';

export default class Vote extends React.Component {
  
  constructor() {
    super();
    
    this.handleVote = e => {
      const { id, createVote, messageIndex, chatId, elementId, sessionUserId } = this.props;
      
      console.log({ id, chatId, elementId, sessionUserId, messageIndex });
      
      messageIndex ? 
        createVote({ id, chatId, elementId, sessionUserId, messageIndex }) :
        createVote({ id, chatId, elementId, sessionUserId });
    };
  }
  
  render() {
      
    const { content, users} = this.props;
    return (
      <span className="vote">
        <input type='button' value={`${content} ${users.length}`} onClick={this.handleVote}></input>
        {users.length > 3 ? 
          <span className="voteAuthorsCollapsed">'...'</span> : 
          <span className="voteAuthors"> {users.map( (name) => name)} </span>}
      </span>
    );
  }
}
