import React from 'react';

class CreateTopicCard extends React.Component {
  
  handleClick(transitionTo, universeId) { 
    transitionTo(`/~${universeId}/Create_topic`);
  };
  
  render() {
    const { title, title2, author, description, transitionTo, universeId } = this.props;
    
    return (
      <div className="newTopicCard" onClick={this.handleClick.bind(this, transitionTo, universeId)}>
      
        <div className="card_content">
          <div className="newTopicCard_title">
            <div>{ title }</div>
            <div>{ title2}</div>
          </div>
          <div className="newTopicCard_author">
            { author }
          </div>
          <div className="newTopicCard_description">
            { description }
          </div>
        </div>
        
      </div>
    );
  }
}

CreateTopicCard.defaultProps = {
    title: "Tell them what you love,",
    title2: "Ask for the impossible.",
    author: "By you, in a minute.",
    description: "Start a revolution, or a new topic, or both!",
    timestamp:"timestamp"
};

export default CreateTopicCard;
