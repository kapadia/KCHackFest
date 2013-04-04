# Collaborative Science Learning Environment

*Abbreviated CSLE, pronounced "sizzle".*

Interactive, collaborative visualization for FITS, Solar System, and Curiosity goodness.

## Setup

### Client

For development, you'll need `brunch`:

    # Install Brunch globally
    npm install brunch -g
    
    # Install project dependencies
    cd frontend
    npm install .
    
    # To build and run local server
    brunch w -s

To deploy, run `brunch build` and serve the `frontend/public` directory.

**Drag-n-Drop Solar System**:
Currently, dynamic textures for the solar system require serving the frontend
with a PHP-enabled server (generally Apache + mod_php).
To enable this, make sure the `images/solar_system` directory is writeable:

    chmod a+rw images/solar_system

**Configuration**:
If you need to change the backend port number
or if you're serving the frontend from a non-root directory,
edit the file `frontend/app/initialize.coffee` to reflect your setup.
Then, `brunch build` to generate the frontend with your specfic configuration.

### Server

The backend depends on Tornado: `pip install tornado`

    python backend/backend.py

If you need to serve from a different port number than the default (8898),
pass the number to the script on the command line:

    python backend/backend.py 12345

Make sure you refresh the page any time the backend needs to restart,
otherwise the websocket connections will silently fail.

## Notes

I made the JS for the solar system like this:

    git clone https://github.com/rybotron/three-solarsystem
    cd three-solarsystem
    cat `grep 'script src' index.html | grep -v libs | cut -d'"' -f2 | xargs` >solar_system.js

It's been modified pretty heavily since, so dropping that file in will no longer be enough.

The rights to the Curiosity model are somewhat tricky, so the model is not included in this repository.
The rover demo will fail semi-gracefully, and that's expected.
Once you get the rover model (from the appropriate NASA/JPL sources),
save it to `frontend/app/assets/models/rover_c4d_001.dae`.
