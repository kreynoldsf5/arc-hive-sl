import React, { Component, Fragment } from 'react'
import { Item, Icon, Grid, Divider, Placeholder, Message, Pagination } from 'semantic-ui-react'
import { Link } from "react-router-dom";
import queryString from 'query-string'
import axios from 'axios';
import {Helmet} from "react-helmet";

import { authProvider } from './authProvider';
import ArcLoader from './arcLoader';

const backendURL = process.env.REACT_APP_BACKEND_URL

export default class Results extends Component {
    constructor(props) {
        super(props);
        this.handleLoad = this.handleLoad.bind(this);
        this.state = { 
            results: [],
            query: '',
            isLoading: false,
            errMessage: '',
            page: 1,
            totalPages: '',
            search: 'tx',
            sort: 're',
            type: 'ac',
            order: 'ds',
            score: 5.0,
            limit: 10 }
    }

    render() {
        return (
            <div className="results item.group">
            <Helmet>
                <title>Search Results - Arc-Hive</title>
            </Helmet>
            { this.state.isLoading ? (
                <Grid centered><Grid.Column width={12}>
                    {this.getLoader()}
                </Grid.Column></Grid>

            ) : (
                <Fragment>
                <Grid centered><Grid.Column width={12}>
                    {this.statusMessage()}
                </Grid.Column></Grid>
                { this.state.results.length > 0 ? (
                    <Fragment>
                    <Grid centered><Grid.Column width={12}>
                        {this.disResults()}
                    </Grid.Column></Grid>
                    <Grid centered><Grid.Column width={12} textAlign='center'>
                        {this.pagNav()}
                    </Grid.Column></Grid>
                    </Fragment>
                ) : (null)}
                </Fragment>
            )}
            </div>
        )
    }

    componentDidMount = () => {
        this.qPrep()
    };
    
    componentDidUpdate  = (prevProps) => {
        if (this.props.location.search !== prevProps.location.search) {
            this.qPrep();
        }
    };

    qPrep = () => {
        const qParams = queryString.parse(this.props.location.search, {arrayFormat: 'comma'})
        this.setState({errMessage: ''})
        if (qParams.q) {
            if (qParams.q.length <= 2) {
                this.setState({ results: [], isLoading: false, errMessage: 'Query must be at least 3 characters.'})
                this.handleLoad(false);
            } else {
                this.setState({
                    query: qParams.q,
                    search: (qParams.o && qParams.o[0]) || this.state.search,
                    sort: (qParams.o && qParams.o[1]) || this.state.sort,
                    type: (qParams.o && qParams.o[2]) || this.state.type,
                    order: (qParams.o && qParams.o[3]) || this.state.order,
                    score: (qParams.o && qParams.o[4]) || this.state.score,
                    limit: (qParams.o && qParams.o[5]) || this.state.limit,
                    page: qParams.p || this.state.page
                })
                this.getResults();
            }
        } 
    }

    handleLoad  = (bool) => {
        this.props.handleLoad(bool)
    };

