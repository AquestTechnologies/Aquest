import key from '../vendor/keymaster';

export default function registerShortcuts(getState) {
  
  const getCurrentParams = () => getState().router.params;
  
  key('ctrl+shift+\'', () => console.log('state :', getState()));
  
  key('ctrl+shift+1', () => console.log('universes :', getState().universes));
  
  key('ctrl+shift+2', () => console.log('universe :', getState().universes[getCurrentParams().universeId]));
  
  key('ctrl+shift+3', () => console.log('topics :', getState().topics));
  
  key('ctrl+shift+4', () => console.log('topic :', getState().topics[getCurrentParams().topicId]));
  
  key('ctrl+shift+5', () => console.log('chats :', getState().chats));
  
  key('ctrl+shift+6', () => {
    const {universes, topics, chats} = getState();
    const {universeId, topicId} = getCurrentParams();
    const topic = topics[topicId];
    const universe = universes[universeId];
    console.log('chat : ', universe ? chats[topicId ? topic.chatId : universe.chatId] : undefined);
  });
  
  key('ctrl+shift+7', () => console.log('users :', getState().users));
  
  key('ctrl+shift+8', () => console.log('router :', getState().router));
  
  key('ctrl+shift+9', () => console.log('session :', getState().session));

  key('ctrl+shift+0', () => console.log('records :', getState().records));
}
