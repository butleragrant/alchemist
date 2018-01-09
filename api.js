/*
 * api.js exports a single function: ApiSession to create a 'session' with the
 * USDA API.
 * @author Grant
 */

 /*
 * ApiSession creates an object with functions to search the USDA database for
 * foods and get nutrition data for foods.
 * Note: the USDA API is stateless and thus the idea of a 'session' here is
 * purely clientside.
 * @param domain {string} The domain to send requests to
 * @param apiKey {string} The API key to use for requests
 */

exports.ApiSession = function(domain, apiKey) {
  return {
    /*
     * foodSearch sends a food-search request for the given word and calls
     * the callback function on the returned JSON object.
     * @param word {string} The word to search the database for
     * @param callback {function} The function to call on the resulting JSON object
     */
    foodSearch: function(word, callback) {
      let searchRequest = new XMLHttpRequest();
      searchRequest.onreadystatechange = function() {
        console.log("foodSearch readystate change");
        if(this.readyState == 4 && this.status == 200) {
          let response = JSON.parse(this.responseText);
          callback(response);
        } else {
          console.log("foodSearch request returned: " + this.readyState + " " + this.status);
        }
      }
      let requestText = domain + "search/?format=json&q=" + word + "&sort=r&max=25&ds=Standard\ Reference&offset=0&api_key=" + apiKey;
      console.log("opening");
      console.log(searchRequest.readyState + " " + searchRequest.status);
      searchRequest.open("GET", requestText, true);
      searchRequest.send();
    },

    /*
     * nutritionDataRequest submits a nutrition data request for the given list
     * of foods and calls a given function on the resulting JSON object.
     * @param foodList {Array[string]} An array of foods to get nutrition data for
     * @param callback {function} A function to call on the resulting JSON object
     * TODO: We need to update this if we think we'll have more than 50 ingredients!
     */
    nutritionDataRequest : function(foodList, callback) {
      let nutritionRequest = new XMLHttpRequest();
      nutritionRequest.onreadystatechange = function() {
        console.log("nutritionData readystate change");
        if(this.readyState == 4 && this.status == 200) {
          let response = JSON.parse(this.responseText);
          callback(response);
        } else {
          console.log("nutritionData request returned: " + this.readyState + " " + this.status);
        }
      }

      let requestText = domain + "V2/reports?format=json&api_key=" + apiKey + "&type=b";

      for(let i = 0; i < foodList.length; i++) {
        requestText += "&ndbno=" + foodList[i];
      }

      nutritionRequest.open("GET", requestText, true);
      nutritionRequest.send();

    }
  }
}
