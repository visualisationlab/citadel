Developing Visgraph
###################


Frontend
========

The frontend is written in React and makes heavy use of useContext and
useReducer (a redux-like reducer system). The application is split up into
components, reducers, and services. The components are the UI elements (except for router),
services maintain a set of API calls, either to communicate between components or with the server.
The reducers are the state management system, and are used to update the state of the application.

Server
======
The server runs many sessions at once in an Express server. Each session is a separate instance of a class
(session) that contains all the information about the session. It communicates with the frontend and the AR headset via
websockets.


AR (Unity)
==========
The application is written in C# using Unity and the Microsoft Mixed Reality
Toolkit 2.0. It uses websockets to connect to the backend and receive
node and edge information, as well as session data.
