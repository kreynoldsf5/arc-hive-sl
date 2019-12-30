import React, { Fragment } from 'react'
import { Link } from "react-router-dom";
import axios from 'axios';
import { authProvider } from './authProvider';
import { Popup } from 'semantic-ui-react'
import queryString from 'query-string'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
 
SyntaxHighlighter.registerLanguage('javascript', javascript);

const backendURL = process.env.REACT_APP_BACKEND_URL

export default class ArcDocMacro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {docContents: null, isLoading: true, isError: false, noBin: true};
  }

  render() {
    return (
        <Fragment>
            {this.macroRender()}
        </Fragment>
    )
}

macroRender() {
    if (this.props.type === 'doc') {
        if (this.state.isLoading || this.state.noBin) {
            return (
                <Link to={this.props.uid}>{this.props.anchor}</Link>
            )
        }
        else {
            return (
                <Popup trigger={
                    <Link to={this.state.docContents.uri}
                        onClick={() => this.handleDL(this, this.state.docContents.binpath, this.state.docContents.filename)}
                        >{this.props.anchor}</Link>
                    }
                    on='hover' header={this.state.docContents.filename} content={this.state.docContents.humanfs} />
            )
        }
    }
    if (this.props.type === 'blogpost') {
        if (this.state.isLoading) {
            return (
                this.props.anchor
            )
        }
        else {
            return (
                <Link to={this.state.docContents.uri}>{this.props.anchor}</Link>
            )
        }
    }
    if (this.props.type === 'user') {
        return (
            <Link
                to={{
                    pathname: "/search",
                    search: queryString.stringify({
                        q: this.props.anchor,
                        p: 1,
                        o: ["au", "re", "ac", "ds", 5, 10],
                    }, {arrayFormat: 'comma'})
                }}>
                {this.props.anchor}
            </Link>
        )
    }
    if (this.props.type === 'code') {
        return (
            <SyntaxHighlighter language="javascript" style={atomDark} showLineNumbers={true}>
                {this.props.codeString}
            </SyntaxHighlighter>
        )
    }
    else {
        return null
    }
}

  componentDidMount() {
    if (this.props.type === 'doc') {
        this.getDoc({uid: this.props.uid, docLink: true})
    }
    else if (this.props.type === 'blogpost') {
        this.getDoc({blogpostid: this.props.blogpostid, docLink: true})
    }
    else if (this.props.type === 'user') {
        this.setState({ isLoading: false })
    }
  };

  getDoc = async (body) => {
    const docURL = backendURL + '/doc';
    const token = await authProvider.getIdToken();
    const idToken = token.idToken.rawIdToken;

    setTimeout( async () => {
        axios.post( docURL, body,
            { headers: { Authorization: 'Bearer ' + idToken }
        })
        .then( res => {
            if (res.data.data.binpath) {
                this.setState({
                    docContents: res.data.data,
                    isLoading: false,
                    noBin: false
                })
            } else {
                this.setState({
                    docContents: res.data.data,
                    isLoading: false
                })
            }
        })
        .catch( error => {
            this.setState({
                docContents: null,
                isLoading: false,
                isError: true
            })
        })
    }, 1000)
};

handleDL = async (e, binpath, filename ) => {
    const token = await authProvider.getIdToken();
    const idToken = token.idToken.rawIdToken;

    if (this.cancel) { this.cancel.cancel(); }
    this.cancel = axios.CancelToken.source();
    axios({
        url: backendURL + '/download/' + encodeURIComponent(binpath) + "/" + encodeURIComponent(filename),
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: 'Bearer ' + idToken }
    }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        this.setState({isLoading: false})
    })
    .catch( error => {
        this.setState({
            docContents: null,
            isLoading: false,
            isError: true
        })
    });
};


};