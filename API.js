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

function API(domain, key) {

  this.foodSearch = function(searchString, callback, branded, numResults) {
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
          if(response.hasOwnProperty("error")) {
            callback([], API_CODES.INVALID_KEY);
          } else if(response.hasOwnProperty("errors")) {
            callback([], API_CODES.NO_RESULTS);
          } else {
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
          if(response.hasOwnProperty("error")) {
            callback({}, API_CODES.INVALID_KEY);
          } else if(response.hasOwnProperty("errors")) {
            callback({}, API_CODES.NO_RESULTS);
          } else {
            console.log("nutrition response was: " + JSON.stringify(response));
            let food = response.report.foods[response.report.start];
            if(food.ndbno != ndbid) {
              callback({}, API_CODES.NO_RESULTS);
            } else {

              let responseNutrients = {};
              for(let i in food.nutrients) {
                if(food.nutrients.hasOwnProperty(i)) {
                  responseNutrients[food.nutrients[i].nutrient_id] = food.nutrients[i].gm;
                }
              }

              let nutrients = {};
              for(let nid in nutrition.NUTRIENT_LIST) {
                if(nutrition.NUTRIENT_LIST.hasOwnProperty(nid)) {
                  let currentId = nutrition.NUTRIENT_LIST[nid].ndbId;
                  if(responseNutrients.hasOwnProperty(currentId) && !isNaN(responseNutrients[currentId])) {
                    nutrients[nid] = responseNutrients[currentId];
                  } else {
                    nutrients[nid] = 0;
                  }
                }
              }

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
  API,
  DEFAULT_API_DOMAIN
}
