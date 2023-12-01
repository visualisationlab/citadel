# Generate a .env file for the server
# Usage: python3 generate_env.py

import os
import readline

class EnvironmentKey:
    def __init__(self, key, default_value, description):
        self.key = key
        self.default_value = default_value
        self.description = description

    def __str__(self):
        return self.key + "=" + self.default_value
    
    def __repr__(self):
        return self.key + "=" + self.default_value + " (" + self.description + ")"
    
    def __eq__(self, other):
        return self.key == other.key
    
keys = [
    EnvironmentKey("SESSION_CHECKING_INTERVAL", "60", "How often to check for expired sessions (in seconds)"),
    EnvironmentKey("SESSION_TIMEOUT", "24", "How long a session lasts (in hours)"),
    EnvironmentKey("LOCAL_ADDRESS", "dev.citadel", "The local address of the server used for CORS"),
    EnvironmentKey("WEBSOCKET_PORT", "3001", "The port for the websocket server"),
    EnvironmentKey("DEFAULT_GRAPH_URL", "", "URI for accessing the default graphs"),
    EnvironmentKey("NODE_ENV", "development", "The environment the server is running in (development or production)"),
]

# Get the current directory
current_dir = os.path.dirname(os.path.realpath(__file__))

# Get the parent directory
parent_dir = os.path.dirname(current_dir)

# Get the server directory
server_dir = parent_dir + "/server"

# Input loop for the .env file
print("Please enter the following information for the .env file:")
print("")

for key in keys:
    value = input(key.key + " (default: " + key.default_value + ") - " + key.description + ": ")
    if value == "":
        value = key.default_value

    key.default_value = value

# Create the .env file
with open(server_dir + "/.env", "w") as env_file:
    for key in keys:
        env_file.write(str(key) + "\n")

print("Created .env file with the following contents:")
print("")

for key in keys:
    print(key)