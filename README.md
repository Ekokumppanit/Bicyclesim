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

Most basic speed sensor would be "Keyboard" that sends a keypress whenever the wheel has turned one revolution.
~~This kind of sensor can be built from a old keyboard by soldering a reed switch to right conductors at keyboard circuit board. Some instructions here: http://www.instructables.com/id/Hacking-a-USB-Keyboard/.~~
Doesn't work. The reed switch wont be closed long enough for the keyboard controller or computer to register wheel revolutions.

It should be possible to build working device from Arduino Uno (http://mitchtech.net/arduino-usb-hid-keyboard/) or Arduino Due (http://www.i-programmer.info/news/91-hardware/4965-new-powerful-arduino-due-.html).
Device should read the reed switch status every 1ms and send keypress maybe every 500ms (send 'a' if there was one wheel revolution since last keypress, send 'b' if two etc).
