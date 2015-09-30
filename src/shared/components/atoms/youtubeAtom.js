import React from 'react';
import log from '../../utils/logTailor';
import makeHttpRequest from '../../../client/lib/makeHttpRequest';
import { youtubeAPIKey } from '../../../../config/dev_google';

class YoutubeAtomViewer extends React.Component {
  
  render() {
    const { id, width, height } = this.props.content;
    const divStyle = {
      textAlign: 'center',
    };
    
    // https://developers.google.com/youtube/player_parameters
    return <div style={divStyle}>
      <iframe 
        width={width}
        height={height}
        frameBorder='0'
        allowFullScreen
        src={`https://www.youtube.com/embed/${id}?rel=0`} 
      />
    </div>;
  }
}

class YoutubeAtomCreator extends React.Component {
  
  handleIdInput(e) {
    const inputValue = e.currentTarget.value;
    const match = inputValue.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
    const id = match && match[1].length === 11 ? match[1] : '';
    
    this.props.update({
      ready: 'no',
      content: { id },
      state: { inputValue },
    });
  }
  
  handleEditClick(e) {
    
    this.props.update({
      ready: 'no',
      content: { id: '' },
      state: { inputValue: '' },
    });
  }
  
  componentWillReceiveProps(nextProps) {
    
    const { atomsShouldGetReady, ready } = nextProps;
    
    // Checks if given video id leads to a valid youtube video
    if (atomsShouldGetReady && ready === 'no') {
      
      const { update, content: { id } } = nextProps;
      const path = `https://www.googleapis.com/youtube/v3/videos?key=${youtubeAPIKey}&part=id&id=${id}`;
      
      update({ ready: 'pending' });
      log('Youtube atom getting ready');
      
      makeHttpRequest('get', path).then(
        result => update(result.pageInfo.totalResults ? // result.pageInfo.totalResults should be === 1
          {
            ready: 'yes',
          } :
          {
            ready: 'error',
            state: { 
              errorMessage: 'This video does not exist or is private' // Not sure if that is true
            }
          }
        ),
        error => update({
          ready: 'error',
          state: { 
            errorMessage: error instanceof Error ? 
              'Their was a problem with your internet connection' : 
              'Youtube service unavailable'
          }
        })
      );
    }
  }
  
  // Idea:
  // shouldComponentUpdate(nextProps) {
  //   return this.props.content.url !== nextProps.content.url;
  // }
  
  render() {
    const { content, state: { inputValue, errorMessage }, validationErrors } = this.props;
    
    const validationDivStyle = { display: validationErrors ? 'block' : 'none' };
    const errorDivStyle = { display: errorMessage ? 'block' : 'none' };
    
    return (
      <div>
        <div style={validationDivStyle}>
          { JSON.stringify(validationErrors) }
        </div>
        <div style={errorDivStyle}>
          { errorMessage }
        </div>
        {
          content.id ?
          <div>
            <button onClick={this.handleEditClick.bind(this)}>Edit</button>
            <YoutubeAtomViewer content={content} />
          </div>
          :
          <input 
            size='100'
            type='text'
            value={inputValue} 
            autoComplete='false'
            onChange={this.handleIdInput.bind(this)} 
            placeholder='https://www.youtube.com/watch?v=qXvZpn_dnMs'
          />
        }
      </div>
    );
  }
}

YoutubeAtomCreator.buttonCaption = 'YouTube';
YoutubeAtomCreator.initialContent = {
  id: '',
  width: 420, // Youtube default
  height: 315,
};
YoutubeAtomCreator.initialState = {
  inputValue: '',
  errorMessage: '',
};

const createPreview = content => new Promise.resolve(content);

const validationConstraints = {
  id: {
    presence: {
      message: '^Invalid video URL'
    },
    length: {
      is: 11
    } 
  },
  width: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThan: 100,
      lessThanOrEqualTo: 1000,
    }
  },
  height: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThan: 100,
      lessThanOrEqualTo: 1000,
    }
  }
};

export default {
  name: 'youtube',
  createPreview,
  validationConstraints,
  Viewer: YoutubeAtomViewer,
  Creator: YoutubeAtomCreator,
  Previewer: YoutubeAtomViewer,
};
