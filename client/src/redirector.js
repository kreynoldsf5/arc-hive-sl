import React, {Component} from 'react';
import { Redirect } from "react-router-dom";
import queryString from 'query-string'


export default class Redirector extends Component {

    render() {
        console.log(this.props)
        return (
            this.redir()
        )
    };

    redir = () => {
        const qParams = queryString.parse(this.props.location.search, {arrayFormat: 'comma'})
        console.log(qParams)
        switch(this.props.location.pathname) {
            case "/search.jspa":
              if (qParams.q) {
                  return ( 
                    <Redirect to={{
                        pathname: "/search",
                        search: queryString.stringify({
                            q: qParams.q,
                        }, {arrayFormat: 'comma'})
                    }}
                    />
                  )
              }
              else { return ( <Redirect to="/search" /> ) };
            case "/login.jspa":
                if (qParams.referer) {
                    const thisPath = this.fullyDecodeURI(qParams.referer)
                    return ( 
                        <Redirect to={{
                            pathname: thisPath,
                        }}
                        />
                    )
                }
                else { return ( <Redirect to="/search" /> ) };
            case "/people":
                if (qParams.query) {
                    return ( 
                        <Redirect to={{
                            pathname: "/search",
                            search: queryString.stringify({
                                q: qParams.query,
                                p: 1,
                                o: ["au", "re", "ac", "ds", 5, 10],
                            }, {arrayFormat: 'comma'})
                        }}
                        />
                    )
                }
                else { return ( <Redirect to="/search" /> ) };
            default: //Never gonna get here
              return ( <Redirect to="/search" /> )
          }
    }

    isEncoded = (uri) => {
        var thisUri = uri || '';
        return thisUri !== decodeURIComponent(thisUri);
    }

    fullyDecodeURI = (uri) => {
        while (this.isEncoded(uri)){
            uri = decodeURIComponent(uri);
            }
        return uri;
    }

};