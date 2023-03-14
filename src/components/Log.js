import { Outlet, Link } from "react-router-dom";
import React, { Component, useState } from "react";
const PORT=3200;

class Log extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
    this.handleSubmit2 = this.handleSubmit2.bind(this);
  }

  handleSubmit2(e) {
    e.preventDefault();
    const {email,password}=this.state;
    // console.log(email, password);
    fetch(`http://localhost:${PORT}/user/login`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data, "userLogin_Response");
        if (data.status == 201) {
          alert("Login successful");
          window.localStorage.setItem("token", data.data);
          // window.localStorage.setItem("loggedIn", true);
          window.location.href = "/Login_Register/userDetails";
          // window.location.href = "/userDetails";
          
        }
        else if(data.status == 400){
          alert(data.error);
        }
      });
  }
  render() {
    var lst = {
      display: "flex",
      justifyContent: "center",
      position: "relative",
      top: 200,
    };
    var st = {
      textAlign: "center",
      padding: 4,
    };

    return (
      <form onSubmit={this.handleSubmit2}>
        <>
          <div style={lst}>
            <div className="wrap">
              <h2 style={st}>Log in</h2>
              <fieldset>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingInput"
                    placeholder="name@example.com"
                    // required
                    onChange={(e) => this.setState({ email: e.target.value })}
                  />
                  <label htmlFor="floatingInput">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPassword"
                    placeholder="Password"
                    // required
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>
                <div className="d-grid gap-2 my-4">
                  <button className="btn  btn-primary">Submit</button>
                </div>

                <div className="d-grid gap-2 my-4">
                  <Link to="/sign">
                    <button className="btn  btn-dark">Sign in</button>
                  </Link>
                </div>
              </fieldset>
            </div>
          </div>
          <div></div>
          <Outlet />
        </>
      </form>
    );
  }
}

export default Log;