# PHRustV2

A Discord-style chat client. This version is a **frontend-only prototype**: all data lives in your browser (`localStorage`).

## Run
```
cd PHRustV2
npx serve .        # or: python3 -m http.server 8000
```
ES modules need a web server; opening index.html directly will not work.

## Structure
```
index.html
css/style.css
src/
  main.js            app shell, action handlers, render loop
  core/
    store.js         state, persistence, servers/messages/friends
    permissions.js   role + permission checks
    voice.js         voice channel + mic mute/deafen
    util.js          ids, escaping, markdown, GIF/image embeds
  ui/
    rail.js sidebar.js chat.js members.js friends.js modal.js
```

## Built
Servers, text/voice channels, roles with permissions, messaging (edit/delete, markdown), reactions, GIF/image links and uploads, friends, DMs, profile (name, bio, avatar), mic join/mute/deafen.

## Not possible without a backend
Real multiple users, real-time sync, friend requests the other person accepts, and voice between people (needs WebRTC + signaling server). Other users are simulated. A Rust backend (axum + WebSockets + Postgres) would slot in behind `core/store.js`.
