import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUniverse, readUniverses } from '../actionCreators';

const defaultRanks = ['beginner', 'trainee', 'recruit', 'aspirant', 'challenger', 'warrior', 'priest', 'guru', 'expert', 'Grand Master'];
const defaultPictures = [
  {
    url: 'http://d2ifokkknaunnx.cloudfront.net/pillars.png',
    name: 'Blue creation',
    description: 'Hubble took this one.',
  },
  {
    url: 'http://d2ifokkknaunnx.cloudfront.net/forest.png',
    name: 'Green forest',
    description: 'Welcome to the jungle.',
  },
  {
    url: 'http://d2ifokkknaunnx.cloudfront.net/designer.png',
    name: 'Orange design',
    description: 'For work or play.',
  },
];

class CreateUniverse extends React.Component {
  
  constructor() {
    super();
    
    this.updateRelated = related => this.setState({ related });
    this.handlePictureSelection = picture => this.setState({picture});
    this.handleDescriptionInput = event => this.setState({description: event.currentTarget.value});
    this.handleNameInput = event => {
      const { ranks, modifiedRanks } = this.state;
      const name = event.currentTarget.value;
      this.setState({
        name,
        ranks: ranks.map((r, i) => modifiedRanks.indexOf(i) === -1 ? `${name} ${defaultRanks[i]}` : r),
      });
    };
    this.handleRankInput = (i, event) => {
      const {ranks, modifiedRanks} = this.state;
      const newRanks = ranks.slice();
      newRanks[i] = event.currentTarget.value;
      this.setState({
        ranks: newRanks,
        modifiedRanks: modifiedRanks.indexOf(i) === -1 ? modifiedRanks.concat([i]) : modifiedRanks,
      });
    };
    this.handleSubmit = event => {
      event.preventDefault();
      const params = Object.assign({}, this.state);
      delete params.modifiedRanks;
      this.props.createUniverse(params);
    };
    
    this.state = {
      name: '',
      description: '',
      related: [],
      ranks: defaultRanks,
      modifiedRanks: [],
      picture: defaultPictures[0].url,
    };
  }
  
  componentDidMount() {
    if (Object.keys(this.props.universes).length < 2) this.props.readUniverses(); 
  }
  
  renderBackGroundImage() {
    const containerStyle = {
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'space-between',
    };
    
    const imageStyle = {
      maxWidth: '100%',
      maxHeight: '100%',
    };
    
    const setItemStyle = url => ({
      maxWidth: '25%',
      maxHeight: '45%',
      overflow: 'hidden',
      border: url === this.state.picture ? '2px solid green' : 'none',
    });
    
    const images = defaultPictures.map(({url, name, description}) =>
      <div style={setItemStyle(url)} onClick={this.handlePictureSelection.bind(this, url)} key={name}>
        <div>{ name }</div>
        <div>{ description }</div>
        <img src={url} style={imageStyle}/>
      </div>
    );
    
    return <div style={containerStyle}>
      { images }
    </div>;
  }
  
  renderRanks() {
    return <div>
    {
      this.state.ranks.map((r, i) => 
      <div key={i}>
        <div>{ `Level ${i + 1}:`}</div>
        <input type='text' value={r} onChange={this.handleRankInput.bind(this,i)} />
      </div>
      )
    }
    </div>;
  }
  
  render() {
    const divStyle = {
      width: '60%',
      margin: '20 auto 0 auto',
      fontSize: '2rem',
    };
    
    const { name, description, related } = this.state;
    
    return (
      <div style={divStyle} >
        <Link to='Explore'>Back</Link>
        <h1>Create New Universe</h1>
        
        <form className='universeFrom' onSubmit={this.handleSubmit}>
          <div>
            <div>Name (unique)</div>
            <input type="text" value={name} onChange={this.handleNameInput} />
          </div>
          
          <br />
          <div>
            <div>Description</div>
            <textarea value={description} onChange={this.handleDescriptionInput} />
          </div>
          
          <br />
          <div>
            <div>Related universes</div>
            <TagsInput 
              selection={related} 
              list={this.props.universes} 
              update={this.updateRelated}
            />
            
          </div>
          
          <br />
          <div>
            <div>Background image</div>
            { this.renderBackGroundImage() }
          </div>
          
          <br />
          <div>
            <div>Ranks names</div>
            { this.renderRanks() }
          </div>
          
          <br />
          <input type="submit" value='Create universe!' />
        </form>
        
      </div>
    );
  }
}

const mapState = state => ({ universes: state.universes });
const mapActions = dispatch => bindActionCreators({ createUniverse, readUniverses }, dispatch);

export default connect(mapState, mapActions)(CreateUniverse);

class TagsInput extends React.Component {
  
