#!/bin/bash

sed -i -E 's/([0-9]+: )\"/\n\1 \"/g' test-results.log
sed -i -E 's/\"(length.*)/\"\n\1/' test-results.log

if [ "$1" = "win10" ]; then
	cp test-results.log "Windows-10/$2-test-results.log"
elif [ "$1" = "win11" ]; then 
	cp test-results.log "Windows-11/$2-test-results.log"
elif [ "$1" = "mac" ]; then 
	cp test-results.log "MacOS-BigSur/$2-test-results.log"
elif [ "$1" = "rasp" ]; then 
	cp test-results.log "Raspberry-Pi-OS/$2-test-results.log"
elif [ "$1" = "ubu" ]; then 
	cp test-results.log "Ubuntu-Desktop/$2-test-results.log"
else
	cp test-results.log "$1-test-results.log"
fi
