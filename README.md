# Curl Man Page Feature Request

This repo is to serve as an illustration for
a feature request in curl-www repo. It is a working
mockup of a feature request for curl's manpage.html. 
The requested feature is a dropdown searchable menu 
for all the options on curl's manpage as of: <br/>

**UNIX** - curl 8.3.0-DEV (x86_64-pc-linux-gnu) libcurl/8.3.0-DEV. <br/>
**MacOS** - curl 8.2.1 (x86_64-aple-darwin) libcurl/8.2.1 SecureTransport zlub/1.2.11 <br/>

`Ctrl + click` link below to open preview page:

[curl-www manpage feature request](https://jhauga.github.io/htmlpreview.github.com/?https://github.com/jhauga/curl-manpage/blob/js-option-menu-test/index.html) <br/>
<!-- [console test curl-www manpage feature request](https://jhauga.github.io/htmlpreview.github.com/?https://github.com/jhauga/curl-manpage/blob/js-option-menu-test/index.html) -->

The contents of the directory "curl-www-root" are the
files in the pull request as they are located in the 
repo. Any appended text gives additional description.
Below is the structure: </br>
1. curl-www-root:
   - _manpage-option-menu.html
     - created with generatemanmenu.pl
     - uses option names from options.txt
   - bootstrap.sh 
     - calls generatemanmenu.pl
   - generatemanmenu.pl
     - builds _manpage-option-menu.html
   - manpage-option-menu.css
   - manpage-option-menu.t
   - options.txt
     - created in generatemanmenu.pl
     - made from ``curl -h all``
     - perl regular expression then extracts option names
   - search-manpage.js
   - search-manpage.t    
2. curl-www-root/docs:
   - _manpage.html 
     - edited to include _manpage-option-menu.html
     - opening and closing div tag added to hold manpage contents
  

# Testing Local Website Builds
Included is the file that built and served local test ``build-test.sh``. 
The test was configured by changing one variable in search-manpage.js after 
the local site was built. After configged for test the browsers were 
opened, inspected, and exported (*.log files from console*) manually. <br/>
Two items were tested: <br/>
- I. LOCAL BUILD
- II. LOCAL SITE TEST

resulting in PASS or FAIL (*all PASS*).

## Details of Test Procefure
Each local build was tested after the build as followed:
1. `` php -S localhost:8000`` for serve locally.
2. Setting `` var testOptionAnchors = 1;`` in search-manpage.js
   - using `` sed -i "s/var testOptionAnchors = 0/var testOptionAnchors = 1/" search-manpage.js `` on all but MacOS
   - MacOS `` sed -i '' "s/var testOptionAnchors = 0/var testOptionAnchors = 1/" search-manpage.js ``
3. Manual Steps:
   - Open browser, inpsected, and saved browser console output to corresponding test file:
   - See process in test/README.md for additional details.
     - test - *directory*
       - platform name - *directory*
         - browser-name-test-results.log

Below are the results. The last nested item marks PASS or FAIL 
for each list item,
### I. LOCAL BUILD - Local Build and Tests.
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

### II. LOCAL SITE TEST - Browsers Used for Testing Web Build:
1. Windows 10:
   - Google Chrome: 116.0.5845.111 (Official Build) (64-bit)
     - PASS
   - Microsoft Edge: 116.0.1938.62 (Official build) (64-bit)
     - PASS
   - Firefox: 116.0.3 (64-bit)
     - PASS
   - Vivaldi: 6.1.3035.302 (Stable channel) (64-bit) 
     - PASS
   - Brave: 1.57.53 Chromium: 116.0.5845.114 (Official Build) (64-bit)
     - PASS
   - Maxthon: 7.1.6.1000 (64-bit)
     - PASS
   - Yandex: 23.7.3.823 (64-bit)
     - PASS
   - Comodo Dragon: 114.0.5735.99 (64-bit)
     - PASS
2. Windows 11:
   - Google Chrome: 116.0.5845.111 (Official Build) (64-bit)
     - PASS
   - Microsoft Edge: 116.0.1938.54 (Official build) (64-bit)
     - PASS
   - Firefox: 116.0.3 (64-bit)
     - PASS
3. Ubuntu Desktop:
   - Firefox: 116.0.3 (64-bit)
     - PASS
   - Google Chrome: 116.0.5845.110 (Official Build) (64-bit)
     - PASS
   - Web: 42.4
     - PASS
4. Mac OS BigSur version 11.6
   - Safari: 15.0 (16612.1.29.41.4, 16612)
     - PASS
   - Google Chrome: 116.0.5845.110 (Official Build) (x86_64)
     - PASS
   - Firefox: 116.0.3 (64-bit)
     - PASS
5. Raspberry Pi OS
   - Chromium: 113.0.5672.95 (Official Build) Built on Raspbian , running on Raspbian 11 (32-bit)
     - PASS
