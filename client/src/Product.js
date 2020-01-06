import React from 'react';

const Product = ({name, price, description, image}) => (
    <div className="product">
        <div className="picture" style={ { backgroundImage: `url(${image})` }  }></div>
        <div className="details">
            <div>{name}</div>
            <div>{price}</div>
            <div>{description}</div>
        </div>
    </div>
);

export default Product;