import React, { Component, Fragment } from 'react'
import { List, Divider, Container, Embed, Item, Popup, Icon, Segment } from 'semantic-ui-react'
import axios from 'axios';
import { authProvider } from './authProvider';
import parse from 'html-react-parser';
import { Link } from "react-router-dom";

import ArcImage from './arcImage';
import ArcMacro from './arcMacro';
import ArcLoader from './arcLoader';

const backendURL = process.env.REACT_APP_BACKEND_URL

export default class ArcMessage extends Component {
    constructor(props) {
        super(props);
        this.handleLoad = this.handleLoad.bind(this);
        this.state = {};
      }

    componentDidMount() {
        this.getMessage(this.props.uid)
    };

    handleLoad = (bool) => {
        this.props.handleLoad(bool) 
    };

    getMessage = async ( uid ) => {
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

    thatMessage = () => {
        if (this.state.docContents) {
            return (
                <List.Item key={this.state.docContents._id}>
                    <Segment>
                    <List.Content>
                        <Segment>
                        <List.Header>
                            {this.state.docContents.subject}
                        </List.Header>
                        <List.Description>
                            {this.formatUser(this.state.docContents.fullname, this.state.docContents.email)}
                        </List.Description>
                        <List.Description>
                            {this.formatDate(this.state.docContents.prettycreation, this.state.docContents.prettymodification)}
                        </List.Description>
                        <Container fluid>
                            <Popup content={this.state.docContents.uri}
                            trigger={
                                <Link to={this.state.docContents.uri}>
                                    <Icon name={this.state.docContents.icon} size='large' />
                                </Link>
                            }
                            />
                        </Container>
                        </Segment>
                            <Fragment>
                                {this.parseHTML(this.state.docContents.body)}
                            </Fragment>
                    </List.Content>
                </Segment>
                </List.Item>
            )
        } else {
            return ( null )
        }
    }

    render() {
        return (
        <Fragment>
                { this.state.isLoading ? (
                    <Fragment>
                        <Divider hidden />
                        <Divider hidden />
                        <Divider hidden />
                        <ArcLoader/>
                    </Fragment>
                ) : (
                    this.thatMessage()
                )}
        </Fragment>
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

    formatDate = (prettyCreate, prettyModified) => {
        var dateContent
        if(prettyCreate.trim() === prettyModified.trim()) {
            dateContent = "created at " + prettyCreate.trim()
        } else {
            dateContent = "created at " + prettyCreate.trim() + ", modified at " + prettyModified.trim()
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


}