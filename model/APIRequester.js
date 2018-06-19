const nutrition = require('./Nutrition.js');

const API_CODES = {
  SUCCESS: 0,
  NO_RESULTS: 1,
  INVALID_KEY: 2,
  URL_NOT_FOUND: 3
}

const DEFAULT_API_DOMAIN = "https://api.nal.usda.gov/ndb/";

const DEFAULT_NUM_SEARCH_RESULTS = 25;

//the nutrients we care about:
const NUTRIENT_STRING = "nutrients=301&nutrients=601&nutrients=291&nutrients=208" +
  "&nutrients=303&nutrients=306&nutrients=203&nutrients=606&nutrients=307" +
  "&nutrients=205&nutrients=204&nutrients=269&nutrients=605&nutrients=328";

/*
 * API constructs an object with two function properties, one to search for foods
 * from the given domain and one to get nutrient quantities for a food.
 * API is constructed from an API key (default is DEMO_KEY) and a domain (default
 * is https://api.nal.usda.gov/ndb/ , the USDA's food composition database)
 * Specification for USDA's ndb can be found at: https://ndb.nal.usda.gov/ndb/doc/index
 */
function APIRequester(key, domain) {
  if(domain == null) {
    domain = DEFAULT_API_DOMAIN;
  }
  //Function to search for foods:
  this.foodSearch = function(searchString, callback, numResults) {
    if(searchString == null) {
      searchString = "";
    }

    if(callback == null) {
      callback = function() {};
    }

    if(isNaN(numResults)) {
      numResults = DEFAULT_NUM_SEARCH_RESULTS;
    }

    let searchRequest = new XMLHttpRequest();
    searchRequest.onreadystatechange = function() {
      if(this.readyState == 4) {
        if(this.status == 200) {
          let response = JSON.parse(this.responseText);
          //This is specific to USDA's NDB response format:
          if(response.hasOwnProperty("error")) {
            callback([], API_CODES.INVALID_KEY);
          } else if(response.hasOwnProperty("errors")) {
            callback([], API_CODES.NO_RESULTS);
          } else {
            //Translate into a reasonable format:
            let responseFoods = [];
            for(let i = response.list.start; i < response.list.end; i++) {
              responseFoods[i - response.list.start] = {
                name: response.list.item[i].name,
                group: response.list.item[i].group,
                ndbno: response.list.item[i].ndbno
              };
            }
            callback(responseFoods, API_CODES.SUCCESS);
          }
        } else {
          callback([], API_CODES.URL_NOT_FOUND);
        }
      }
    };

    let requestText = domain + "search/?format=json&q=" + searchString +
        "&sort=r&max=" + numResults + "&ds=Standard\ Reference&offset=0&api_key="
        + key;

    searchRequest.open("GET", requestText, true);
    searchRequest.send();
  }

  this.nutritionInfo = function(ndbid, callback) {
    let nutritionRequest = new XMLHttpRequest();
    nutritionRequest.onreadystatechange = function() {
      if(this.readyState == 4) {
        if(this.status == 200) {
          let response = JSON.parse(this.responseText);
          ////This is also specific to USDA's NDB response format:
          if(response.hasOwnProperty("error")) {
            callback({}, API_CODES.INVALID_KEY);
          } else if(response.hasOwnProperty("errors")) {
            callback({}, API_CODES.NO_RESULTS);
          } else {
            let food = response.report.foods[response.report.start];
            if(food.ndbno != ndbid) {
              callback({}, API_CODES.NO_RESULTS);
            } else {

              let responseNutrients = {};
              Object.keys(food.nutrients).forEach((i) => {
                responseNutrients[food.nutrients[i].nutrient_id] = food.nutrients[i].gm
              });

              let nutrients = {};
              Object.keys(nutrition.NUTRIENT_LIST).forEach((nid) => {
                let ndbId = nutrition.NUTRIENT_LIST[nid].ndbId;
                if(responseNutrients.hasOwnProperty(ndbId) && !isNaN(responseNutrients[ndbId])) {
                  nutrients[nid] = responseNutrients[ndbId];
                } else {
                  nutrients[nid] = 0;
                }
              });

              callback(nutrients, API_CODES.SUCCESS);
            }
          }
        } else {
          callback({}, API_CODES.URL_NOT_FOUND);
        }
      }
    };

    let requestText = domain + "nutrients/?format=json&api_key=" + key + "&" +
        NUTRIENT_STRING + "&ndbno=" + ndbid;

    nutritionRequest.open("GET", requestText, true);
    nutritionRequest.send();
  }

}

module.exports = {
  API_CODES,
  APIRequester
}