  constructor() {
    super();
    
    this.descriptionCut = 50;
    this.maxItemsInList = 10; // à passer en props ?
    
    this.state = {
      inputValue: '',
      enhancedList: [],
      highlightList: [],
      highlightPosition: 0,
    };
  }
  
  componentWillReceiveProps(nextProps) {
    this.createEnhancedList(nextProps.list);
  }
  
  componentWillMount() {
    this.createEnhancedList(this.props.list);
  }
  
  createEnhancedList(list) {
    const keys = Object.keys(list);
    if (this.state.enhancedList.length === keys.length) return;
    
    const enhancedList = [];
    keys.sort().forEach(key => {
      const {name, description} = list[key];
      enhancedList.push({name, description, key});
    });
    this.setState({ enhancedList });
  }
  
  handleInput(event) {
    const { selection } = this.props;
    const { enhancedList } = this.state;
    const { value } = event.currentTarget;
    
    this.setState({ 
      inputValue: value,
      highlightPosition: 0,
      highlightList: !value ? [] : enhancedList
      .filter(({name, key}) => name.toLowerCase().startsWith(value.toLowerCase()) && selection.indexOf(key) === -1)
      .slice(0, this.maxItemsInList),
    });
  };
  
  handleKeyDown(event) {
    const { keyCode } = event;
    const { selection, update } = this.props;
    const { inputValue, highlightList, highlightPosition } = this.state;
    
    switch(keyCode) {
      
      // BackSpace
      case 8:
        if (!inputValue) this.removeItem(selection.length - 1);
        return;
      
      // Up
      case 38:
        if (highlightList.length) {
          event.preventDefault();
          this.setState({
            highlightPosition: Math.max(highlightPosition - 1, 0)
          });
        }
        return;
        
      // Down
      case 40:
        if (highlightList.length) {
          event.preventDefault();
          this.setState({
            highlightPosition: Math.min(highlightPosition + 1, highlightList.length - 1)
          });
        }
        return;
      
      
      case 9: // Tab
      case 13: // Enter
      case 188: // Comma
        event.preventDefault(); // Not in if
        if (inputValue) {
          const selectedItem = highlightList[highlightPosition];
          if (selectedItem) {
            update(selection.concat([selectedItem.key]));
            this.setState({
              inputValue: '',
              highlightList: [],
              highlightPosition: 0,
            });
          }
        }
        return;
    }
    
  };
  
  removeItem(i) {
    const { selection, update } = this.props;
    update(selection.slice(0, i).concat(selection.slice(i + 1, selection.length)));
  }
  
  getItemStyle(i) {
    const { highlightPosition } = this.state;
    return highlightPosition === i ? {
      background: 'LightBlue',
    } : {};
  }
  
  render() {
    const { list, selection } = this.props;
    const { inputValue, highlightList } = this.state;
    const containerStyle = {
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'start',
      padding: '6px 0 0 6px',
      border: '1px solid DarkGrey',
    };
    const selectedStyle = {
      background: '#eee',
      padding: 6,
      margin: '0 6px 6px 0',
    };
    const inputStyle = {
      flexGrow: 1,
      border: 'none',
      outline: 'none',
      padding: '6px 0 6px 0',
      marginBottom: '6px'
    };
    const removeStyle = {
      background: '#ccc',
      color: '#fff',
      fontSize: '0.7em',
      marginLeft: 6,
      cursor: 'pointer',
      padding: '0 3px 0 3px',
    };
    const nameStyle = {
      marginRight: 10,
    };
    const descriptionStyle = {
      fontSize: '0.75em',
    };
    const listStyle = {
      border: '1px solid grey',
      visibility: highlightList.length ? 'visible' : 'hidden',
    };
    
    return <div>
      <div style={containerStyle}>
        { 
          selection.map((selected, i) => 
            <div style={selectedStyle} key={i}>
              { list[selected].name }
              <span style={removeStyle} onClick={this.removeItem.bind(this, i)}>x</span>
            </div>
          )
        }
        <input 
          style={inputStyle}
          value={inputValue} 
          onChange={this.handleInput.bind(this)}
          onKeyDown={this.handleKeyDown.bind(this)}
        />
      </div>
      <div style={listStyle}>
        { 
          highlightList.map(({name, description}, i) => {
            const {descriptionCut} = this;
            const desc = description ? description.length > descriptionCut ?
              description.substr(0, descriptionCut - 4) + '...' : 
              description : '';
            
            return <div key={i} style={this.getItemStyle(i)}>
              <span style={nameStyle}>{ name }</span>
              <span style={descriptionStyle}>{ desc }</span>
            </div>;
          }) 
        }
      </div>
    </div>;
  }
}
