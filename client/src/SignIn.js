import React, { Component } from "react";
import axios from 'axios';
import TextField from './TextField';

class SignIn extends Component {
    state = {
        input: {
            email: false,
            pass: false,
        },
        errors: {
            signin: false,
        }
    }

    onEmailChange = (e) => {
        if(!e || !e.hasOwnProperty('target'))
            return;
        let update = {...this.state.input, email: e.target.value };
        this.setState({input: update})
    }

    onPassChange = (e) => {
        if(!e || !e.hasOwnProperty('target'))
            return;
        let update = {...this.state.input, pass: e.target.value };
        this.setState({input: update})
    }

    signIn = async (email, pass) => {
        if(!email || !pass)
            return this.setState({errors: {signin: "Email and Password are required."}})

        let body = {
            email: email,
            password: pass,
        }
        let config = {
            headers: {'Content-Type': "application/json"}
        };
        let response;

        try {
            response = await axios.post('/api/v1/signin', body, config);
            if(!response || !response.hasOwnProperty('data') || !response.data.hasOwnProperty('token'))
                return this.setState({errors: {signin: "Failed to login."}})
        } catch (error) {
            console.log(error);
            return this.setState({errors: {signin: "Invalid login."}})
        }
        if(typeof this.props.onSignIn === 'function')
            return this.props.onSignIn(response.data.token);
        console.log(response.data.token);
    }

    render() {
        return (
            <div className="form">
                <div className="header">Account Login</div>
                <div className="input_group">
                    <TextField type="text" name="email" label="Email" onChange={this.onEmailChange} />
                    <TextField type="password" name="password" label="Password" onChange={this.onPassChange} />
                </div>
                <div className="signin" onClick={() => this.signIn(this.state.input.email, this.state.input.pass) } >Login</div>
                {this.state.errors.signin && <div>{this.state.errors.signin}</div>}
            </div>
        );
    }
}

export default SignIn;