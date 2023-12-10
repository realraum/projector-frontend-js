# projector-frontend-js
A web frontend and backend for controlling a Dell Projector using their TCP protocol.
The frontend only uses HTML and CSS, and the backend is written in Node.js.
The frontend works using HTML forms and redirects on the backend.
The frontend includes some optional javascript for better UX, but all buttons work without it.

This project was inspired by https://github.com/Grayda/dell-control.

## Usage
1. Clone the repository
2. Install dependencies with `yarn install`
3. Run the server with `yarn start`

## Configuration
The server can be configured using environment variables.
The following variables are available:
- SERVER_PORT: 3000 (default)
- SERVER_ADDRESS: 0.0.0.0 (default)
- BEAMER_ADDRESS: '192.168.0.1' (current IP from realraum beamer is default)
- BEAMER_PORT: '41794' (default)
- DEBUG: 'true' or 'false'

## Development
1. Clone the repository
2. Install dependencies with `yarn install`
3. Run the server with `yarn dev` (uses nodemon)
4. Open http://localhost:3000 in your browser

## Dev Notes
- Sent command menuToggle `<Buffer 05 00 06 00 00 03 00 1d 14> to 192.168.33.41:41794` (05 00 06 00 00 03 00 1d 14)

Wireshark:
- HDMI 1: `05 00 06 00 00 03 00 cd 13`
- PC: `05 00 06 00 00 03 00 d0 13`
- Component 1: `05 00 06 00 00 03 00 d1 13`
- Component 2: `05 00 06 00 00 03 00 d2 13`
- S-Video 1: `05 00 06 00 00 03 00 cf 13`
- Video 1: `05 00 06 00 00 03 00 ce 13`

- Volume Up: `05 00 06 00 00 03 00 fa 13`
- Volume Down: `05 00 06 00 00 03 00 fb 13`
- Volume Mute: `05 00 06 00 00 03 00 fc 13`
- Volume Unmute: `05 00 06 00 00 03 00 fd 13`

Use `tcp.payload contains "05000600000300" && ip.dst == 192.168.33.41` to filter for commands.
