# motion-cue (MQ:Billiard)
Billiard simulation with motion control.

This is a proof of concept project to test using phone's gyroscope and accelerometer to control an object (cue) on a PC.

## Games
- Snooker
- Pool
- 6-red snooker

## Instructions
Open a game by creating a new one, or joining by a 4-digit code (can be seen in a bottom right corner of the screen).

Connect a cue: scan a QR code shown after connecting to a game and navigate to a web page from your mobile device.

![Pool: connect a cue](https://user-images.githubusercontent.com/8505995/82755953-ab929680-9ddf-11ea-933f-8e626f424b4b.png)

To understand controls you need to imagine, that the screen is horisontal (or place it so, if possible).
Align the cue on the PC screen with the one on your phone and press on the bottom area of the phone containing the cue.
Now, rotating the phone in horizontal plane will also rotate the cue on the main screen keeping them aligned.

To adjust the cue ball spin, press on the top part of phone's screen containing the cue ball. Spin control will come in focus.
You can control the contact point with the cue by tilting the phone. The point will stay aligned with the top part of your phone.
(it is easier to imagine shining the laser pointer on the screen from the top of the phone).
The same type of controls can be used on the cue ball when ball-in-hand mode is active.

To make a shot just do the same motion, as you would if the phone was a real cue. The amount of force used counts.

## Multiplayer

Multiple players can join a game and play remotely. Players will be represented by their scores in the bottom of the screen.
Currently in-control player will be shown with white background. Your local score will have a yellow underline. When you are waiting on a remote player to make a shot, his score will be pulsing.

It is also possible to add multiple players locally using a plus button next to the scores. This will let you manage score and turns of other players, while still using the smae controll and screen for them.

![Snooker shot](https://user-images.githubusercontent.com/8505995/85229691-0970c900-b3f4-11ea-9269-27f4d8377dbc.png)

## Shortcuts
- Press the `t` key to start tracing the path of all balls.
- Press the `a` key to show cue aiming direction. (this is not a predicted path of the ball)
- Press the `p` key to show predicted paths of the balls (1 second in the future after medium strength shot)
- Press the `h` key to take the cue ball in hand. (not always legal, but currently allowed)
- Press numeric keys `0` - `9` to adjust the size of the pockets.
    - `0` - pocket is the size of the ball (*+ epsylon*)
    - `5` - initial pocket size (according to game regulations)
    - `9` - pocket is twice the initial size
    - *`N`* - piecewise linear interpolation between three cases above
- Press and hold the `space` bar to make a shot without a phone controller (on some iOS devices motion control may not work for shots).

## Technical details

Because it is not a production project, it uses ES modules directly and relies on support from the browser of some new language features.
Most modern browsers support it. No babel or webpack is used, although adding it should not be a problem.

The project uses Socket.IO to establish live communication between phone controller and PC game.

Mobile environment relies on `deviceorientation` and `devicemotion` events for positioning. Therefore, the device must have gyroscope and accelerometer and a browser capable of accesing them.

Physics logic is very approximate and needs adjustments.

## Demo
You can try it out at: [https://motion-cue.herokuapp.com/](https://motion-cue.herokuapp.com/)
