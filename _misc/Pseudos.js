import React from 'react';
import {default as generatePseudos, getBiggestPseudo, getSmallestPseudo, getPossibilitiesNumber} from '../../utils/pseudosGenerator';

export default class Pseudos extends React.Component {
  
  constructor() {
    super();
    this.state={
      x: [],
      pseudos: [],
      big: '',
      small: '',
      pos: ''
    };
    this.handleClick = () => this.setState({x: generatePseudos(6)});
    this.handleBig   = () => this.setState({big: getBiggestPseudo()});
    this.handleSmall = () => this.setState({small: getSmallestPseudo()});
    this.handlePos   = () => this.setState({pos: getPossibilitiesNumber()});
  }
  
  again() {
    console.log('!');
    this.setState({x: generatePseudos(6)});
  }
  
  componentDidMount() {
    this.setState({
      x: generatePseudos(6),
      pseudos: generatePseudos(50),
    });
  }
  
  render() {
    const {x, pseudos, big, small, pos} = this.state;
    
    return(
      <div>
        <h1>Pseudos</h1>
        <button onClick={this.handleClick}>New ones</button>
        <button onClick={this.handleBig}   hidden={big.length > 0 ? true : false}>Biggest ?</button>
        <button onClick={this.handleSmall} hidden={small.length > 0 ? true : false}>Smallest ?</button>
        <button onClick={this.handlePos}   hidden={pos.length > 0 ? true : false}>Nb of possibilities ?</button>
        <br/>
        <div>
          <span style={{marginRight:25}}>{big}</span>
          <span>{big.length ? big.length + ' letters' : ''}</span>
          <br/>
          <span style={{marginRight:25}}>{small}</span>
          <span>{small.length ? small.length + ' letters' : ''}</span>
          <br/>
          <span>{pos.length ? pos : ''}</span>
        </div>
        <br/>
        <h3>Choose one</h3>
        <div>
          <span style = {{marginRight:50}}>{x[0]}</span>
          <span style = {{marginRight:50}}>{x[1]}</span>
          <span style = {{marginRight:50}}>{x[2]}</span>
        </div>
        <br/>
        <div>
          <span style = {{marginRight:50}}>{x[3]}</span>
          <span style = {{marginRight:50}}>{x[4]}</span>
          <span style = {{marginRight:50}}>{x[5]}</span>
        </div>
        <br/>
        <h3>Or many</h3>
        {pseudos.map( pseudo => {
          return(<li key={pseudo}>{pseudo}</li>);
        })}
      </div>
    );
  }
}