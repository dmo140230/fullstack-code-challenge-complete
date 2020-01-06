import React, { Component } from "react";
import axios from 'axios';
import Product from './Product';

class Inventory extends Component {
    state = {
        products: []
    }

    componentWillMount = async () => {
        return await this.getProducts();
    }
    
    getProducts = async () => {
        let body = {
            user_id: this.props.user.id,
        }
        let config = {
            headers: {
                'Authorization': `Bearer: ${this.props.token}`,
                'Content-Type': "application/json"
            }
        };
        let response;

        try {
            response = await axios.post('/api/v1/product/owned', body, config);
            this.setState({products:  response.data.result })
        } catch (error) {
            console.log(error);
        }
        return
    }

    render() {
        const ProductList = this.state.products.map(product => (
            <Product key={product.id} {...product}/>
        ));

        return (
            <div className="inventory">
                <div className="header">Inventory</div>
                <div className="list">
                    {!ProductList.length && <div>Inventory is Empty</div>}
                    {ProductList}
                </div>
                <div className="return" onClick={() => this.props.finished() }>Return</div>
            </div>
        );
    }
}

export default Inventory;