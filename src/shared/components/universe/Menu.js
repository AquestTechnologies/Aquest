import React from 'react';
import Icon from '../common/Icon';
import { Link } from 'react-router';

export default class Menu extends React.Component {
  
  renderBackTo() {
    const { universeId, universeName, topicId, pathName } = this.props;
    if (topicId || (pathName ? pathName.split('/')[2] === 'Create_topic' : false)) return (
      <div className='menu_item menu_backTo'>
        <Link to={'/~' + universeId}>
            <div>Back to</div>
            <div className='menu_backTo_label'>{universeName}</div>
        </Link>
      </div>
    );
  }
  
  render() {
    
    return (
      <div className='menu'>
        
        <div className='menu_left'>
          
          <div className='menu_item'>
            <Link to='/@admin'>
                <Icon name='disk' cssclass='menu_item_icon' />
                <span className='menu_item_label'>{'admin'}</span>
            </Link>
          </div>
          <div className='menu_item'>
            <Link to='/Explore'>
              <Icon name='globe' cssclass='menu_item_icon' />
              <span className='menu_item_label'>{'Explore'}</span>
            </Link>
          </div>  
          
        </div>
        
        { this.renderBackTo() }
        
        <div className='menu_right'>
          
          <div className='menu_item'>
            <Link to='/about'>
              <Icon name='disk' cssclass='menu_item_icon' />
              <span className='menu_item_label'>{'About Aquest'}</span>
            </Link>
          </div> 
          
          <div className='menu_item'>
            <Icon name='magnifier' cssclass='menu_item_icon' />
            <span className='menu_item_label'>{'Feature comming soon'}</span>
          </div>
          
        </div>
        
      </div>
    );
  }
}
