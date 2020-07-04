const THEGRAPH_URL = "https://api.thegraph.com/subgraphs/name/vporton/cryptozonrinkeby3";

function queryThegraph(query, callback) {
    query = query.replace(/\\/g, '\\').replace(/"/g, '\\"').replace(/\n/g, "\\n");
    $.post(THEGRAPH_URL, `{ "query": "${query}" }`, function(data) {
        callback(data);
    });
}

const web3 = new Web3(window.web3.currentProvider);

let defaultAccount;
// web3.eth.defaultAccount = web3.eth.accounts[0];
function defaultAccountPromise() { return web3.eth.getAccounts(); }
defaultAccountPromise().then( function (result) { return defaultAccount = result[0] });

function categoriesJsonInterface() {
    return new Promise((resolve) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200)
                resolve(JSON.parse(xhttp.responseText));
        };
        xhttp.open("GET", "artifacts/Categories.abi", true);
        xhttp.send();
    });
}