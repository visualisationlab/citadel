import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

// import AuthService from "../services/auth.service";
// import Login from "../components/login.component";
// import Register from "../components/register.component";
import Home from '../components/home.component'
import Upload from '../components/upload.component'
// import Profile from "../components/profile.component";
// import BoardUser from "../components/board-user.component";
// import BoardModerator from "../components/board-moderator.component";
// import BoardAdmin from "../components/board-admin.component";

export default function App() {
    return (
      <div>
        <div>
          <Switch>
            <Route exact path={"/"} component={Upload}/>
            <Route exact path={"/upload"} component={Upload} />
            <Route exact path={"/sessions/:sid"} component={Home} />
            <Route path ={'*'}>
                <Redirect to='/'></Redirect>
            </Route>
          </Switch>
        </div>
      </div>
    )
}
