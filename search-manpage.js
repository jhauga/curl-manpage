/***********************************************************************************
*  COPYRIGHT AND PERMISSION NOTICE
*
*  Copyright (C) Daniel Stenberg, <daniel@haxx.se>, and many
*  contributors, see the THANKS file.
*
*  All rights reserved.
*
*  Permission to use, copy, modify, and distribute this software for any purpose
*  with or without fee is hereby granted, provided that the above copyright
*  notice and this permission notice appear in all copies.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF THIRD PARTY RIGHTS. IN
*  NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
*  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
*  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
*  OR OTHER DEALINGS IN THE SOFTWARE.
*
*  Except as contained in this notice, the name of a copyright holder shall not
*  be used in advertising or otherwise to promote the sale, use or other dealings
*  in this Software without prior written authorization of the copyright holder.
**********************************************************************************/

// on/off switch for top button, menu, mouseover, and button status respectively
var setScroll = 0; var scrollOver100 = 0; var mousedOver = 0; var onOffButton = 0;

// Option menu DOM elements
var toTop = document.getElementById("toTop"); // to top button
var searchButton = document.getElementById("searchButton"); // show option dropdown
var searchButtonData = searchButton.dataset; // switch for button on mouseover
var manpageOptionMenu = document.getElementById("manpage-option-menu"); // top of DOM
var manpageOptionMenuData = manpageOptionMenu.dataset; // switch to put menu to side

// Show to top button.
function showTop() {  
    let curScroll, nextScroll;
    document.addEventListener("scroll", function() {
      // switch for scrolled down over 100
      if (document.documentElement.scrollTop > 100) { scrollOver100 = 1; }
      else { scrollOver100 = 0; } 
      
      // Toggle button to side and stay
      if ( // scrolled past 100px, menu is not on side, and not moused over
        scrollOver100 == 1 &&
        manpageOptionMenuData.onSide == 0 &&
        mousedOver == 0 && 
        onOffButton == 0
       ) {       
       manpageOptionMenu.dataset.onSide = 1;
       if ( searchButton.className.indexOf("searchButtonToSide") > -1 &&
            manpageOptionMenuData.toSide == 1 ) {
          // put menu to side and done          
          searchButton.dataset.toSide = 1;
       }
      }
      else if (document.documentElement.scrollTop > 500) {       
        // show to top button on right
        toTop.style.display = "inline-block";       
      } else {
       // hide to top button
       toTop.style.display = "none"; // hide to top       
       searchButton.dataset.toSide = 0; // button default
       
       // set menu to defaults
       if (document.documentElement.scrollTop < 100) {
         manpageOptionMenu.style.left = ""; // now use css styles
         manpageOptionMenu.dataset.onSide = 0;
       }
      }
    });  
}

// Put to top and show option buttons to side when menu not in view
// adding mouseover function to activate.
function buttonToSide(status, onoff) {
  // if on exit    
  if (
   ( onoff == 1 || onOffButton == 1 ) &&
     onoff != "on"
    ) { mousedOver = 1; return; }
  // touch event occured
  if (onoff == "off") { searchButton.dataset.touchStatus = "on"; }
  else { searchButton.dataset.touchStatus = "off"; }
  // is moused over or not. exit on mouse out  
  if ( status == 1 ) { 
    mousedOver = 1;
  } else { 
    mousedOver = 0;
    // better ux with timeout
    setTimeout(function() { return; }, 500);     
  }

  if ( // scroll switch is set and menu is on side
    scrollOver100 == 1 && 
    manpageOptionMenuData.onSide == 1
   ) {     
     manpageOptionMenu.dataset.onSide = 0; // position with css
   } 
   else if ( // scroll sitch is set and menu not on side
     scrollOver100 == 1 &&
     manpageOptionMenu.dataset.onSide == 0 // left 0px with css
      ) {
     manpageOptionMenu.dataset.onSide = 1; // left -80px with css
   }
}

// Search for options in dropdown.
function searchOptions(txt) {
  let optionMenu = document.getElementById("optionMenu");
  let optionMenuLi = optionMenu.getElementsByTagName("li");
  for (i = 0; i < optionMenuLi.length; i++) {
    let curLI = optionMenuLi[i].innerText;
    if (curLI.indexOf(txt) > -1) {
      optionMenuLi[i].style.display = "";
    } else {
      optionMenuLi[i].style.display = "none";
    }
  }
}

