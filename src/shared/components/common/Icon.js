import React from 'react';

class Icon extends React.Component {
  render() {
    var strokeWidth = this.props.strokeWidth; 
    //mettre les icones en markup svg ici et les wrapper dans <g></g> si besoin
    //penser à remplacer toute couleur par currentColor et strokeWidth par {strokeWidth}
    
    // http://www.streamlineicons.com/preview-ultimate.html
    // https://nucleoapp.com/#0
    
    var icons = {
      circle:        <circle fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" cx="32" cy="32" r="31"/>,
      disk:          <circle fill="currentColor" cx="32" cy="32" r="31"/>,
      globe:         <g><path fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" d="M32,1c14.359,0,27,12.641,27,27S46.359,55,32,55	c-10,0-13-4-13-4"/><circle fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" cx="32" cy="28" r="20"/><line fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" x1="32" y1="54" x2="32" y2="64"/><line fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" x1="22" y1="63" x2="42" y2="63"/></g>,
      magnifier:     <g><circle fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" cx="21" cy="21" r="20"/><line fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" x1="35" y1="35" x2="41" y2="41"/><rect x="46.257" y="37.065" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 121.9178 50.5)" fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" width="8.485" height="26.87"/></g>,
      pin1:          <g><circle fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" cx="32" cy="16" r="15"/><path fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" d="M22.083,16c0-5.477,4.44-9.917,9.917-9.917"/><line fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" x1="32" y1="64" x2="32" y2="31"/></g>,
      pin2:          <g><line fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" x1="32" y1="64" x2="32" y2="36"/><polyline fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" points="32,1 22,1 22,5 27,9 25,26 16,30 15,36  32,36 "/><polyline fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" points="32,1 42,1 42,5 37,9 39,26 48,30 49,36  32,36 "/></g>,
      pin3:          <path d="M317.16,159.471c-16.197-16.199-41.195-24.41-74.307-24.41c-7.01,0-14.408,0.379-22.047,1.121l-79.729-75.346l19.04-19.035 c3.529-3.531,3.529-9.252-0.003-12.785l-26.42-26.424c-3.39-3.391-9.394-3.391-12.784,0L2.648,120.863 c-3.531,3.531-3.531,9.252-0.002,12.783l26.416,26.416c1.697,1.695,3.995,2.648,6.394,2.648c2.397,0,4.697-0.953,6.392-2.648 l19.042-19.035l75.346,79.726c-3.048,31.352-1.057,72.018,23.284,96.358c1.766,1.766,4.079,2.648,6.391,2.648 c2.314,0,4.629-0.884,6.395-2.648l66.035-66.041l50.578,50.582c1.768,1.766,4.08,2.648,6.395,2.648 c2.312,0,4.629-0.884,6.393-2.648c3.531-3.531,3.531-9.254,0-12.785l-50.582-50.58l66.037-66.03 C320.691,168.725,320.691,163.005,317.16,159.471z M166.505,297.334c-14.614-21.172-14.7-53.803-11.859-78.743 c0.3-2.648-0.581-5.297-2.413-7.23l-84.589-89.516c-1.678-1.775-4.002-2.791-6.443-2.826c-0.042,0-0.086,0-0.128,0 c-2.397,0-4.697,0.953-6.392,2.647l-19.225,19.221l-13.632-13.631L127.303,21.769l13.636,13.641L121.716,54.63 c-1.726,1.73-2.68,4.078-2.646,6.525c0.035,2.436,1.057,4.768,2.832,6.443l89.507,84.582c1.936,1.836,4.574,2.719,7.23,2.41 c8.455-0.963,16.602-1.449,24.213-1.449c23.465,0,41.756,4.469,54.539,13.314L166.505,297.334z"/>,
      star:          <polygon fill="none" stroke="currentColor" strokeWidth={strokeWidth} stroke-miterlimit="10" points="32,47 12,62 20,38 2,24 24,24 32,1 40,24 62,24 44,38 52,62 "/>
    };
    
    //viewBox doit etre en accord avec le viewBox du set d'icones
    return (
      <div className={this.props.cssclass}>
          <svg viewBox="0 0 64 64">{icons[this.props.name]}</svg>
      </div>
    );
  }
}

Icon.propTypes = {
  name: React.PropTypes.string.isRequired,
  cssclass: React.PropTypes.string.isRequired  
};
    
Icon.defaultProps = {
  name: "star",
  cssclass: "cp_iconMenu",
  strokeWidth: 5
};

export default Icon;