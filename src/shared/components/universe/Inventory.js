import React from 'react';
import Card  from './Card';
import CreateTopicCard from './CreateTopicCard';

export default class Inventory extends React.Component {
  
  constructor() {
    super();
    
    this.state = { nameVisible: true };
    this.handleHeaderHover = () => this.setState({nameVisible: !this.state.nameVisible});
  }
  
  componentWillMount() {
    const { universe: { id, lastInventoryUpdate }, readInventory } = this.props;
    if (!lastInventoryUpdate) readInventory(id);
  }
  
  render() {
    const { nameVisible } = this.state;
    const { universe: { id, name, description }, topicsList, transitionTo } = this.props;
    
    return (
      <div>
      
        <div className='inventory_header'>
          <div className='inventory_header_content' onMouseOver={this.handleHeaderHover} onMouseOut={this.handleHeaderHover}>
            <div className={nameVisible ? 'inventory_header_content_name' : 'inventory_header_content_desc'}>
              { nameVisible ? name : description }
            </div>
          </div>
        </div>  
        
        <div className='inventory_list'>
          
          <CreateTopicCard 
            universeId={id} 
            transitionTo={transitionTo}
          />
          
          { 
            topicsList.map(topic => 
              <Card
                topic = {topic}
                key = {topic.id} 
                transitionTo={transitionTo}
              />)
          }
          
        </div>
        
      </div>
    );
  }
  
}
