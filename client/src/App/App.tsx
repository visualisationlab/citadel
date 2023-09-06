/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 * This file contains the main App component, which is the root of the React app.
 * It contains the routing logic for the app.
 *
 */

import { Switch, Route, Redirect } from 'react-router-dom';

import './App.css';
import '../scss/custom.scss';

import Upload from '../components/upload.component'
import Main from '../components/main.component'

export default function App() {
    document.title = "Citadel"

    return (
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
    )
}
