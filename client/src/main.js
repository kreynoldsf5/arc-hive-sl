import React, { Component } from 'react';
import { Image, Divider, Input, Grid, Button, Icon, Form, Transition, Message } from 'semantic-ui-react';
import { withRouter } from "react-router-dom";
import queryString from 'query-string'
import Hive from "./hive.png";

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '', query: '', opToggle: false, opError: false, opErrMess: '', search: 'tx', sort: 're', type: 'ac', order: 'ds', score: 5.0, limit: 10 }
        this.handleLoad = this.handleLoad.bind(this);
        this.handleValue = this.handleValue.bind(this);
      };

    render() {
        return (
            <div>
            <Divider hidden/>
            <Grid centered columns={2}><Grid.Row>
            <Grid.Column width={1}>
            <Image 
                src={Hive} 
                size='mini'
                href='https://github.com/kreynoldsf5/arc-hive-sl'
                target='_blank' 
            />
            </Grid.Column>
            <Grid.Column width={13}>
            <Input type='text' 
                fluid
                size='large'
                placeholder='Search Arc-Hive...' 
                iconPosition='left'
                loading={this.props.isLoading}
                onChange={this.handleChange}
                onKeyDown={this.handleKeys}
                value={ this.state.value }
                action>
                <Icon name='search'/>
                <input />
                <Button toggle active={this.state.opToggle} animated='fade' onClick={this.handleOpClick}>
                    <Button.Content hidden>Options</Button.Content>
                    <Button.Content visible>
                    <Icon name='sidebar' />
                    </Button.Content>
                </Button>
            </Input>
            </Grid.Column>
            </Grid.Row>
            {this.disOptions()}
            </Grid>
            
            </div>
        )
    };

    handleChange = (e, data) => {
        this.setState({ value: data.value })
    }

    handleKeys = (e) => {
        if (e.key === 'Enter') {
            this.setState({ query: this.state.value}) //fwiw -- state update is too lazy
            this.redirResults(this.state.value) //is there going to be a timing issue here?
        } else if (e.key === 'Escape') { 
            this.setState({ value: ''})
        }
    }

    handleLoad = (bool) => {
        this.props.handleLoad(bool)
    };

    handleValue = (value) => {
        this.props.handleValue(value)
    };

    handleOpClick = (e) => {
        this.setState(prevState => ({
            opToggle: !prevState.opToggle 
        })
        )
    }

    opChange = name => (e, { value }) => this.setState({ [name]: value });

    resetOps = (e) => {
        e.preventDefault();
        this.setState({search: 'tx', sort: 're', type: 'ac', order: 'ds', score: 5.0, limit: 10})
    }

    handleAdvSubmit = (e) => {
        this.redirResults(this.state.value) 
    }

    disOptions = () => {
        const { search, sort, type, score, limit } = this.state
        //Build indexes for each of these
        const SearchByOptions = [
            { key: 'tx', text: 'Text', value: 'tx' },
            //{ key: 'ti', text: 'Title', value: 'ti' },
            { key: 'au', text: 'Author', value: 'au' }
        ]

        const SortByOptions = [
            { key: 're', text: 'Relevance', value: 're'},
            { key: 'cd', text: 'Creation Date', value: 'cd'},
            { key: 'md', text: 'Modification Date', value: 'md'}
        ]

        const docType = [
            { key: 'ac', text: 'All Content', value: 'ac'},
            { key: 'do', text: 'Documents', value: 'do'},
            { key: 'bp', text: 'Blog Posts', value: 'bp'}
        ] 

        return (
            <Transition visible={this.state.opToggle} animation='slide down' duration={150}>
            <Form onSubmit={this.handleAdvSubmit}>
            <Form.Group widths='equal'>
              <Form.Select
                width={3} 
                label='Search'
                options={SearchByOptions}
                value={search}
                //placeholder={SearchByOptions.find(o => o.value === this.state.search)['text']}
                onChange={this.opChange("search")}
              />
              <Form.Select
                width={3} 
                label='Sort'
                options={SortByOptions}
                value={sort}
                //placeholder={SortByOptions.find(o => o.value === this.state.sort)['text']}
                onChange={this.opChange("sort")}
              />
              <Form.Select
                width={3} 
                label='Type'
                options={docType}
                value={type}
                //placeholder={docType.find(o => o.value === this.state.type)['text']}
                onChange={this.opChange("type")}
              />
 
            </Form.Group> 
            <Form.Group inline>

            </Form.Group>
        <Form.Group inline>
          <label>Order</label>
          <Form.Radio
            label='Descending'
            value='ds'
            checked={this.state.order === 'ds'}
            onChange={this.opChange("order")}
          />
          <Form.Radio
            label='Ascending'
            value='as'
            checked={this.state.order === 'as'}
            onChange={this.opChange("order")}
          />
            <Form.Input width={3} 
                value={score} 
                onChange={this.opChange("score")}
                label='Relevance Score'
                name='score'
                placeholder={this.state.score}
            />
            <Form.Input width={3} 
                value={limit} 
                onChange={this.opChange("limit")}
                label='Results /Page'
                name='limit'
                placeholder={this.state.limit}
            />
            <Form.Button  width={2} onClick={this.resetOps} content='Defaults' />
            <Form.Button  width={2} positive type="submit" content='Search' />
            </Form.Group>        
          </Form>
          </Transition>
        )
    }

    disErrMessage = () => {
        return(
            <Message negative>
            <Message.Header>Error</Message.Header>
            <p>{this.state.errMessage}</p>
            </Message>
        )
    }

    redirResults = (query) => {
        this.props.history.push({
            pathname: "/search",
            search: queryString.stringify({
                q: query,
                o: [this.state.search, this.state.sort, this.state.type, this.state.order, this.state.score, this.state.limit],
                p: 1
            }, {arrayFormat: 'comma'})
        })
    }

};

export default withRouter(Main);
