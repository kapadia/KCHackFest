# Collaborative Science Learning Environment

*Abbreviated CSLE, pronounced "sizzle".*

Interactive, collaborative visualization for FITS, Solar System, and Curiosity goodness.

## Local Setup

    # Install Brunch globally
    npm install brunch -g
    
    # Install project dependencies
    cd frontend
    npm install .
    
    # To run local server
    brunch w -s
    
    # To build
    brunch build

## Notes

I made the JS for the solar system like this:

    git clone https://github.com/rybotron/three-solarsystem
    cd three-solarsystem
    cat `grep 'script src' index.html | grep -v libs | cut -d'"' -f2 | xargs` >solar_system.js
