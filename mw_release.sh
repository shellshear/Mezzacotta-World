#!/bin/sh
cp ./access.php ./release/
cp ./index.php ./release/
cp ./update.php ./release/
cp ./images/gameGraphics.svg ./release/images/
cp ./images/persMapView.svg ./release/images/
cd js/
. ./mw_concat.sh
cd ..
cp ./js/mw_small.js ./release/js/