// Show and hide table of contents
function toggleSearchButton(showhide, onoff) {
  // responsive elements
  let manpageDiv = document.getElementsByClassName("manpage")[0];
  let manpageMenu = document.getElementsByClassName("menu")[0];  
  
  // toggle display elements
  let showItem = showhide.nextElementSibling; // --------------------\ select option menu
  let curData = onoff.dataset; //                                    |
  if (curData.onoff == 0) { //                                      \|/
    // 1.set switch, show menu, change style, change text         1  .
    manpageOptionMenu.dataset.toSide = 0; 
    curData.onoff = 1;
    showItem.style.display = "";
    onoff.style.background = "white";
    onoff.style.color = "black"; //                                  |
    onoff.innerHTML = onoff.innerHTML.replace("Show", "Hide"); //   \|/                                                                 
    // 2. set to side when menu out of view and style parrent     2  .
    onoff.className = ""; 
    onoff.parentElement.className = onoff //                         |
    .parentElement.className.replace(" inactive", ""); //           \|/
    // 3. responsive margins if screen < 770 add else remove       3 .
    if (!manpageDiv.id) { manpageDiv.id = "activeManDiv"; } 
    if (!manpageMenu.id) { manpageMenu.id = "activeManMenu"; }     
    // Turn button on
    onOffButton = 1;
  } else {
    // "..."                                                       1 .
    manpageOptionMenu.dataset.toSide = 1; //                        /|\
    curData.onoff = 0; //                                            |
    showItem.style.display = "none";
    onoff.style.background = "";    
    onoff.style.color = "";
    onoff.innerHTML = onoff.innerHTML.replace("Hide", "Show"); 
    // "..."                                                       2 .
    onoff.className = "searchButtonToSide"; //                      /|\
    onoff.parentElement.className += " inactive"; //                 |
    // "..."                                                       3 .
    if (manpageDiv.id) { manpageDiv.removeAttribute("id");} //      /|\
    if (manpageMenu.id) { manpageMenu.removeAttribute("id");} //     |    
    //                                                               |
    // put back to side if scrolled past 100. -----------------------/
    // Turn button off
    onOffButton = 0;
  }
}

// Add anchor when clicked.
function addOptionLinks() {
  let optionMenu = document.getElementById("optionMenu");
  let optionMenuLi = optionMenu.getElementsByTagName("li");
  let fullOptionList = document.getElementById("fullOptionList");
  
  var lastDec, hValue;
  var outPeriod = function() { // remove any periods    
    if (hValue.match(/\w\d[.]/g)) {
      lastDec = hValue.lastIndexOf(".");
      hValue = hValue.substr(0, lastDec) + hValue.substr(Number(lastDec + 1));
     }
  };
  
  fullOptionList.style.display = "";
  optionMenuLi = fullOptionList.getElementsByTagName("li");
  
  for (i = 0; i < optionMenuLi.length; i++) {
    optionMenuLi[i].getElementsByTagName("a")[0].addEventListener("click", function() {
      if (this.innerHTML.indexOf(",") > -1) {        
        this.href = "#" + this.innerHTML.substr(0, this.innerHTML.indexOf(","));
        hValue = this.href;        
      } else {
        this.href = "#" + this.innerHTML;
        hValue = this.href;              
      }
      outPeriod();
      
      if (hValue.indexOf("#-#") > -1 || hValue.indexOf("#-:") > -1) {
        if (hValue.indexOf("#-#") > -1) {
          hValue = hValue.replace("#-#", "#-hash");
        }
        else {
          let skip;
        }
        this.href = hValue;
      } else {
        this.href = hValue;
      }
    });
  }
}
showTop();
addOptionLinks();


/***********************************************************************************
******************* Check console output to see results of test ********************
After build open manpage.html and change the variable "testOptionAnchors" to 1 
to turn on tests. In order to test the browser must support console.log. 
   Test Instructions: 
     1. Change variable "testOptionAnchors" to 1. 
     2. Reload manpage.html 
     3. Open browser console tool. 
     4. The results will be as such: 
       A. Anchor Count = number of options in menu 
       B. Option Anchors = array with name of options in menu 
     5. Delete or set variable "testOptionAnchors" back to 0 to turn off test.
***********************************************************************************/
var testOptionAnchors = 0;

function testTheOptionAnchors() {
  var logSplit = function(x) {
    if (x == undefined) { x = 0; }
    if (x == 2) {             
      console.log("***********************************************************************"); 
      console.log("****************************STARTING TEST******************************"); 
      console.log("\n"); 
    } else { 
      console.log("\n"); 
      console.log("****************************FINISHED TEST******************************");       
      console.log("***********************************************************************");       
    }
  };
  
  var theUnorderdOptionList = document.getElementById("optionMenu");
  var theOptionListItems = theUnorderdOptionList.getElementsByTagName("li");  
  var optionAnchors = [];
  // Get option names
  for (i = 0; i < theOptionListItems.length; i++) {
    let curItem = theOptionListItems[i].getElementsByTagName("a")[0];
    optionAnchors.push(curItem.innerHTML);
  }
  // output anchors
  logSplit(2); 
  console.log("A. Anchor Count - " + theOptionListItems.length);  
  console.log("B. Option Anchors:");
  console.log(optionAnchors);  
  logSplit();    
}

if (testOptionAnchors == 1) { testTheOptionAnchors(); }