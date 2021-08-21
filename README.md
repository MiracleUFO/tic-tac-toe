# TicTacToeFrontend
Two player, real-time game made using React and a socket.io enabled API

### Setup: 

### Running the API Server
- Install the dependencies via `npm i`
- Run the server with `npm start`

### Running the React Server
- Install the dependencies via `npm i` or `yarn install`
- Run the server with `npm start` or `yarn start`

### Setting up the React server to run on different devices

- In App.js line:12 change the BASEURL to `YOUR_NETWORK_IP_ADDRESS:BackendPort`. To find `YOUR_NETWORK_IP_ADDRESS` follow these steps here: https://support.microsoft.com/en-us/windows/find-your-ip-address-f21a9bbc-c582-55cd-35e0-73431160a1b9 or https://setapp.com/how-to/find-ip-address-on-mac. `BackendPort` is the port the API Server is served on on your PC.
- Users can now play the game on their various devices by entering the following in their browser's address bars, `YOUR_NETWORK_IP_ADDRESS:FrontendPort`, where `FrontendPort` is the port the React Server is served on


### Broaching improvements that can  be made to UI based on API limitations:

 - A user would be able to play against a particular user in different matches and their score board should be made available to be displayed in the UI, but at this time users have a new playerId generated in each match and are therefore not uniquely identified in the system
 - A user would be able to select to join open matches (matches with only one player) by inputting the matchId or clicking on the match in the frontend, but open matches are not exposed by the backend at this time, instead users are randomly assigned to open matches
 - A user would have a game profile so that they get equally matched with similar users when they choose to be randomly matched by the system

### Description of how a user can cheat based on the API limitations: 
- Premise: On reload a new playerId is given to a user, and when they start the game they either join a new match or an existing match.
- Actions: Reloading or restarting the game several times can lead the same user to a match they joined previously as a different user (with a different playerId) and they can play against themselves.


``` JavaScript (Major methods)

    useEffect(() => {
        //  some code here
    }, []): Runs when the app initially mounts, selects board, and adds event listener to start button

    useEffect(() => {
        //  some code here
    }, [MATCH_ID]): Runs when the matchId is updated in state. In here both socket.on events start listening as soon as  a user joins a match.

    startGame(): This is trigerred when a user clicks the start button displayed when the game starts. It makes a `play` call to the API with a player uuid to join a match. On joining the match, the matchID is set in state for display in the UI, also if the response shows another user had joined the match previously it is updated in the state and displayed in the UI. The board is cleared in UI and intro music played.

    handleClick(): Triggered when a user clicks a cell in the game board. The position clicked is determined and a `submitMove` call is made to the API, the board parameter in the response object of this call is spread and is used to apply the corresponding CSS class to the board in UI (i.e the board is updated).
```

Aside: I chose to use React Hooks because they gave a clearer picture of what was being updated in state and why, though they have the downside that event listeners could not access the current state without me having to use React's useRef() to bind some properties and their current state