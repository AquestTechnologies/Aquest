import React from 'react';

// This component is horrible and WILL be modified
export default class ErrorBar extends React.Component {
  
  constructor() {
    super();
    this.state = { 
      visible: false,
      message: '',
    };
  }
  
  componentWillReceiveProps({ lastError }) {
    if (lastError && lastError.status !== 401) this.setState({ 
      visible: true,
      message: lastError.response,
    },() => setTimeout(() => this.setState({ visible: false }), 3500));
  }
  
  render() {
    const { visible, message } = this.state;
    const divStyle = {
      width: '100%',
      height: 'auto',
      position: 'fixed',
      left: '0',
      top: '0',
      zIndex: '999',
      fontSize: '1.7rem',
      fontWeight: '700',
      color: '#990000', // YOLO
      textAlign: 'center',
      padding: '1rem 0 1rem 0',
      backgroundColor: '#fff',
      visibility: visible ? 'visible' : 'hidden',
    };
    
    return <div style={divStyle}>{ message }</div>;
  }
}
