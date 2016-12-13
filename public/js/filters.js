
var jurisdictionsList = ['AB','BC','MB','NB','NL','NT','NS','NU','ON','PE','QC','SK','YT','FED'];
var jurisdictions = [];

function filterTransactionsByCorporation() {
    console.log("Filter the results!!");
    // Declare variables
    var input, filter, table, tr, td, i;
    input = document.getElementById("corporateNameTransactionsFilter");
    filter = input.value.toUpperCase();
    table = document.getElementById("registryTransactionsTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function filterCorporationsByName() {
    console.log("Filter by corporationName");
    // Declare variables
    var input, filter, table, tr, td, i;
    input = document.getElementById("corporateNameFilter");
    filter = input.value.toUpperCase();
    table = document.getElementById("corporationsTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}


function buildJurisdictionFilter(jurisdiction) {
    if (document.getElementById(jurisdiction).checked) {
        //console.log(jurisdiction + " is checked");
        jurisdictions.push(jurisdiction);
    }
    else {
        //console.log(jurisdiction + " is unchecked");
        var index = jurisdictions.indexOf(jurisdiction);
        if (index > -1) {
            jurisdictions.splice(index, 1);
        }
    }
}

function filterTransactionsByJurisdiction() {
    console.log('Filter by jurisdiction!');
    var input, table, tr, td, i;

    table = document.getElementById("registryTransactionsTable");
    tr = table.getElementsByTagName("tr");

    jurisdictions = [];

    for (i = 0; i < jurisdictionsList.length; i++) {
        buildJurisdictionFilter(jurisdictionsList[i]);
    }

    console.log('Jurisdiction Count:' + jurisdictions.length);
    // if the array is empty show all
    if (jurisdictions.length === 0) {
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td) {
                tr[i].style.display = "none";
            }
        }
    }
    else {
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td) {
                // iterate over jurisdictions to display and check
                for (index = 0; index < jurisdictions.length; ++index) {

                    if (td.innerHTML.indexOf(jurisdictions[index]) > -1) {
                        tr[i].style.display = "";
                        break;  // once found break out of here
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }
    }
}

function selectAllJurisdictions() {
    if (document.getElementById('selectAllJurisdictions').checked) {
        for (i = 0; i < jurisdictionsList.length; i++) {
            document.getElementById(jurisdictionsList[i]).checked = true;
        }
        filterTransactionsByJurisdiction();
    }
    else {
        for (i = 0; i < jurisdictionsList.length; i++) {
            document.getElementById(jurisdictionsList[i]).checked = false;
        }
        filterTransactionsByJurisdiction();
    }
}