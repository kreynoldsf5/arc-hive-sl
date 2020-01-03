import React, { Fragment } from 'react'
import axios from 'axios';
import styled from 'style-to-object';
import { authProvider } from './authProvider';
import Img from 'react-image'
import { Image, Divider } from 'semantic-ui-react'
import Loader from 'react-loader-spinner'


const backendURL = process.env.REACT_APP_BACKEND_URL

export default class ArcImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render(){
    return (
    <Fragment>
    <div style={styled(this.props.imageStyle)}>
      <Img
        src={[this.state.imageSrc, <Image src='https://react.semantic-ui.com/images/wireframe/image.png' centered />]}
        loader={<Fragment><Divider hidden />
            <Loader 
            type="ThreeDots" color="#A9A9A9" height={80} width={80}
            style={{ textAlign: "center" }}
            />
        </Fragment>}
        alt={this.props.imageAlt}
        style={{display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%"}}
        decode={true}
      />
    </div>
    </Fragment>
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
