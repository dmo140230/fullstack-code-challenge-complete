import React from "react";
import Slider from "react-slick";

const Users = ({rows, viewUser}) => {
    const carouselItems = rows.map(user => (
        <div className="user" key={user.id}>
            <div className="icon"></div>
            <div className="details">
                <label>ID: </label><div>{user.id}</div>
                <label>Name: </label><div>{user.first_name} {user.last_name}</div>
                <label>Email: </label><div>{user.email}</div>
                <div className="view_link" onClick={() => viewUser(user) } >View {user.first_name}'s Products</div>
            </div>
            
        </div>
    ));
    let settings = {
        dots: true
    };
    return (
      <div className="container">
        <Slider style={{padding: `5px`,maxWidth: '700px',margin: '0 10px'}} {...settings}>
          {carouselItems}
        </Slider>
      </div>
    );
};

export default Users;