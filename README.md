# Curl Man Page Feature Request

This repo is to serve as an illustration for
a feature request in curl-www repo. It is a working
mockup of a feature request for curl's manpage.html. 
The requested feature is a dropdown searchable menu 
for all the options on curl's manpage as of: <br/>

**UNIX** - curl 8.3.0-DEV (x86_64-pc-linux-gnu) libcurl/8.3.0-DEV. <br/>
**MacOS** - curl 8.2.1 (x86_64-aple-darwin) libcurl/8.2.1 SecureTransport zlub/1.2.11 <br/>

`Ctrl + click` links below to open example page:

<!-- [curl-www manpage feature request](https://jhauga.github.io/curl-manpage/) <br/> -->
[curl-www manpage feature request](https://jhauga.github.io/htmlpreview.github.com/?https://github.com/jhauga/curl-manpage/blob/main/index.html) <br/> 


![option menu demo video](example-video.gif)

The contents of the directory "curl-www-docs" are the
files in the pull request as they are located in the 
repo. Any appended text gives additional description.
Below is the structure: </br>

**curl-www-docs/**:
1. _manpage.html 
   - edited to include _option-menu.html and manoptionsdump.gen    
2. _option-menu.html
   - template for option menu
3. generatemanmenu.pl
   - builds manoptionsdump.gen
4. Makefile
   - edited adding target manoptionsdump.gen that is called in manpage.html
   - manoptionsdump.gen creates file "manoptionsdump.gen" that holds options.
5. manoptionsdump.gen
   - created using perl script generatemanmenu.pl         

# Testing Local Website Builds
Included is the file that built and served local test ``build-test.sh``. 
More or less these were the steps for each OS to build local site.
After configged for test the browsers were opened, and menu 
was tested manually. <br/>
Two items were tested: <br/>
- I. LOCAL BUILD
- II . WORKING MENU

## Details of Test Procefure
Each local build was tested after the build as followed:
1. `` php -S localhost:8000`` for serving locally.
2. Manual Steps:
   - Open browser, scrolled, hovered, check "Keep Expanded", resize to minimum, uncheck, and mouseout.

Below are the test results. 

### I. LOCAL BUILD - Local Site Build
The website was built locally using:
1. Ubuntu on Windows 10
   - PASS
2. Ubuntu on Windows 11
   - PASS
3. Ubuntu Desktop
   - PASS
4. Mac OS BigSur version 11.6
   - PASS
5. Raspberry Pi OS
   - PASS

### II. WORKING MENU - Browsers Used for Testing Web Build:
1. Windows 10:
   - Google Chrome: 116.0.5845.141 (Official Build) (64-bit)
     - PASS
   - Microsoft Edge: 116.0.1938.69 (Official build) (64-bit)
     - PASS
   - Firefox: 116.0.3 (64-bit)
     - PASS
   - Vivaldi: 6.1.3035.302 (Stable channel) (64-bit) 
     - PASS
   - Brave: 1.57.57 Chromium: 116.0.5845.163 (Official Build) (64-bit)
     - PASS
   - Yandex: 23.7.4.971 (64-bit)
     - PASS
   - Comodo Dragon: 114.0.5735.99 (64-bit)
     - PASS
2. Windows 11:
   - Google Chrome: 116.0.5845.112 (Official Build) (64-bit)
     - PASS
   - Microsoft Edge: 116.0.1938.69 (Official build) (64-bit)
     - PASS
   - Firefox: 117.0 (64-bit)
     - PASS
3. Ubuntu Desktop:
   - Firefox: 117.0 (64-bit)
     - PASS
   - Google Chrome: 116.0.5845.140 (Official Build) (64-bit)
     - PASS
   - Web: 42.4
     - PASS
4. Mac OS BigSur version 11.6
   - Safari: 15.0 (16612.1.29.41.4, 16612)
     - PASS
   - Google Chrome: 116.0.5845.140 (Official Build) (x86_64)
     - PASS
   - Firefox: 117.0.0 (64-bit)
     - PASS
5. Raspberry Pi OS
   - Chromium: 113.0.5672.95 (Official Build) Built on Raspbian , running on Raspbian 11 (32-bit)
     - PASS
