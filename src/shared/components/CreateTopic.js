import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createTopic } from '../actionCreators';
import { getAtomCreators, getAtomViewers, getAtomsValidationErrors } from './atoms';

// Atom shape:
// type: string
// state: object
// content: object
// validationErrors: object or undefined
// ready: 'yes' || 'no' || 'pending' || 'error'

export default class CreateTopic extends React.Component {
  
  constructor() {
    super();
    this.state = { 
      atoms: [],
      title: '', 
      titleIsValidated: true, // It's actually false, but otherwise it would display the 'empty title' warning at page load.
      atomsShouldGetReady: false,
    };
  }
  
  // Gets the Creators and Viewers only on client
  componentWillMount() {
    const { id } = this.props.universe;
    this.atomViewers = getAtomViewers(id);
    this.atomCreators = getAtomCreators(id);
  }
  
  // Calls the creation action
  callCreateTopic() {
    
    console.log('createTopic');
    const { title, atoms } = this.state;
    
    // If one of them has some error, we go back to the editing state
    if (atoms.some(({ ready }) => ready === 'error')) return this.setState({ atomsShouldGetReady: false });
    
    // If every atom is ready it's time to create that topic
    if (atoms.every(({ ready }) => ready === 'yes')) {
      const { createTopic, universe: { id } } = this.props;
      
      createTopic({
        title,
        universeId: id,
        atoms: atoms.map(({type, content}) => ({type, content})), // Only the best part goes up
      });
    }
    
  }
  
  handleTitleInput(e) {
    const title = e.currentTarget.value;
    this.setState({
      title,
      titleIsValidated: !!title,
    });
  }
  
  // On submit click, validates the atoms and tell them to get ready
  handleSubmitClick(e) {
    const { title, atoms } = this.state;
    
    const newAtoms = atoms.map(a => Object.assign({}, a));
    const validationErrors = getAtomsValidationErrors(newAtoms);
    const atomsShouldGetReady = title && validationErrors.every(error => !error); // No error? get ready.
    validationErrors.forEach((errors, i) => newAtoms[i].validationErrors = errors);
    
    this.setState({
      atoms: newAtoms,
      atomsShouldGetReady, // This should disableomse UI somehow, so the user cannot modify anything while atoms are getting ready
      titleIsValidated: !!title,
    }, () => {
      console.log('afterSetState');
      if (atomsShouldGetReady) this.callCreateTopic();
    });
  }
  
  // Appends a new atom a the end of the list
  addAtom(type) {
    this.setState({ 
      atoms: [...this.state.atoms, {
        type,
        ready: 'no', // Wasn't born ready
        state: Object.assign({}, this.atomCreators[type].initialState), // Object.assign to get rid of the reference
        content: Object.assign({}, this.atomCreators[type].initialContent),
      }]
    });
  }
  
  // Removes atom at position i
  removeAtom(i) {
    const { atoms } = this.state;
    this.setState({
      // Array.prototype.splice cannot be used here since it is mutative
      atoms: atoms.slice(0, i).concat(atoms.slice(i + 1, atoms.length))
    });
  }
  
  // Moves atoms[i] to atoms[i + n]
  moveAtom(i, n) {
    const j = i + n;
    const atoms = this.state.atoms.map(a => Object.assign({}, a)); // If you mutate your state you go to React hell
    
    // Checks for outer limits exeptions
    if (j < 0 || j > atoms.length - 1) return;
    
    const x = atoms[j];
    atoms[j] = atoms[i];
    atoms[i] = x;
    this.setState({ atoms });
  }
  
  // Updates this component's state when an AtomCreator calls this.props.update()
  updateAtom(i, {content, state, ready}, callback) {
    
    const { atoms, atomsShouldGetReady } = this.state;
    const newAtoms = atoms.map(a => Object.assign({}, a));
    const atom = newAtoms[i];
    
    // Only content, state and ready are allowed to be mutated
    if (content) Object.assign(atom.content, content);
    if (state) Object.assign(atom.state, state);
    if (ready !== undefined) atom.ready = ready;
    
    this.setState({ atoms: newAtoms }, () => {
      if (typeof callback === 'function') callback();
      if (atomsShouldGetReady) this.callCreateTopic();
    });
    
  }
  
  // Dynamically renders the 'new atom' buttons based on the universe's atoms
  renderAddAtomsButtons() {
    const { atomCreators, addAtom } = this;
    
    return Object.keys(atomCreators).map(key => 
      <input 
        key={key}
        type='button'
        onClick={addAtom.bind(this, key)}
        value={atomCreators[key].buttonCaption}
        disabled={this.state.atomsShouldGetReady}
      />
    );
  }
  
  render() {
    const { title, atoms, atomsShouldGetReady, titleIsValidated } = this.state;
    const { userId, universe: {rules} } = this.props;
    
    const titleStyle = {
      width: '100%',
      resize: 'none',
      outline: 'none',
      overflow: 'auto',
      border: 'none',
    };
    
    return (
      <div className='topic'>
        <div className="createTopic_rules">
          {`Rules: ${rules}`}
          { /*
            You can be ignorant, but don't be stupid
            You can disagree, but don't be hateful
            You can be opiniated, but don't be hurtful
          */ }
        </div>
        
        <div className="topic_title">
          <div>{ titleIsValidated ? '' : 'Title should not be empty.' }</div>
          <textarea 
            type="text" 
            value={title} 
            onChange={this.handleTitleInput.bind(this)} 
            placeholder='Enter your title here'
            style={titleStyle}
          />
        </div>
        
        <div className="topic_author">
          {`By ${userId}`}
        </div>
        
        <div className="topic_atoms">
          {
            atoms.map((atom, i) => {
              
              const { type } = atom;
              
              return <AtomCreatorWrapper
                key={i}
                atom={atom}
                atomsShouldGetReady={atomsShouldGetReady}
                Creator={this.atomCreators[type]}
                update={this.updateAtom.bind(this, i)}
                remove={this.removeAtom.bind(this, i)}
                moveUp={this.moveAtom.bind(this, i, -1)}
                moveDown={this.moveAtom.bind(this, i, 1)}
              />;
            })
          }
        </div>
        
        <br/>
        <input 
          type='button'
          disabled={atomsShouldGetReady}
          onClick={this.handleSubmitClick.bind(this)}
          value={atomsShouldGetReady ? 'Loading...' : 'Create Topic'}
        />
        { ' - ' }
        { this.renderAddAtomsButtons() }
      </div>
    );
  }
}

class AtomCreatorWrapper extends React.Component {
  
  constructor() {
    super();
    this.state = { commandsVisible: false };
  }
  
  handleHover(commandsVisible) {
    this.setState({ commandsVisible });
  }
  
  render() {
    const {Creator, atom, moveUp, moveDown, remove, update, atomsShouldGetReady} = this.props;
    const commandsStyle = {
      visibility: this.state.commandsVisible && !atomsShouldGetReady ? 'visible' : 'hidden'
    };
    
    return <div onMouseOver={this.handleHover.bind(this, true)} onMouseOut={this.handleHover.bind(this, false)}>
      <div style={commandsStyle}>
        <button onClick={moveUp}>↑</button>
        <button onClick={moveDown}>↓</button>
        <button onClick={remove}>x</button>
      </div>
      <Creator {...atom} update={update} atomsShouldGetReady={atomsShouldGetReady} />
      <hr />
    </div>;
  }
}

const mapActions = dispatch => bindActionCreators({ createTopic }, dispatch);
export default connect(null, mapActions)(CreateTopic);
