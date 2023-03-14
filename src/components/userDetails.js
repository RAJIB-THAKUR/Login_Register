import React, { Component } from "react";
const PORT = 3200;

class UserDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: "",
    };
  }
  componentDidMount() {
    fetch(`http://localhost:${PORT}/user/userData`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data, "userData");
        this.setState({ userData: data.data });
      });
  }
  render() {
    return (
      <div>
        Email<h1>{this.state.userData.email}</h1>
        Name<h1>{this.state.userData.name}</h1>
        Mobile<h1>{this.state.userData.mobile}</h1>
      </div>
    );
  }
}
export default UserDetails;
