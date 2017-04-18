#!/bin/bash

DEVPATH="dev"
TESTPATH="test"

nodemon -w $DEVPATH -w $TESTPATH $TESTPATH/launchServer.js
