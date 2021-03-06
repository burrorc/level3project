import React from "react";
import { Switch } from "react-router-dom";
import Home from "./pages/Home/Home";
import Attendance from "./pages/Attendance/Attendance";
import Dashboard from "./pages/Dashboard/Dashboard";
import Records from "./pages/Records/Records";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { auth } from "./firebase/firebase";
import { db } from "./firebase/firebase";
import {
  signup,
  login,
  signInWithGoogle,
  //signInWithFacebook,
  signOut,
} from "./firebase/auth";

class App extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      error: null,
      userName: null,
      userID: null,
      userClassList: [],
      userAttendanceRecord: [],
      email: "",
      password: "",
      passwordConfirm: "",
    };
    this.changeLogIn = this.changeLogIn.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    //this.facebookLogin = this.facebookLogin.bind(this);
    this.signOut = this.signOut.bind(this);
    this.checkUserDb = this.checkUserDb.bind(this);
  }

  handleClassSelection(subject) {
    this.setState({
      classSelection: subject - 1,
    });
  }

  //gets and assigns user data from firebase
  checkUserDb(user) {
    db.collection("users")
      .doc(user)
      .onSnapshot((snapshot) => {
        if (snapshot.data().classList) {
          this.setState({
            userClassList: snapshot.data().classList,
          });
        }
        if (snapshot.data().attendance) {
          this.setState({
            userAttendanceRecord: snapshot.data().attendance,
          });
        }
      });
  }
  
  //initiates auth listener and gets user data
  componentDidMount() {
    this._isMounted = true
    this._isMounted = true
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          isLoggedIn: true,
          loading: false,
          userID: user.uid,
          userName: user.email,
        });
        this.checkUserDb(this.state.userID);
      } else {
        this.setState({
          isLoggedIn: false,
          loading: false,
        });
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  //displays field value as typed
  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  //clear form
  resetForm() {
    this.setState({
      email: "",
      password: "",
      passwordConfirm: "",
      error: "",
    });
  }

  //email sign up
  handleSignUp(event) {
    event.preventDefault();
    this.setState({ error: "" });
    if (this.state.password !== this.state.passwordConfirm) {
      this.setState({
        error: "PASSWORD MUST MATCH CONFIRM PASSSWORD",
        password: "",
        passwordConfirm: "",
      });
    } else {
      signup(this.state.email, this.state.password)
        .then((cred) => {
          db.collection("users").doc(cred.user.uid).set({
            userName: cred.user.email,
          });
          this.setState({
            userName: cred.user.email,
            userID: cred.user.uid,
            showSignup: "none",
          });
        })
        .then(() => document.getElementById("closeSignup").click())
        .catch((error) => {
          this.setState({ error: error.message });
        });
    }
  }

  //email login
  handleLogin(event) {
    event.preventDefault();
    this.setState({ error: "" });
    login(this.state.email, this.state.password)
      .then((cred) => {
        this.setState({
          userName: cred.user.email,
          userID: cred.user.uid,
          showLogin: "none",
        });
      })
      .then(() => document.getElementById("closeLogin").click())
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  //google for login with check for new/old user
  googleLogin(newUser) {
    signInWithGoogle()
      .then((cred) => {
        if (newUser) {
          db.collection("users").doc(cred.user.uid).set(
            {
              userName: cred.user.email,
            },
            { merge: true }
          );
        }
        this.setState({
          userName: cred.user.email,
          userID: cred.user.uid,
          showSignup: "none",
        });
      })
      .then(() => document.getElementById("closeSignup").click())
      .then(() => document.getElementById("closeLogin").click())
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  //facebook for login with check for new/old user
  // facebookLogin(newUser) {
  //   signInWithFacebook()
  //     .then((cred) => {
  //       if (newUser) {
  //         db.collection("users").doc(cred.user.uid).set(
  //           {
  //             userName: cred.user.email,
  //           },
  //           { merge: true }
  //         );
  //       }
  //       this.setState({
  //         userName: cred.user.email,
  //         userID: cred.user.uid,
  //         showSignup: "none",
  //       });
  //     })
  //     .then(() => document.getElementById("closeSignup").click())
  //     .then(() => document.getElementById("closeLogin").click())
  //     .catch((error) => {
  //       this.setState({ error: error.message });
  //     });
  // }

  //resets user cred in state to null
  signOut() {
    signOut().then(
      () =>
        this.setState({
          userName: null,
          userID: null,
          userClassList: [],
          userAttendanceRecord: [],
        })
    )
  }

  changeLogIn() {
    this.setState((prevState) => {
      return {
        isLoggedIn: !prevState.isLoggedIn,
      };
    });
  }
  render() {
    return (
      <div>
        <Signup
          handleSignUp={this.handleSignUp}
          handleChange={this.handleChange}
          email={this.state.email}
          password={this.state.password}
          passwordConfirm={this.state.passwordConfirm}
          error={this.state.error}
          googleLogin={this.googleLogin}
          facebookLogin={this.facebookLogin}
          resetForm={this.resetForm}
        />
        <Login
          handleLogin={this.handleLogin}
          handleChange={this.handleChange}
          email={this.state.email}
          password={this.state.password}
          passwordConfirm={this.state.passwordConfirm}
          error={this.state.error}
          googleLogin={this.googleLogin}
          facebookLogin={this.facebookLogin}
          resetForm={this.resetForm}
        />
        <Header
          isLoggedIn={this.state.isLoggedIn}
          signOut={this.signOut}
          changeLogIn={this.changeLogIn}
        />
        <Switch>
          <PublicRoute
            component={Home}
            isLoggedIn={this.state.isLoggedIn}
            path="/"
            exact
          />
          <PrivateRoute
            component={Attendance}
            isLoggedIn={this.state.isLoggedIn}
            userID={this.state.userID}
            userClassList={this.state.userClassList}
            userAttendanceRecord={this.state.userAttendanceRecord}
            path="/attendance"
            exact
          />
          <PrivateRoute
            component={Records}
            isLoggedIn={this.state.isLoggedIn}
            userID={this.state.userID}
            userAttendanceRecord={this.state.userAttendanceRecord}
            path="/records"
            exact
          />
          <PrivateRoute
            component={Dashboard}
            isLoggedIn={this.state.isLoggedIn}
            userID={this.state.userID}
            userClassList={this.state.userClassList}
            classSelection={this.state.classSelection}
            path="/dashboard"
            exact
          />
        
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default App;
