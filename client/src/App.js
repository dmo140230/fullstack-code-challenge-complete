// client/src/App.js
import React, { Component } from "react";
import axios from 'axios';
import SignIn from './SignIn';
import Users from './Users';
import Inventory from "./Inventory";

class App extends Component {
    state = {
        token: null,
        user: null,
        page: null,
        users: [],
        errors: {
            users: null,
        }
    };

    componentDidMount = async () => {
        await this.getUsers();
    }

    getUsers = async () => {
        try {
            let response = await axios.get('/api/v1/users');
            return this.setState({users:  response.data.users })
        } catch (error) {
            return console.log(error);
        }
    }

    viewUser = async (user) => {
        return this.setState({user:  user })
    }

    gotToken = (token) => {
        return this.setState({token: token})
    }
    
    render() {
        if(!this.state.token)
            return <SignIn onSignIn={this.gotToken}></SignIn>;
        if(this.state.user)
            return <Inventory {...this.state} finished={this.viewUser}/>
        return <Users rows={this.state.users} viewUser={this.viewUser} ></Users>
    }
}

export default App;