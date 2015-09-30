import React                  from 'react';
import { bindActionCreators } from 'redux';
import { connect }            from 'react-redux';
import Menu       from './universe/Menu';
import Chat       from './universe/Chat';
import Inventory  from './universe/Inventory';
import NotFound   from './common/NotFound';
import Spinner    from './common/Spinner';
import menuScroll from '../../client/lib/menuScroll';
import { readUniverse, readInventory, readChat, readTopic, readTopicAtoms, emitJoinChat, emitLeaveChat, readChatOffset, emitCreateMessage, transitionTo } from '../actionCreators';

class Universe extends React.Component {
  
  static runPhidippides(routerState) {
    const { universeId, topicId } = routerState.params;
    const tasks = [{
      nullIs404:  true,
      id:         'universe',
      creator:    'readUniverse',
      args:       [universeId],
    },{
      id:         'chat',
      dependency: topicId ? 'topic' : 'universe',
      creator:    'readChat',
      args:       ['__dependency.chatId']
    }];
    const inventory = {
      id:         'inventory',
      dependency: 'universe',
      creator:    'readInventory',
      args:       ['__dependency.id']
    };
    return topicId ? tasks : tasks.concat(inventory);
  }
  
  componentDidMount() {
    const { universes, readUniverse, params: { universeId } } = this.props;
    if (!universes[universeId]) readUniverse(universeId);
    menuScroll('main_scrollable');
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentPath !== this.props.currentPath) document.getElementsByClassName('menu')[0].style.top = 0;
  }
  
  createTopicsList(topics, universeId) {
    const list = [];
    for (let key in topics) {
      if (topics.hasOwnProperty(key) && topics[key].universeId === universeId) list.push(topics[key]); 
    }
    return list;
  }
  
  render() {
    // console.log('.C. Universe.render');
    const { 
      universes, topics, chats, userId,
      readInventory, transitionTo, readTopic, readTopicAtoms,
      readChat, emitJoinChat, emitLeaveChat, readChatOffset, emitCreateMessage,
      children, location: { pathname }, params: { universeId, topicId },
    } = this.props;
    
    const universe = universes[universeId];
    const topic = topicId ? topics[topicId] : undefined;
    const chatId = universe ? topic ? topic.chatId : universe.chatId : undefined;
    const filteredTopics = !children ? this.createTopicsList(topics, universeId) : undefined;
    const chat = chatId ? chats[chatId] : undefined;
    
    return !universe ? <Spinner /> : universe.notFound || (topic && topic.notFound) ? <NotFound /> : (
      <div> 
        <Menu 
          topicId={topicId}
          pathName={pathname}
          universeId={universeId} 
          universeName={universe.name} 
        />
        
        <div className='universe_main' style={{backgroundImage: `url(${universe.picture})`}}>
          <div className='universe_main_scrollable' id='main_scrollable'>
            <div className='universe_main_scrolled'> { 
              
              children ? 
                React.cloneElement(children, {
                  topic,
                  userId,
                  topicId,
                  universe,
                  readTopic, // If not passed here, Topic does not re-render after atoms fetch
                  readTopicAtoms, 
                }) 
                :
                <Inventory 
                  universe={universe}
                  topicsList={filteredTopics}
                  transitionTo={transitionTo}
                  readInventory={readInventory}
                />
                
            } </div>
          </div>
        </div>  
        
        <Chat 
          chat={chat} 
          chatId={chatId}
          userId={userId}
          readChat={readChat}
          emitJoinChat={emitJoinChat}
          emitLeaveChat={emitLeaveChat}
          readChatOffset={readChatOffset}
          emitCreateMessage={emitCreateMessage}
        />
      </div>
    );
  }
}

const mapState = state => ({ 
  chats:        state.chats,
  topics:       state.topics,
  universes:    state.universes,
  userId:       state.session.userId,
  currentPath:  state.router.pathname,
});

const mapActions = dispatch => bindActionCreators({ 
  transitionTo,
  readUniverse, 
  readInventory,
  readTopic,
  readTopicAtoms,
  readChat,
  emitJoinChat,
  emitLeaveChat,
  readChatOffset,
  emitCreateMessage,
}, dispatch);

export default connect(mapState, mapActions)(Universe);
