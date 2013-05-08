# Bicyclesim

This is a prototype web app developed to be demonstrated at Energia 2012 expo
(http://www.expomark.fi/fi/messut/energia2012).

This application is built using Meteor JavaScript platform (http://meteor.com/).

## Usage

You can try the app at http://bicyclesim.ekokumppanit.fi/. Instructions there are
currently on finnish so here's a short version:

Select a route from "Simulaatio"-tab and start hitting the space key.
For the best experience connect a bicycle with a trainer to computer using
a speed sensor.

## Speed sensor

Check arduino/arduino.ino for sample implementation for Arduino Leonardo.

It works as a keyboard and sends the number of wheel revolutions once per second.
