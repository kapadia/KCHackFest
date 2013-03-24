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

### Server

The backend depends on Tornado: `pip install tornado`

    python backend/backend.py

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
