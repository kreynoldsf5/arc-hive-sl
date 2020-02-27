import React, { Component, Fragment } from 'react'
import { Item, Divider, Grid, Message, Container, Header, Segment, Embed, Icon, List, Popup } from 'semantic-ui-react'
import { Link } from "react-router-dom";
import axios from 'axios';
import parse from 'html-react-parser';
import {Helmet} from "react-helmet";

import { authProvider } from './authProvider';
import ArcImage from './arcImage';
import ArcMacro from './arcMacro';
import ArcDownload from './arcDownload';
import ArcMessage from './arcMessage';
import ArcLoader from './arcLoader';

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
                    <Fragment>
                        <Divider hidden />
                        <Divider hidden />
                        <Divider hidden />
                        <ArcLoader/>
                    </Fragment>
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

    thatDoc = () => {
        if (this.state.docContents) {
            const thisDoc = this.state.docContents;
            if (thisDoc.type === 'thread') {
                return (
                    this.disThread()
                )
            } else {
            return (
               <Fragment>
               <Helmet>
                   <title>{thisDoc.subject || thisDoc.title}</title>
               </Helmet>
               <div key={thisDoc._id}> 
                   <Container fluid>
                       <Header as='h2'>{thisDoc.subject}{thisDoc.title}</Header>
                   </Container>
                   <Container fluid>{this.formatUser(thisDoc.fullname, thisDoc.email)}</Container>
                   <Container fluid>{this.formatDate(thisDoc.prettycreation, thisDoc.prettymodification, thisDoc.type)}</Container>
                   <Container fluid><this.mainDoc/></Container>
                   <Divider />
                   <Container fluid>
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
            )}
        } else {
            return null
        }
    }

    disAttach = () => {
        if (this.state.docContents.attachments) {
            const attach = this.state.docContents.attachments.map((o) =>
            <Segment key={o.attachmentid}>
                <Fragment>
                <Grid><Grid.Row>
                <ArcDownload icon={o.icon} binpath={o.binpath} filename={o.filename} />
                <Divider vertical hidden/>
                {o.filename} <br/>
                created at {o.prettycreation}<br/>
                {o.humanfs}
                </Grid.Row></Grid>
                </Fragment>  
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

    mainDoc = () => {
        if(this.state.docContents.binpath) {
            return (
                <Fragment>
                <Divider hidden/>
                <Grid><Grid.Row>
                <ArcDownload icon={this.state.docContents.icon} binpath={this.state.docContents.binpath} filename={this.state.docContents.filename} />
                <Divider vertical hidden/>
                {this.state.docContents.filename} <br/>
                {this.state.docContents.humanfs}
                </Grid.Row></Grid>
                </Fragment>  
            )
        } else if(this.state.docContents.threaduri && this.state.docContents.threadlen > 1) {
            return (
                <Fragment>
                <Container fluid>
                <Popup content={`${this.state.docContents.threadlen} message thread`}
                trigger={
                    <Link to={this.state.docContents.threaduri}>
                        <Icon name={`comments`} size='large' />
                    </Link>
                }
                />
                </Container>
                </Fragment> 
            )
        } else if(this.state.docContents.threaduri) {
            return (
                <Fragment>
                <Container fluid>
                <Popup content={`${this.state.docContents.threadlen} message thread`}
                trigger={
                        <Icon name={this.state.docContents.icon} size='large' />
                }
                />
                </Container>
                </Fragment> 
            )
        } else {
            return ( null )
        }
    };

    disThread = () => {
        return (
            <List><List.Item>
                <ArcMessage uid={this.state.docContents.messages.uri} handleLoad ={this.handleLoad}/>
                {this.state.docContents.messages.children.length > 0 ? (
                    <List.List>
                        {this.totChildren(this.state.docContents.messages.children)}
                    </List.List>
                    ) : ( null )}
            </List.Item></List>
        )
    }

    totChildren = (childs) => {
        const childMessages = childs.map(message => {
            let child = <ArcMessage uid={message.uri} handleLoad ={this.handleLoad}/>
            let subChild;
            if (message.children && message.children.length > 0) {
                subChild = this.totChildren(message.children)
            }
            return (
                <Fragment>
                    {child}
                    <List.List>
                        {subChild}
                    </List.List>
                </Fragment>
            )
        })
        return (
            childMessages
        )
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

    formatDate = (prettyCreate, prettyModified, type) => {
        var dateContent
        var thisType = type.charAt(0).toUpperCase() + type.slice(1)
        if(prettyCreate.trim() === prettyModified.trim()) {
            dateContent = thisType + " created at " + prettyCreate.trim()
        } else {
            dateContent = thisType + " created at " + prettyCreate.trim() + ", modified at " + prettyModified.trim()
        }
        return (
            <Item.Meta content={dateContent} />               
        )
    };

    formatUser = (username, email) => {
        const userContent = username.trim() + ", " + email
        return(
            <Item.Meta content={userContent} />
        )
    };

};
