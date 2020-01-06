import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react'
import axios from 'axios';
import { authProvider } from './authProvider';

const backendURL = process.env.REACT_APP_BACKEND_URL

export default class ArcDownload extends Component {
    constructor(props) {
        super(props);
        //binpath, filename, icon
        this.state = {};
      }

    render(){
        return (
            <Icon link name={this.props.icon} size='huge' 
            onClick={() => this.handleDL(this, this.props.binpath, this.props.filename)} />
        )
    }

    handleDL = async (e, binpath, filename) => {
        //TBD: universal loading status (images and downloads)
        //TBD: universal status message(s)

        const token = await authProvider.getIdToken();
        const idToken = token.idToken.rawIdToken;

        try {
            axios({
                url: backendURL + '/download/' + encodeURIComponent(binpath) + "/" + encodeURIComponent(filename),
                method: 'GET',
                headers: { Authorization: 'Bearer ' + idToken }
            }).then((linkRes) => {
                axios({
                    url: linkRes.data.signedDownload,
                    method: 'GET',
                    responseType: 'blob'
                  }).then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    //this.handleLoad(false)
                    this.setState({isLoading: false})
                  })
            })
        } catch(error) {
            if (error.response) {
                this.setState({ isLoading: false, errMessage: error.response.data.error})
                //this.handleLoad(false);
            } else if (error.request) {
                this.setState({ isLoading: false, errMessage: error.request})
                //this.handleLoad(false);
            } else {
                this.setState({ isLoading: false, errMessage: error.message})
                //this.handleLoad(false);
            }
        }
    };
}