    statusMessage = () => {
        if (this.state.query) {
            if (this.state.errMessage) {
                return(
                    <Message negative>
                    <Message.Header>Search Error</Message.Header>
                    <p>{this.state.errMessage}</p>
                    </Message>
                )
            } else if (this.state.results.length < 1){ //this is likely a 401 and not a results issue
                return(
                    <Message negative>
                    <Message.Header>Search Error</Message.Header>
                    <p>API Response Error :(</p>
                    </Message>
                )
            } 
            else {
                return (
                    <Message positive>
                        <Message.Header>Search Results</Message.Header>
                        <p>{this.state.totalDocs} results returned. Showing page {this.state.page} of {this.state.totalPages}.</p>
                    </Message>
                )
            }
        } else {
            return(null)
        }
    }
 
    disPlaceHolders = () => {
        let placeHolders = []
        placeHolders.push(<Divider hidden/>)
        for (let i=0; i <= this.state.limit; i++) {
            placeHolders.push(
                <Placeholder key={i} fluid>
                <Placeholder.Header image>
                <Placeholder.Line />
                </Placeholder.Header>
                <Placeholder.Paragraph>
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
                </Placeholder.Paragraph>
                </Placeholder>
            )
        }
        return (placeHolders)
    }

    getLoader = () => {
        return (
            <Fragment>
                <Divider hidden />
                <Divider hidden />
                <Divider hidden />
                <ArcLoader/>
            </Fragment>
        )
    }

    disResults = () => {
        if (this.state.query) {
            const Results = this.state.results.map((o) =>
            <Item key={o._id} as={Link} to={{ pathname: `${o.uri}` }}>
                <Icon name={o.icon} size='large' />
                <Item.Content>
                    <Item.Header>{o.subject}{o.title}</Item.Header>
                    <Item.Meta>{this.formatUser(o.fullname, o.email)}</Item.Meta>
                    <Item.Meta>{this.formatDate(o.prettycreation, o.prettymodification)}</Item.Meta>
                    <Item.Description><p>{o.safebody}{o.safesummary}</p></Item.Description>
                </Item.Content>
            </Item>
            )
            return (
                <Fragment>
                    <Item.Group>
                        {Results}
                    </Item.Group>
                </Fragment>
            )
        } else {
            return null
        }
    }

    pagNav = () => {
        if (this.state.query) {
            return (
                <Pagination
                activePage={this.state.page || 1}
                ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                prevItem={{ content: <Icon name='angle left' />, icon: true }}
                nextItem={{ content: <Icon name='angle right' />, icon: true }}
                totalPages={this.state.totalPages}
                onPageChange={this.handlePaginationChange}
              />
            )
        } else {
            return(null)
        }
    }

    handlePaginationChange = (e, data) => {
        this.props.history.push({
            pathname: this.props.location.pathname,
            search: queryString.stringify({
                q: this.state.query,
                p: data.activePage,
                o: [this.state.search, this.state.sort, this.state.type, this.state.order, this.state.score, this.state.limit],
            }, {arrayFormat: 'comma'})
        })
    }

    getResults = async () => {
        this.handleLoad(true);
        this.setState({isLoading: true})
  
        const apiSearch= backendURL + '/docs'
        const token = await authProvider.getIdToken();
        const idToken = token.idToken.rawIdToken;
   
        setTimeout(() => {
            axios.post( apiSearch, {
                query: this.state.query,
                search: this.state.search,
                sort: this.state.sort,
                type: this.state.type,
                order: this.state.order,
                score: this.state.score,
                limit: this.state.limit,
                page: this.state.page },
                { headers: { Authorization: 'Bearer ' + idToken }
            })
            .then( res => {
                if (!res.data.data) {
                    this.setState({ results: [], isLoading: false, errMessage: "Response Error :("})
                    this.handleLoad(false);
                } else {
                    this.setState({ 
                        page: res.data.page,
                        results: res.data.data,
                        totalDocs: res.data.totalDocs,
                        totalPages: res.data.totalPages,
                        hasPrevPage: res.data.hasPrevPage,
                        hasNextPage: res.data.hasNextPage,
                        prevPage: res.data.prevPage,
                        nextPage: res.data.nextPage,
                        isLoading: false,
                        errMessage: ''} )
                    this.handleLoad(false);
                }
            })
            .catch( error => {
                if (error.response) {
                    this.setState({ results: [], isLoading: false, errMessage: error.response.data.error})
                    this.handleLoad(false);
                } else if (error.request) {
                    this.setState({ results: [], isLoading: false, errMessage: error.request})
                    this.handleLoad(false);
                } else {
                    this.setState({ results: [], isLoading: false, errMessage: error.message})
                    this.handleLoad(false);
                }
            })
        }, 1000)
    };

    //Im OK with doing this parsing here
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

};
