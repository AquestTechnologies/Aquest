import React from 'react';

class LinkAtomViewer extends React.Component {
  
  render() {
    const { href, text } = this.props.content;
    
    return (
      <div>
        <a href={href} target='_blank'>{ text }</a>
      </div>
    );
  }
}

class LinkAtomCreator extends React.Component {
  
  handleInput(key, e) {
    this.props.update({
      ready: 'yes',
      content: { 
        [key]: e.currentTarget.value,
      },
    });
  }
  
  render() {
    const { validationErrors, content: { text, href } } = this.props;
    const errorsDivStyle = {
      display: validationErrors ? 'block' : 'none',
    };
    
    return (
      <div>
        <div style={errorsDivStyle}>
          { JSON.stringify(validationErrors) }
        </div>
        <div>
          <span>URL</span>
          <input
            type="text"
            value={href}
            placeholder='http://website.com'
            onChange={this.handleInput.bind(this, 'href')}
          />
        </div>
        <div>
          <span>Text (optionnal)</span>
          <input
            type="text"
            value={text}
            onChange={this.handleInput.bind(this, 'text')}
          />
        </div>
      </div>
    );
  }
}

LinkAtomCreator.buttonCaption = 'Link';
LinkAtomCreator.initialContent = {
  href: '',
  text: '',
};

function createPreview(content) { 
  return Promise.resolve(content);
}

const validationConstraints = {
  text: {
    length: {
      maximum: 250,
      tooLong: '^The link text can only be %{count} characters long maximum',
    },
  },
  href: {
    presence: {
      message: '^URL cannot be blank',
    },
    length: {
      maximum: 2083,
    },
  },
};

export default {
  name: 'link',
  createPreview,
  validationConstraints,
  Viewer: LinkAtomViewer,
  Creator: LinkAtomCreator,
  Previewer: LinkAtomViewer,
};
