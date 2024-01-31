# Fight Night

## Running the software

To run the software, serve the `src` directory with a server of your liking.

1. Run the software
   - Node.js: run `npm install && npm run serve`
   - Python 3: run `python -m http.server -d src`
1. Open `http://www.localhost:8000/audience.html` in your browser for the audience screen
1. Open `http://www.localhost:8000/control.html` in your browser for the control screen

## Configuration

You may set defaults for the questions by editing `src/config.js`.
Configuration done in the UI will _always_ override the defaults.
