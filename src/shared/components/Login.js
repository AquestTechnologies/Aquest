import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { login } from '../actionCreators';

class Login extends React.Component {
  
  constructor() {
    super();
    
    this.handleInputEmail = e => this.setState({email: e.currentTarget.value});
    this.handleInputPassword = e => this.setState({password: e.currentTarget.value});
    this.handleSubmit = e => {
      e.preventDefault();
      this.props.login(this.state);
    };
    this.state = {
      email: 'admin',
      password: 'password',
    };
  }
  
  render() {
    const { lastError } = this.props;
    const { email, password } = this.state;
    
    // 'nothing' gives the div its correct size even when there is no error
    const placeholder = 'nothing';
    const warming = lastError && lastError.intention === 'login' ? lastError.response : placeholder;
    const warmingStyle = {
      color: 'red',
      visibility: warming === placeholder ? 'hidden' : 'visible'
    };
    const divStyle = {
      width: '50%',
      fontSize: '2rem',
      margin: '0 auto 0 auto',
    };
    return (
      <div style={divStyle}>
        <h2>{'Log in'}</h2>
        <div style={warmingStyle}>{ warming }</div>
        <form onSubmit={this.handleSubmit}>
        
          <div>
            <div>Pseudo or email</div>
            <input type='text' value={email} onChange={this.handleInputEmail} />
          </div>
          
          <div>
            <div>Password</div>
            <input type='password' value={password} onChange={this.handleInputPassword} />
          </div>
          
          <input type='submit' value='Go!' onClick={this.handleSubmit} />
        </form>
      </div>
    );
  }
}

const mapState = state => ({lastError: state.lastError});
const mapActions = dispatch => bindActionCreators({ login }, dispatch);

export default connect(mapState, mapActions)(Login);
