// Everything below is to show the javascript used to get test logs.

/***********************************************************************************
******************* Check console output to see results of test ********************
After build open manpage.html and change the variable "testOptionAnchors" to 1 
to turn on tests. In order to test the browser must support console.log. 
   Test Instructions: 
     1. Change variable "testOptionAnchors" to 1. 
     2. Reload manpage.html 
     3. Open browser console tool. 
     4. The results will be as such: 
       A. Option Count = number of options in menu 
       B. Option innerHTML = array with name of option innerHTML
       C. Full Option href Value = the href attribute assigned after click event.
       D. Test Result - Pass or fail
          - Pass - all options have href that matche innerHTML that made anchor.
          - Note - if putting an item such as <li><a href="abc">xyz</a></li>
                   outside of ul tag, test will fail.
       E. Compare Values - the innerHTML vs extracted anchor link
     5. Delete or set variable "testOptionAnchors" back to 0 to turn off test.
***********************************************************************************/
var testOptionAnchors = 1; // test is off by default
// Globals for test.
var optionListItemInnerHTML, anchorHref, compareValues;
function testTheOptionAnchors() {
  var logSplit = function(x) {
    if (x == undefined) { x = 0; }
    if (x == 1) {             
      console.log("***********************************************************************"); 
      console.log("****************************STARTING TEST******************************"); 
      console.log("\n"); 
    } 
    else if (x == 2) { 
      console.log("\n"); 
      console.log("****************************FINISHED TEST******************************");       
      console.log("***********************************************************************");
    } else {
      console.log("***********************************************************************");
    }    
  };

  var theUnorderdOptionList = document.getElementById("optionMenu");
  var theOptionListItems = theUnorderdOptionList.getElementsByTagName("li");  
  optionListItemInnerHTML = [];
  // Get option names
  for (let i = 0; i < theOptionListItems.length; i++) {
    let curItem = theOptionListItems[i].getElementsByTagName("a")[0];
    optionListItemInnerHTML.push(curItem.innerHTML);    
  }
  // Get option href value.
  var curIndex; anchorHref = [];
  // click then get href
  var clickThenHref = function(cond) {
    curIndex = 0;
    while (curIndex < theOptionListItems.length) {
      let curItem = theOptionListItems[curIndex].getElementsByTagName("a")[0];    
      clickOption(curItem, cond);
      curIndex++;
    } 
  };
  // click or href.
  var clickOption = function(cur, cond) {
    if (cond == 1) {      
      cur.click();      
    } else {
      anchorHref.push(cur.href);    
    }    
  };
  // Click to add href value.
  clickThenHref(1);
  // Add href value to array anchorHref.
  clickThenHref(2);

  // Compare innerHTML to href.
  var testResult = 0; compareValues = [];  
  if (optionListItemInnerHTML.length == anchorHref.length) {
    let commaRegEx = /^(.*?)(?:,|$)/; // text before comma    
    for (let i = 0; i < optionListItemInnerHTML.length; i++) {      
      let compareLines = optionListItemInnerHTML[i].match(commaRegEx)[1].trim().replace(/\./g, "");      
      let curAnchorValue = anchorHref[i].substr(anchorHref[i].indexOf("#")+1);      
      
      if (compareLines == curAnchorValue) {
        compareValues.push(compareLines + " <-> " + curAnchorValue);
        if (i == optionListItemInnerHTML.length-1) {
          testResult = "PASS";
        }
      } else {
        alert("ERROR - tThe href attribute did not match option in innerHTML.");
        testResult = "FAIL";
        break;
      }      
    }
  } else {
    alert("ERROR - the option did not generate an anchor.");
    testResult = "FAIL";
  }
  
  // Start test console composition.
  logSplit(1); 
  // Output option list item length and innerHTML
  console.log("A. Option Count - " + theOptionListItems.length);  
  console.log("B. Option innerHTML:");
  console.log(optionListItemInnerHTML);  
  // Output option href attribute
  logSplit();
  console.log("C. Full Option href Value:");
  console.log(anchorHref);
  // Make sure both lengths match and anchor uses correct option.
  logSplit();
  console.log("D. Test Result - ");
  console.log(testResult);
  console.log("E. Compare Values - innerHTML <-> Anchor Link:");
  console.log(compareValues);
  // Close test console composition.
  logSplit(2);    
}

if (testOptionAnchors == 1) { testTheOptionAnchors(); }
