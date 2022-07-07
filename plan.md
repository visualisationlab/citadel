- Create new session when user visits website (future: Logs in)
- User enters URL to download graph (future: list of previous URLs)
- User receives code with which to connect to API
- Graph is loaded, layout is generated
- Layout is sent back to user via websocket


Server Requirements:
- Keep track of users (login)
- Keep track of sessions with cytoscape instances
  - Sessions have a current graph state and history
  - Layout settings
  - Option to download current state (and history?)
  - Connection with AR headset
  - API
  - Network modification (add/delete/modify)
  - Network analysis (cytoscape/other)

Client Requirements:
- Login
- Upload URL
- Interface with server WS
- Cytoscape options interface
- Adding nodes/deleting nodes
- Adding attributes/changing attributes
- 'VCR' tracking
  - Scrolling to different parts of graph
  - Play
  - Reverse
  - Go to timestamp
- Edge analysis
-
