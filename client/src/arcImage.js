import React, { Fragment } from 'react'
import axios from 'axios';
import styled from 'style-to-object';
import { authProvider } from './authProvider';
import { Placeholder, Image } from 'semantic-ui-react'

const backendURL = process.env.REACT_APP_BACKEND_URL

export default class ArcImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: true, isError: false, imageSrc: null};
    this.dispBase64 = this.dispBase64.bind(this);
  }

  render() {
    return (
      <Fragment>
        { this.state.isLoading ? (
          <Placeholder >
            <Placeholder.Image style={styled(this.props.imageStyle)}/>
          </Placeholder>
          ) : (
            <Image src={this.state.imageSrc} spaced wrapped 
              style={styled(this.props.imageStyle)}
              alt={this.props.imageAlt}
              onClick={this.dispBase64}
            />
        )}
      </Fragment>
    )
  }
 

  componentDidMount() {
    this.getImage()
  }

  getImage = async () => {
  const token = await authProvider.getIdToken();
  const idToken = token.idToken.rawIdToken;
  const url = backendURL + this.props.imageURL

  axios.get(url, { 
    responseType: 'arraybuffer',
    headers: { Authorization: 'Bearer ' + idToken }
  })
  .then(response => {
    const base64 = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        '',
      ),
    );
    this.setState({ 
      imageSrc: "data:image/png;base64," + base64, //Modern browsers are OK with my laziness
      isLoading: false,
    });
  })
  .catch(error => {
    this.setState({
      isError: true
    })
  })
};

dispBase64() {
  var win = window.open();
  win.document.write('<iframe src="' + this.state.imageSrc  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
  //Perhaps I can do better here
}

};
