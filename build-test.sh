#! /bin/bash

echo Update curl-www repo? \[Y\\n\\Yb\]
echo
read _updateCurlWWW

function _clonePath() {
	if [ "$1" = "curl" ]; then
		cd /usr/local/lib/
		_clone https://github.com/curl/curl.git
        cd curl
        autoreconf -fi
		./configure --without-ssl
		make
	else
		echo The syntax is incorrect or the repo is not defined in function..
	fi
}

if [ "$_updateCurlWWW" = "Y" ] || [ "$_updateCurlWWW" = "Yb" ]; then
	if [ "$_updateCurlWWW" = "Yb" ]; then
		rm -rf curl-www && git clone -b final-pre-pull https://github.com/jhauga/curl-www.git
	else
		rm -rf curl-www && git clone https://github.com/jhauga/curl-www.git
	fi
fi

echo Update curl repo for curl-www build? \[Y\\n] && echo 
read _updateCurl

if [ "$_updateCurl" = "Y" ]; then 
	echo Updating and rebuilding curl.
	echo -----------------------------
	echo
	bash -i -c "_clonePath \"curl\""
fi

if [ -e "_built-curl-www" ]; then
	rm -rf _built-curl-www
fi
cp -r curl-www _built-curl-www

cd _built-curl-www
echo /usr/local/lib/curl/ | sh bootstrap.sh
make all

php -S localhost:8000
