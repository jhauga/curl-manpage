#! /bin/bash

# These were (pretty much) the steps to test the local builds for each OS.

# Store current directory.
_currentDirectory=$(pwd)

# Update local repo with repo in feature request pull.
echo Update curl-www repo? \[Y \\ n\]
echo
read _updateCurlWWW

# If yes clone repo jhauga/curl-www.git.
if [ "$_updateCurlWWW" = "Y" ]; then
	if [ -z "$1" ]; then
		rm -rf curl-www && git clone https://github.com/jhauga/curl-www.git
	else
		rm -rf curl-www && git clone -b "$1" https://github.com/jhauga/curl-www.git
	fi
fi

# If curl repo from site or github needs to be updated.
echo Update curl repo for curl-www build? \[Y \\ n] && echo 
read _updateCurl

# Update by removing, cloning, then installing curl from github.
# Although these are the steps, this was done manully on some OS.
if [ "$_updateCurl" = "Y" ]; then 
	echo Updating and rebuilding curl.
	echo -----------------------------
	echo
	rm -rf /usr/local/lib/curl && git clone https://github.com/curl/curl.git /usr/local/lib/curl/
	cd /usr/local/lib/curl
	autoreconf -fi
	./configure --without-ssl
	make
	cd "$_currentDirectory"
fi

# Ask to rebuild and serve local version of site.
echo Build local version of site? \[Y \\ n\]
echo
read _buildLocalCurlWWW
if [ "$_buildLocalCurlWWW" = "Y" ]; then
	# remove build directory if exists.
	if [ -e "_built-curl-www" ]; then
		rm -rf _built-curl-www
	fi
 	# copy clone to new directory to build
	cp -r curl-www _built-curl-www

 	# build local site in build new build directory
	cd _built-curl-www
	echo /usr/local/lib/curl/ | sh bootstrap.sh
	make all

 	# serve site locally
	php -S localhost:8000
fi