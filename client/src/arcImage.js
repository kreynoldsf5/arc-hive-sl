import React from 'react'
import axios from 'axios';
import styled from 'style-to-object';
import { authProvider } from './authProvider';
import Img from 'react-image'
import { Image } from 'semantic-ui-react'
import Loader from 'react-loader-spinner'
import caseFormatter from 'case-formatter';

const backendURL = process.env.REACT_APP_BACKEND_URL

export default class ArcImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render(){
    var tStyle
    if (styled(this.props.imageStyle)) {
      tStyle = caseFormatter.kebabToCamel(styled(this.props.imageStyle))
    } else {
      tStyle = { height: "auto" }
    }
    return (
    <span style={tStyle}>
      <Img
        src={[this.state.imageSrc, <Image src='https://react.semantic-ui.com/images/wireframe/image.png' centered />]}
        loader={
            <Loader 
            type="ThreeDots" color="#A9A9A9" height={80} width={80}
            style={{ textAlign: "center" }}
            />
        }
        alt={this.props.imageAlt}
        style={tStyle}
        decode={true}
      />
    </span>
    )
  }

  componentDidMount() {
      this.getSignedImage()
  }

getSignedImage = async () => {
  const token = await authProvider.getIdToken();
  const idToken = token.idToken.rawIdToken;
 
  axios({
      url: backendURL + this.props.imageURL,
      method: 'GET',
      headers: { Authorization: 'Bearer ' + idToken }
  }).then((response) => {
      this.setState({ 
        imageSrc: response.data.signedImage,
        isLoading: false 
      })
  })
  .catch( error => {
      this.setState({
          isLoading: false,
          isError: true
      })
  });
};

};
