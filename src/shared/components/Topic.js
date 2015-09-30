import React from 'react';
import { getAtomViewers } from './atoms';

export default class Topic extends React.Component {
  
  // Load les données initiales
  static runPhidippides(routerState) {
    return [{
      nullIs404: true,
      id:        'topic',
      creator:   'readTopic',
      args:      [routerState.params.topicId],
    }];
  }
  
  componentWillMount() {
    const { universe, topic, topicId, readTopic, readTopicAtoms } = this.props;
    this.atomViewers = getAtomViewers(universe);
    if (!topic) readTopic(topicId);
    else if (!topic.atoms) readTopicAtoms(topicId);
  }
  
  renderAtoms(atoms) {
    
    return atoms.map(({type, content}, i) => {
      const Viewer = this.atomViewers[type];
      
      return <Viewer key={i} content={content} />;
    });
  }
  
  render() {
    const { topic } = this.props || {};
    const { title, userId, createdAt } = topic;
    const atoms = topic.atoms || [{type: 'text', content: {text: 'Loading...'}}];
    
    return !topic ? <div>Loading...</div> : (
      <div>
        <div className="topic">
          <div className="topic_title">
            {title}
          </div>
          <div className="topic_author">
            {`By ${userId}, ${createdAt} ago.`}
          </div>
          <div className="topic_content">
            { this.renderAtoms(atoms) }
          </div>
        </div>
          
      </div>
    );
  }
}
