// Global variables
var csvRows = [];
var firstRow = true;
var globalQuery = {};
var queueIndex = 0;
var queueLength = null;
var loader = null;

// Clear the form fields
function clearForm() {
  document.qname.reset();

  for(var el in document.qform.elements){
    document.qform[el].value = "";
    }
}

// Execute this function when the 'Make API Call' button is clicked
function makeApiCall() {

  //reset all globals for when we run function again
  csvRows = [];
  firstRow = true;
  globalQuery = {};
  queueIndex = 0;
  queueLength = null;
  loader = null;

  // hide download link and show loading animation
  document.getElementById('csv-link').style.display = 'none';
  document.getElementById('loading').innerHTML = 'Loading';

  // show loading text
  document.getElementById('loading').style.display = 'inline';
  loader = setInterval(loadingDots, 500);

  // save form data into global query object
  globalQuery = queryParams();
  
  //get list of profiles
  console.log('Starting Request Process...');
  getProfilesList();
  
}

function getProfilesList() {
	console.log('Querying Views (Profiles).');

  	// Get a list of all Views (Profiles) for the first Web Property of the first Account
  	gapi.client.analytics.management.profiles.list({
      'accountId': '~all',
      'webPropertyId': '~all'
  	}).execute(handleProfiles);
}

function handleProfiles(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
    	queueLength = 0;

      // Use this in for loop to point to profile names
      // regex is used to filter out profiles
      var itemName = "";
      var regex = new RegExp(
        (document.rform['regex'].value == "") ? ".*" : document.rform['regex'].value);

      	// Query the Core Reporting API
      	for(var i=0; i<results.items.length; i++) {
          itemName = results.items[i].name;

          if(itemName.match(regex) == itemName){
            queueLength ++;
            setTimeout(queryCoreReportingApi, 100*i, results.items[i].id);
          }
          
      	}

    } else {
      console.log('No views (profiles) found for this user.');
    }
  } else {
    console.log('There was an error querying views (profiles): ' + results.message);
  }
}

function queryCoreReportingApi(profileId) {
  console.log('Querying Core Reporting API for profile ID: ' + profileId);

  var queryObject = globalQuery;
  queryObject.ids = 'ga:' + profileId;
  // Use the Analytics Service Object to query the Core Reporting API
  gapi.client.analytics.data.ga.get(queryObject).execute(handleCoreReportingResults);
}

function handleCoreReportingResults(results) {
  if (results.error) {
    console.log('There was an error querying core reporting API: ' + results.message);

  } else {
    printResults(results);
  }
}

function printResults(results) {
  
  console.log( 
  	results.rows && results.rows.length ? 'Completed profile ' : 'No results found for ',
    results.profileInfo.profileName,
  	' at ', Date()
  	);

  // Store rows
  storeRows(results);
}

function storeRows(results) {
  // Store first row if not already set
  if(firstRow) {
    var headers = [];

    for(var col in results.columnHeaders) { headers.push(results.columnHeaders[col].name); }

    headers = ['Profile ID','Account ID','Profile Name'].concat(headers);

    csvRows.push(headers.join(','));

    firstRow = false;
  }

  // Set metaData as array of Profile ID, Account ID and Profile Name
  var metaData = [results.profileInfo.profileId, results.profileInfo.accountId, results.profileInfo.profileName];
  var rowArray = [];

  if(results.rows && results.rows.length){
    for(var rowNum in results.rows) {
      rowArray = metaData.concat(results.rows[rowNum]);
      csvRows.push(rowArray.join(','));
    }
  } else {
    for(var c = 0; c<results.columnHeaders.length; c++) { rowArray.push(0);}
    rowArray = metaData.concat(rowArray);
    csvRows.push(rowArray.join(','));
  }

  queueIndex++;
  if(queueIndex == queueLength) {downloadCSV();}
}

function downloadCSV() {
    //join the CSV rows separated by a newline character
    var csvString = csvRows.join("\n");

    // create a blob for the CSV file and set the link href to point to that blob
    var blob = new Blob([csvString], {type: "text/css;charset=utf-8"});
    var a = document.getElementById('csv-link');
    a.href = window.URL.createObjectURL(blob);

    // Set the filename
    a.download = "GA_" + document.qname["query-name"].value + "_at_" + Date() + ".csv";

    // Hide the 'loading...' animation and show the download link
    document.getElementById('loading').style.display = 'none';
    document.getElementById('loading').innerHTML = '';
    clearInterval(loader);
    a.style.display = 'inline';
}

// unused (for console debugging)
function logResults(results) {
	console.log("//////////////////////// RESULTS /////////////////////////////");

    var logRow = "Profile ID, Account ID, Profile Name, ";

    for(var col in results.columnHeaders) { logRow += results.columnHeaders[col].name + ", "; }
    console.log(logRow);
    
    logRow = "";

    for(var row in results.rows) {
      
      logRow = results.profileInfo.profileId + ', ' + results.profileInfo.accountId + ', ' + results.profileInfo.profileName + ', ';

      for(var val in results.rows[row]) {
        logRow += results.rows[row][val] + ', ';
      }

      console.log(logRow);
    }
}

// Function to read the input form elements into a query object
function queryParams() {

  // Read all elements in the form into an array
  var qform = document.qform.elements;

  // Create the query object
  var qry = {};

  // loop the form elements and add to query object
  for(var el in qform){
        if(qform[el].name && qform[el].value) { qry[qform[el].name] = qform[el].value; }
    }

  return qry;
}

// Function to animate the loading dots
function loadingDots() {
  var dots = document.getElementById('loading');
  if(dots.innerHTML === '') {return true;}
  dots.innerHTML += ".";
  if(dots.innerHTML === "Loading....") {dots.innerHTML = "Loading";}
}