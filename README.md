# Fight Night

## Running the software from mock server

To run the software, serve the `src` directory with a server of your liking.

1. Run the software
   - Node.js: run `npm install && npm run serve`
   - Python 3: run `python -m http.server -d src`
1. Open `http://www.localhost:8000/audience.html` in your browser for the audience screen.
1. Open `http://www.localhost:8000/control.html` in your browser for the control screen.

## Configuration

You may set defaults for the questions by editing `src/config.js`.
Configuration done in the UI will _always_ override the defaults.

## Technician workflow
### Setup
At start of show, run 'start.bat' in the fightnight voting folder.
Open `http://www.localhost:3000/audience.html` in your browser for the audience screen, click to go fullscreen.
Open `http://www.localhost:3000/control.html` in your browser for the control screen.

Enter start and end ID's to start the hardware. Should be running throughout the show.

Every few seconds, the control screen polls the server to check if the hardware is running.
A green circle indicates that the hardware is running, while a red circle indicates that the hardware is not running.

### Voting
'Start voting' starts a vote, shows options on audiencescreen.
Script imports results into textboxes every second.
Publish results closes the voting and publishes the resuls on audience html.
To edit results, click close voting first, then edit values in publish textboxes.

Results are publishable 1 by 1 (for questions 5,6,14,15,16,17,18).
Press close voting first, then use publish buttons next to results in right order.
Options for questions are imported from config.js, some options are dependable on outcome of performance and need to be adjusted by hand.
Type right words into option fields in the right column.

### End of performance
Stop hardware with stop button.
Press export results button, save CSV file in folder /results under the name.
LOCATION_DAYMONTHYEAR.csv (add number if multiple performances a day) (i.e. AMSTERDAM_211120241.csv)

### Info
Publish stores results in local storage, stays available until overwritten.
Audience html listens on localstorage for changes to show right info.
