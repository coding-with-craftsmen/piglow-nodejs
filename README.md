PiGlow for node.js
------------------

This node.js script is a sample application for accessing a PiGlow board.

Requirements
------------

- A RaspberryPi
- PiGlow board
- Node.js installed (latest version, older version for instance packaged with raspbian are to old)

Before running the script
-------------------------

You've to allow access to the PiGlow device, this can be done in the following manner:

```
sudo chmod o+rw /dev/i2c*
```

Install the i2c node.js library globally

```
npm install -g i2c
```

Running the application
-----------------------

The sample application can be run by the following command.

```
node piglow.js
```