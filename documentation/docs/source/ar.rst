Visgraph AR
###########

Visgraph AR is a tool for visualizing and analyzing networks in 3D using the
Hololens 2 headset developed by Microsoft. It is a research project developed
for a Bachelor's thesis and afterwards further expanded and improved under supervision
of dr. Rob Belleman at the UvA Visualisation Lab.

Setup
*****
The application needs access to the camera (for QR recognition) and networking capabilities.
Developers can load the application onto the Hololens 2 using Visual Studio. It is
designed to run independently from a PC and connects to an active Visgraph
session by scanning a QR code. The user generates the QR code by navigating to the
**Session Tab** in the Visgraph application and clicking the **Add Headset** button, and
afterwards, **Connect** to show the QR code.

QR Code Recognition
*******************

The QR code is recognized by the Hololens 2 using the MRTK QR code scanner.
Effectiveness is a function of QR code size and distance from the headset. When
the headset recognizes a QR code, it projects a purple square onto it. When the user
pinches the thumb and index finger together while pointing at it. When the application loads
the session and the nodes move, the headset superimposes them onto the screen in 3D.

Interface
*********
If the user holds up their left or right hand, a menu appears with the options
to map attributes to nodes; map attributes to edges; view session information or
disconnect from that session. When pressed, the menu buttons act like physical buttons and bring up a view window attached to the user's hand.
