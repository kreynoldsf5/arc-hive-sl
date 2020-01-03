import React, { Component, Fragment } from 'react'
import { Item, Icon, Divider, Grid, Message, Popup, Container, Header, Segment, Embed } from 'semantic-ui-react'
import axios from 'axios';
import parse from 'html-react-parser';
import {Helmet} from "react-helmet";
import Loader from 'react-loader-spinner'


import { authProvider } from './authProvider';
import ArcImage from './arcImage';
import ArcMacro from './arcMacro';

const backendURL = process.env.REACT_APP_BACKEND_URL

export default class Doc extends Component {
    constructor(props) {
        super(props);
        this.handleLoad = this.handleLoad.bind(this);
        this.state = {isLoading: false, docContents: ''}
      }

      render() {
        return (
        <div>
            <Divider hidden/>
            <Grid centered><Grid.Column width={12}>
                {this.statusMessage()}
                { this.state.isLoading ? (
                    this.getLoader()
                ) : (
                    this.thatDoc()
                )}
            </Grid.Column></Grid>
        </div>
        )
    };

    componentDidMount() {
        this.getDoc(this.props.location.pathname.split("?")[0])
    };

    componentDidUpdate  = (prevProps) => {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.getDoc(this.props.location.pathname.split("?")[0]);
        }
    };
    
    handleLoad = (bool) => {
        this.props.handleLoad(bool) 
    };

    disErrMessage = () => {
        return(
            <Message negative>
            <Message.Header>Search Error</Message.Header>
            <p>{this.state.errMessage}</p>
            </Message>
        )
    }

    statusMessage = () => {
        if ((!this.state.docContents) && (!this.state.isLoading)) {
            if (this.state.errMessage) {
                return(
                    <Message negative>
                    <Message.Header>Search Error</Message.Header>
                    <p>{this.state.errMessage}</p>
                    </Message>
                )
            } else {
                return(
                    <Message negative>
                    <Message.Header>Search Error</Message.Header>
                    <p>API Response Error :(</p>
                    </Message>
                )
            }
        } else {
            return(null)
        }
    }

    getDoc = async ( uid ) => {
        this.handleLoad(true);
        this.setState({isLoading: true})
        const docURL = backendURL + '/doc';
        const token = await authProvider.getIdToken();
        const idToken = token.idToken.rawIdToken;

        setTimeout( async () => {
            axios.post( docURL, {uid: uid},
                { headers: { Authorization: 'Bearer ' + idToken }
            })
            .then( res => {
                this.setState( {
                    docContents: res.data.data,
                    isLoading: false
                });
                this.handleLoad(false);
            })
            .catch( error => {
                if (error.response) {
                    this.setState({ docContents: '', isLoading: false, errMessage: error.response.data.error})
                    this.handleLoad(false);
                } else if (error.request) {
                    this.setState({ docContents: '', isLoading: false, errMessage: error.request})
                    this.handleLoad(false);
                } else {
                    this.setState({ docContents: '', isLoading: false, errMessage: error.message})
                    this.handleLoad(false);
                }
            })
        }, 1000)
    };

    handleDL = async (e, binpath, filename ) => {
        this.handleLoad(true)
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
            this.handleLoad(false)
            this.setState({isLoading: false})
          }).catch(error => {
            if (error) {
                if (error.response) {
                    this.setState({ isLoading: false, errMessage: error.response.data.error})
                    this.handleLoad(false);
                } else if (error.request) {
                    this.setState({ isLoading: false, errMessage: error.request})
                    this.handleLoad(false);
                } else {
                    this.setState({ isLoading: false, errMessage: error.message})
                    this.handleLoad(false);
                }
            }
          }
        );
    };

    getLoader = () => {
        return (
            <Fragment>
                <Divider hidden />
                <Divider hidden />
                <Divider hidden />
                <Loader 
                    type="ThreeDots" color="#A9A9A9" height={100} width={100}
                    style={{ textAlign: "center" }}
                />
            </Fragment>
        )
    }

     thatDoc = () => {
         if (this.state.docContents) {
             const thisDoc = this.state.docContents;
             return (
                <Fragment>
                <Helmet>
                    <title>{thisDoc.subject || thisDoc.title}</title>
                </Helmet>
                <div key={thisDoc._id}> 
                    <Container textAlign='left'>
                        <Header as='h2'><this.buttonDown />{thisDoc.subject}{thisDoc.title}</Header>
                    </Container>
                    <Container textAlign='left'>{this.formatUser(thisDoc.fullname, thisDoc.email)}</Container>
                    <Container textAlign='left'>{this.formatDate(thisDoc.prettycreation, thisDoc.prettymodification)}</Container>
                    <Divider />
                    <Container textAlign='justified'>
                        {thisDoc.summary && thisDoc.summary.length > 0 ? (
                            <Fragment>
                                {this.parseHTML(thisDoc.summary)}
                                <Divider hidden/>
                            </Fragment>
                        ) : ( null )}
                        <Fragment>
                        {this.parseHTML(thisDoc.body)}{this.parseHTML(thisDoc.bodytext)}
                        </Fragment>
                    </Container>
                    {thisDoc.attachments  ? (
                        this.disAttach()
                    ) : ( null )}
                    <Divider hidden />
                </div>
                </Fragment>
             )
         } else {
             return null
         }
     }

    disAttach = () => {
        if (this.state.docContents.attachments) {
            const attach = this.state.docContents.attachments.map((o) =>
            <Segment>
              <Grid><Grid.Row>
                <Grid.Column width={2}>
                <Icon link name={o.icon} size='huge' 
                    onClick={() => this.handleDL(this, o.binpath, o.filename)} />
                </Grid.Column>
                <Divider vertical hidden/>
                <Grid.Column width={10}>
                <b>{o.filename}</b> <br/>
                created on {o.prettycreation}<br/>
                {o.humanfs}
                </Grid.Column>
            </Grid.Row></Grid>
            </Segment>
            )
            return(
                <Fragment>
                <Divider hidden/>
                <Header as='h4'>Attachments</Header>
                {attach}
                </Fragment>
            )
        } else {
            return null
        }
    }

    buttonDown = () => {
        if(this.state.docContents.binpath) {
            return (
                <Popup trigger={
                    <Icon link name={this.state.docContents.icon} size='huge' 
                        onClick={() => this.handleDL(this, this.state.docContents.binpath, this.state.docContents.filename)} />
                }
                on='hover' header={this.state.docContents.filename} content={this.state.docContents.humanfs} />
                )
        } else {
            return (
               <Icon name={this.state.docContents.icon} size='huge' disabled  />
            )
        }
    };

    parseHTML = (html) => {
        const replace = domNode => {
            //Images
            if (domNode.attribs && domNode.attribs.class === 'arc-image') {
              return (
                <ArcImage
                    imageURL={domNode.attribs.src}
                    imageAlt={domNode.attribs.alt}
                    imageStyle={domNode.attribs.style}
                />
              );
            }
            //Linked Documents
            if (domNode.attribs && domNode.attribs.class === 'arc-doc') {
                return (
                    <ArcMacro 
                        type='doc'
                        uid={domNode.attribs.href}
                        anchor={domNode.attribs.anchor}
                    />
                )
            }
            if (domNode.attribs && domNode.attribs.class === 'arc-blogpost') {
                return (
                    <ArcMacro
                        type='blogpost'
                        blogpostid={domNode.attribs.blogpostid}
                        anchor={domNode.attribs.anchor}
                    />
                )
            }
            //Users
            if (domNode.attribs && domNode.attribs.class === 'arc-user') {
                return (
                    <ArcMacro
                        type='user'
                        userid={domNode.attribs.userid}
                        anchor={domNode.attribs.anchor}
                    />
                )
            }
            if (domNode.attribs && domNode.attribs.class === 'arc-code') {
                return (
                    <ArcMacro
                        type='code'
                        codeString={domNode.children[0].data || ''}
                    />
                )
            }
            //Videos
            //Youtube.
            if (domNode.attribs && domNode.attribs.class === 'arc-youtube') {
                return (
                    <Embed
                        source='youtube'
                        id={domNode.attribs.id}
                        defaultActive
                    />
                )
            }
            if (domNode.attribs && domNode.attribs.class === 'arc-vimeo') {
                return (
                    <Embed
                        source='vimeo'
                        id={domNode.attribs.id}
                        defaultActive
                    />
                )
            }
            //Jive Videos
          };
        if (html) {
            return parse(html, { replace })
        } else {
            return null 
        }
    };

    formatDate = (prettyCreate, prettyModified) => {
        if(prettyCreate.trim() === prettyModified.trim()) {
            const dateContent = "created on " + prettyCreate.trim()
            return (
                <Item.Meta content={dateContent} />               
            )
        } else {
            const dateContent = "modified on " + prettyCreate.trim()
            return (
                <Item.Meta content={dateContent} />
            )

        }
    };

    formatUser = (username, email) => {
        const userContent = username.trim() + ", " + email
        return(
            <Item.Meta content={userContent} />
        )
    };

    getSignedLink = async () => {
        const token = await authProvider.getIdToken();
        const idToken = token.idToken.rawIdToken;
       
        setTimeout( async () => { 
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
        },1000)
    };


};
