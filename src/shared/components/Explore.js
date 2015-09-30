import React from 'react';
import Node  from './explore/Node';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { readUniverses } from '../actionCreators';

class Explore extends React.Component {
  
  static runPhidippides(routerState) {
    return [{
      id:      'universes',
      creator: 'readUniverses',
      args:    []
    }];
  }
  
  componentDidMount() {
    const { universes, readUniverses } = this.props;
    if (Object.keys(universes).length < 2) readUniverses();
  }
  
  render() {
    const { universes } = this.props;
    const divStyle = {
      width: '60%',
      margin: '0 auto 0 auto',
      fontSize: '2rem',
    };
    
    const nodeList = Object.keys(universes).sort()
      .map(key => universes[key])
      .filter(universe => !universe.notFound)
      .map(universe => <Node key={universe.id} universe={universe} />);
    
    return <div style={divStyle}>
      <Link to='/'>Home</Link>
      {' - '}
      <Link to='/Create_universe'>Create a new universe</Link>
      <br/>
      <br/>
      { nodeList }
    </div>;
  }
}

const mapState = state => ({ universes: state.universes });
const mapActions = dispatch => bindActionCreators({ readUniverses }, dispatch);

export default connect(mapState, mapActions)(Explore);
