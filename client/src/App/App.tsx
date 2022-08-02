import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

// import Home from '../components/home.component'

import Upload from '../components/upload.component'
import Main from '../components/main.component'

export default function App() {
    return (
      <div>
        <div>
          <Switch>
            <Route exact path={"/"} component={Upload}/>
            <Route exact path={"/upload"} component={Upload} />
            <Route exact path={"/sessions/:sid"} component={Main} />
            <Route path ={'*'}>
                <Redirect to='/'></Redirect>
            </Route>
          </Switch>
        </div>
      </div>
    )
}
