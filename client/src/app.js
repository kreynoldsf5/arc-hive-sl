import React, {Component} from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { AzureAD } from 'react-aad-msal';
import { authProvider } from './authProvider';
import {Helmet} from "react-helmet";

import Main from "./main";
import Results from "./results";
import Doc from "./doc";
import Redirector from "./redirector";

const initialState = { isLoading: false, value: '' }

class App extends Component {
    constructor() {
        super();
        this.handleLoad = this.handleLoad.bind(this);
        this.handleValue = this.handleValue.bind(this);
        this.state = initialState;
    }

    handleLoad = (bool) => {
        this.setState({ isLoading: bool})
    };

    handleValue = (value) => {
        this.setState({ value: value})
    };

    render() {
    return (
        <div className="ArcHive App">
        <Helmet>
            <title>Search - Arc-Hive</title>
        </Helmet>
        <AzureAD provider={authProvider} forceLogin={true}>
        {
            ({login, logout, authenticationState, error, accountInfo}) => {
                console.log(authenticationState)
                switch (authenticationState) {
                    case authenticationState.Authenticated:
                    return (
                        <this.appRouting />
                    );
                    case authenticationState.Unauthenticated:
                    return (
                        <div>
                        {error && <p><span>An error occurred during authentication.</span></p>}
                        </div>
                    );
                    case authenticationState.InProgress:
                    return (<p>Authenticating...</p>);
                }
            }
        }
        </AzureAD>
        </div>
    );
    };

    appRouting() {
        return (
            <Router>
            <Main 
                handleLoad={this.handleLoad} 
                handleValue={this.handleValue}
                isLoading={this.state.isLoading} 
                />
            <Switch>
                <Route exact path='/'> <Redirect to="/search" /></Route> 
                <Route exact path='/search' render={
                    (props) => <Results {...props} handleLoad={this.handleLoad} handleValue={this.handleValue} value={this.state.value} />
                } />
                {/* Routes used for Redirects */}
                <Route exact path={['/search.jspa', '/login.jspa', '/people']} render={
                    (props) => <Redirector {...props}  />
                } />
                {/* Route used for content */}
                <Route path='/:uid' render={
                    (props) => <Doc {...props}  handleLoad={this.handleLoad} />
                } />
            </Switch>
            </Router>
        )
    }
};
export default App;