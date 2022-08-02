"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_router_dom_2 = require("react-router-dom");
require("./App.css");
require("bootstrap/dist/css/bootstrap.min.css");
// import AuthService from "../services/auth.service";
// import Login from "../components/login.component";
// import Register from "../components/register.component";
const home_component_1 = __importDefault(require("../components/home.component"));
// import Profile from "../components/profile.component";
// import BoardUser from "../components/board-user.component";
// import BoardModerator from "../components/board-moderator.component";
// import BoardAdmin from "../components/board-admin.component";
const gimp = require('../GIMP_Pepper.png');
function App() {
    // constructor(props : {}) {
    //     super(props);
    //     // this.logOut = this.logOut.bind(this);
    //     this.state = {
    //     showModeratorBoard: false,
    //     showAdminBoard: false,
    //     currentUser: undefined,
    //     };
    // }
    //   componentDidMount() {
    // const user = AuthService.getCurrentUser();
    // if (user) {
    //   this.setState({
    //     currentUser: user,
    //     showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
    //     showAdminBoard: user.roles.includes("ROLE_ADMIN"),
    //   });
    // }
    //   }
    //   logOut() {
    //     AuthService.logout();
    //   }
    // const { currentUser, showModeratorBoard, showAdminBoard } = this.state;
    return (<div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <react_router_dom_1.Link to={"/"} className="navbar-brand">
            Libre GNUGraph <span onClick={() => window.location.replace("https://imgur.com/r/linux/eeq6han")}><img width='30' height='30' src={gimp} alt="Green Is My Pepper"></img></span>
          </react_router_dom_1.Link>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <react_router_dom_1.Link to={"/home"} className="nav-link">
                Home
              </react_router_dom_1.Link>
            </li>
            </div>
            {/* {showModeratorBoard && (
          <li className="nav-item">
            <Link to={"/mod"} className="nav-link">
              Moderator Board
            </Link>
          </li>
        )}
        {showAdminBoard && (
          <li className="nav-item">
            <Link to={"/admin"} className="nav-link">
              Admin Board
            </Link>
          </li>
        )}
        {currentUser && (
          <li className="nav-item">
            <Link to={"/user"} className="nav-link">
              User
            </Link>
          </li>
        )}
      </div>
      {currentUser ? (
        <div className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to={"/profile"} className="nav-link">
              {currentUser.username}
            </Link>
          </li>
          <li className="nav-item">
            <a href="/login" className="nav-link" onClick={this.logOut}>
              LogOut
            </a>
          </li>
        </div>
      ) : (
        <div className="navbar-nav ml-auto">
          <li className="nav-item">
            {/* <Link to={"/login"} className="nav-link">
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/register"} className="nav-link">
              Sign Up
            </Link>
          </li>
        </div>
      )} */}
        </nav>
        <div>
          <react_router_dom_1.Switch>
            <react_router_dom_2.Route exact path={"/"} component={home_component_1.default}/>
            <react_router_dom_2.Route exact path={"/home"} component={home_component_1.default}/>
            {/* <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/profile" component={Profile} /> */}
            {/* <Route path="/user" component={BoardUser} />
        <Route path="/mod" component={BoardModerator} />
        <Route path="/admin" component={BoardAdmin} /> */}
          </react_router_dom_1.Switch>
        </div>
      </div>);
}
exports.default = App;
