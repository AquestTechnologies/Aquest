import React from 'react';

export default class ChatFooter extends React.Component {
  
  constructor() {
    super();
    this.handleChange = e => this.setState({messageContent: e.currentTarget.value});
    this.state = {
      messageContent: 'Press Enter to discuss',
      messageId: 0
    };
    this.handleSubmit = e => {
      e.preventDefault();
      
      const {messageId} = this.state;
      
      const messageParams = {
        chatId:   this.props.chatId,
        message: {
          id: `lc-${messageId}`,
          content:  {type: 'text', text: this.state.messageContent}
        }
      };
      
      this.setState({messageContent: '', messageId: messageId + 1});
      
      this.props.emitCreateMessage(messageParams);
    };
  }
  
  render() {
    var {messageContent} = this.state;
    return (
      <div className="chatFooter">
        <form className='chatForm' onSubmit={this.handleSubmit}>
          <textarea value={messageContent} onChange={this.handleChange} className="chatFooter_input"/>
          <div className="chat_submit">
            <input type='submit' value='send' />
          </div>
        </form>
      </div>
    );
  }
}
