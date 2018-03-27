// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const api = require('./api.js');
const ds = require('./data-store.js');
const rm = require('./recipe-model.js');
const nut = require('./nutrition.js');
const meas = require('./measurement.js');
const electron = require('electron');
const url = require('url');
const path = require('path');

const API_URL = "https://api.nal.usda.gov/ndb/";
const RECIPE_DATA_FILENAME = "alchemist-recipes.json";
const CONF_FILENAME = "alchemist-conf.json";

var userSettings;
var recipeLibrary;
var editingRecipe; //the recipe currently loaded in editor
var apiSession;
var nutritionWindow;

//setup() runs onload, hooks static buttons, loads user data, and sets the
//initial state
function setup() {
  //API key settings:
  userSettings = ds.loadData(CONF_FILENAME);
  if(userSettings.apiKey == null) {
    userSettings.apiKey = "DEMO_KEY";
  }
  let apiText = document.getElementById("api-key-text");
  apiText.value = userSettings.apiKey;

  document.getElementById("api-key-update-button").addEventListener('click', updateAPIKey);
  updateAPIKey();

  recipeLibrary = rm.RecipeLibrary(ds.loadData(RECIPE_DATA_FILENAME));

  renderRecipeList();
  document.getElementById("usda-search-button").addEventListener('click', foodSearch);
  document.getElementById("usda-search-box").addEventListener('keydown', function(key) {
    if(key.keyCode === 13) {
      foodSearch();
    }
  });

  document.getElementById("recipe-save-button").addEventListener('click', saveRecipe);
  document.getElementById("new-recipe-button").addEventListener('click', newRecipe);
  document.getElementById("new-recipe-text").addEventListener('keydown', function(key) {
    if(key.keyCode === 13) {
      newRecipe();
    }
  });

  document.getElementById("recipe-search-box").addEventListener('input', recipeSearch);
  document.getElementById("save-recipes-button").addEventListener('click', saveAllRecipes);


  //other button hooks etc.
}

function updateAPIKey() {
  let apiText = document.getElementById("api-key-text");
  userSettings.apiKey = apiText.value;
  apiSession = api.ApiSession(API_URL, userSettings.apiKey);
  ds.saveData(userSettings, CONF_FILENAME, function() {
    console.log("saved settings");
  });
}

function saveAllRecipes() {
  ds.saveData(recipeLibrary.saveData, RECIPE_DATA_FILENAME, function() {
    console.log("saving complete");
  });
}

//Renders the list of saved recipes which can be edited etc.
function renderRecipeList() {
  let recipeList = document.getElementById("recipe-list");
  recipeList.innerHTML = ""; //
  let recipes = recipeLibrary.recipeList;
  console.log("rendering recipes: " + JSON.stringify(recipes));
  for(let i = 0; i < recipes.length; i++) {
    let currentRecipeName = recipes[i];

    let currentRow = document.createElement('tr');
    let nameCell = document.createElement('td');
    let editCell = document.createElement('td');
    let nutritionCell = document.createElement('td');
    let ingredientsCell = document.createElement('td');
    let deleteCell = document.createElement('td');
    let editButton = document.createElement('button');
    let nutritionButton = document.createElement('button');
    let ingredientsButton = document.createElement('button');
    let deleteButton = document.createElement('button');

    editButton.innerHTML = "Edit";
    editButton.className += " btn btn-primary";
    editButton.addEventListener('click', function() {
      editingRecipe = recipeLibrary.getRecipe(currentRecipeName);
      renderRecipeEditing();
    });

    nutritionButton.innerHTML = "Nutrition Facts";
    nutritionButton.className += " btn btn-primary";
    nutritionButton.addEventListener('click', function() {
      nut.getNutritionData(currentRecipeName, recipeLibrary, apiSession,
        function(nutritionData, responseCode) {
        let hash = JSON.stringify(nutritionData);
        console.log("nutrient totals: " + JSON.stringify(nutritionData));

        nutritionWindow = new electron.remote.BrowserWindow({width: 800, height: 600});

        nutritionWindow.loadURL(url.format({
          pathname: path.join(__dirname, 'tabular-nutrition.html'),
          protocol: 'file:',
          slashes: true,
          hash
        }));

      });

    });

    ingredientsButton.innerHTML = "Copy Ingredients to Clipboard";
    ingredientsButton.className += " btn btn-primary";
    ingredientsButton.addEventListener('click', function() {
      let ingredientsList =
        nut.generateIngredientString(currentRecipeName, recipeLibrary);
      electron.clipboard.writeText(ingredientsList);
    });

    deleteButton.innerHTML = "Delete";
    deleteButton.className += " btn btn-primary";
    deleteButton.addEventListener('click', function() {
      recipeLibrary.deleteRecipe(currentRecipeName);
      renderRecipeList();
    });

    nameCell.innerHTML = currentRecipeName;
    editCell.appendChild(editButton);
    nutritionCell.appendChild(nutritionButton);
    ingredientsCell.appendChild(ingredientsButton);
    deleteCell.appendChild(deleteButton);

    currentRow.appendChild(nameCell);
    currentRow.appendChild(editCell);
    currentRow.appendChild(nutritionCell);
    currentRow.appendChild(ingredientsCell);
    currentRow.appendChild(deleteCell);

    recipeList.appendChild(currentRow);

  }

  document.getElementById("edit-recipe-container").style.display = "none";
  document.getElementById("recipe-list-container").style.display = "block";

}

//Asks the user for a name and creates a recipe with that name
function newRecipe() {
  let newRecipeInput = document.getElementById("new-recipe-text");
  let recipeName = newRecipeInput.value;
  newRecipeInput.value = "";
  editingRecipe = recipeLibrary.newRecipe(recipeName);
  renderRecipeEditing();
}

//Brings up the recipe editing screen for whatever recipe is currently stored
//in the editingRecipe global.
function renderRecipeEditing() {
  let recipeNameField = document.getElementById("edit-recipe-name");
  recipeNameField.innerHTML = editingRecipe.name;

  let servingSizeInput = document.getElementById("serving-size-text");
  let servingSizeUnitSelect = document.getElementById("serving-size-unit");

  servingSizeInput.value = editingRecipe.servingSize.quantity;
  servingSizeUnitSelect.selectedIndex = editingRecipe.servingSize.unit;

  servingSizeInput.addEventListener('change', function() {
    editingRecipe.servingSize = meas.Measurement(servingSizeInput.value,
      servingSizeUnitSelect.selectedIndex);
  });

  servingSizeUnitSelect.addEventListener('change', function() {
    editingRecipe.servingSize = meas.Measurement(servingSizeInput.value,
      servingSizeUnitSelect.selectedIndex);
  })
  renderSubFoods();
  renderSubRecipes();

  document.getElementById("edit-recipe-container").style.display = "block";
  document.getElementById("loading-display").style.display = "none";
  document.getElementById("recipe-list-container").style.display = "none";

  if(recipeLibrary.isValid(editingRecipe)) {
    document.getElementById("recipe-save-button").disabled = false;
  } else {
    document.getElementById("recipe-save-button").disabled = true;
  }
}

//renders the subfoods list of the recipe editing screen
function renderSubFoods() {
  let subFoodsElement = document.getElementById("edit-recipe-subFoods");
  subFoodsElement.innerHTML = "";

  let subFoods = editingRecipe.subFoods;
  for(let foodIngredient in subFoods) {
    if(subFoods.hasOwnProperty(foodIngredient)) {
      console.log("creating row and delete button for " + foodIngredient);
      let currentRow = document.createElement("tr");
      let nameCell = document.createElement("td");
      let quantityCell = document.createElement("td");
      let unitCell = document.createElement("td");
      let sugarsCell = document.createElement("td");
      let deleteCell = document.createElement("td");

      //Name:
      let nameText = document.createElement("input");
      nameText.value = subFoods[foodIngredient].name;
      nameCell.appendChild(nameText);

      //Quantity text:
      let quantityText = document.createElement("input");
      quantityText.setAttribute("type", "number");
      quantityText.className += " quantity-input";
      quantityText.value = subFoods[foodIngredient].amount.quantity;
      quantityCell.appendChild(quantityText);

      //Unit select:
      let unitSelect = document.createElement("select");
      let unitOptionG = document.createElement("option");
      unitOptionG.value = "g";
      unitOptionG.innerHTML = "g";
      let unitOptionOz = document.createElement("option");
      unitOptionOz.value = "oz";
      unitOptionOz.innerHTML = "oz";
      unitSelect.appendChild(unitOptionG);
      unitSelect.appendChild(unitOptionOz);
      unitSelect.selectedIndex = subFoods[foodIngredient].amount.unit;
      unitCell.appendChild(unitSelect);


      //create the delete button for the row
      let deleteButton = document.createElement("button");
      deleteButton.innerHTML = "&times;";
      deleteButton.className += " close";
      deleteCell.appendChild(deleteButton);

      let sugarsCheck = document.createElement("input");
      sugarsCheck.setAttribute("type", "checkbox");
      sugarsCheck.checked = subFoods[foodIngredient].addedSugars;
      sugarsCell.appendChild(sugarsCheck);

      currentRow.appendChild(nameCell);
      currentRow.appendChild(quantityCell);
      currentRow.appendChild(unitCell);
      currentRow.appendChild(sugarsCell);
      currentRow.appendChild(deleteCell);
      subFoodsElement.appendChild(currentRow);

      nameText.addEventListener("change", function() {
        editingRecipe.addSubFood(foodIngredient, nameText.value,
          meas.Measurement(quantityText.value, unitSelect.selectedIndex),
          sugarsCheck.checked);
      });
      quantityText.addEventListener("change", function() {
        editingRecipe.addSubFood(foodIngredient, nameText.value,
          meas.Measurement(quantityText.value, unitSelect.selectedIndex),
          sugarsCheck.checked);
      });
      unitSelect.addEventListener("change", function() {
        editingRecipe.addSubFood(foodIngredient, nameText.value,
          meas.Measurement(quantityText.value, unitSelect.selectedIndex),
          sugarsCheck.checked);
      });
      sugarsCheck.addEventListener("change", function() {
        editingRecipe.addSubFood(foodIngredient, nameText.value,
          meas.Measurement(quantityText.value, unitSelect.selectedIndex),
          sugarsCheck.checked);
      });

      deleteButton.addEventListener("click", function() {
        console.log("deleting " + foodIngredient);
        editingRecipe.deleteSubFood(foodIngredient);
        renderRecipeEditing();
      });
    }
  }
}

function renderSubRecipes() {
  let subRecipesElement = document.getElementById("edit-recipe-subRecipes");
  subRecipesElement.innerHTML = "";

  let subRecipes = editingRecipe.subRecipes;
  for(let recipeIngredient in subRecipes) {
    if(subRecipes.hasOwnProperty(recipeIngredient)) {
      console.log("creating row and delete button for " + recipeIngredient);
      let currentRow = document.createElement("tr");
      let nameCell = document.createElement("td");
      let quantityCell = document.createElement("td");
      let unitCell = document.createElement("td");
      let deleteCell = document.createElement("td");

      nameCell.innerHTML = recipeIngredient;

      //recipe quantity:
      let quantityText = document.createElement("input");
      quantityText.setAttribute("type", "number");
      quantityText.className += " quantity-input";
      quantityText.value = subRecipes[recipeIngredient].quantity;
      quantityCell.appendChild(quantityText);

      //Unit selector:
      let unitSelect = document.createElement("select");
      let unitOptionG = document.createElement("option");
      unitOptionG.value = "g";
      unitOptionG.innerHTML = "g";
      let unitOptionOz = document.createElement("option");
      unitOptionOz.value = "oz";
      unitOptionOz.innerHTML = "oz";
      unitSelect.appendChild(unitOptionG);
      unitSelect.appendChild(unitOptionOz);
      unitSelect.selectedIndex = subRecipes[recipeIngredient].unit;
      unitCell.appendChild(unitSelect);

      //create the delete button for the row
      let deleteButton = document.createElement("button");
      deleteButton.innerHTML = "&times;";
      deleteButton.className += " close";
      deleteCell.appendChild(deleteButton);

      //Build the row
      currentRow.appendChild(nameCell);
      currentRow.appendChild(quantityCell);
      currentRow.appendChild(unitCell);
      currentRow.appendChild(deleteCell);
      subRecipesElement.appendChild(currentRow);

      //Add event listeners
      quantityText.addEventListener("change", function() {
        editingRecipe.addSubRecipe(recipeIngredient,
          meas.Measurement(quantityText.value, unitSelect.selectedIndex));
      });
      unitSelect.addEventListener("change", function() {
        editingRecipe.addSubRecipe(recipeIngredient,
          meas.Measurement(quantityText.value, unitSelect.selectedIndex));
      });

      deleteButton.addEventListener("click", function() {
        console.log("deleting " + recipeIngredient);
        editingRecipe.deleteSubRecipe(recipeIngredient);
        renderRecipeEditing();
      })
    }
  }
}


//Saved the editing recipe and renders the recipeList
function saveRecipe() {
  recipeLibrary.saveRecipe(editingRecipe);
  renderRecipeList();
}

//Function for the recipe search button on the recipe editing screen
function recipeSearch() {
  let searchText = document.getElementById("recipe-search-box").value;
  let searchResults = document.getElementById("recipe-search-results");
  searchResults.innerHTML = "";
  let recipes = recipeLibrary.recipeList;
  for(let i = 0; i < recipes.length; i++) {
    let recipeName = recipes[i];
    if(searchText.length > 0 && recipeName.startsWith(searchText)
        && recipeLibrary.isValidChild(editingRecipe, recipeName)) {
      let newRow = document.createElement('tr');
      let nameCell = document.createElement('td');
      let addCell = document.createElement('td');
      let addButton = document.createElement('button');
      addButton.innerHTML = "+";
      addButton.className += " btn btn-primary";

      nameCell.innerHTML = recipes[i];
      addButton.addEventListener('click', function() {
        editingRecipe.addSubRecipe(recipes[i], meas.Measurement(100, meas.GRAMS));
        renderRecipeEditing();
      })

      addCell.appendChild(addButton);
      newRow.appendChild(nameCell);
      newRow.appendChild(addCell);

      searchResults.appendChild(newRow);
    }

  }
}

//Function for searching the NDB for a food from the recipe editing screen
function foodSearch() {
  //Returns an html row with the given message
  function errorRow(message) {
    let errorRow = document.createElement('tr');
    let errorCell = document.createElement('td');
    errorCell.innerHTML = message;
    errorRow.appendChild(errorCell);
    return errorRow;
  }

  let searchText = document.getElementById("usda-search-box").value;
  let searchResultsArea = document.getElementById("usda-search-results");
  let loadingGif = document.getElementById("loading-display")
  loadingGif.style.display = "block";
  searchResultsArea.innerHTML = "";
  apiSession.foodSearch(searchText,
    function(responseFoods, responseCode) {
      loadingGif.style.display = "none";
      //The normal case:
      if(responseCode == api.SUCCESS) {
        for(let i = 0; i < responseFoods.length; i++) {
          let currentFood = responseFoods[i];
          let currentRow = document.createElement('tr');
          let nameCell = document.createElement('td');
          let categoryCell = document.createElement('td');
          let addCell = document.createElement('td')
          let addButton = document.createElement('button');
          addButton.innerHTML = "+";
          addButton.className += " btn btn-primary";

          nameCell.innerHTML = currentFood.name;
          categoryCell.innerHTML = currentFood.group;
          addButton.addEventListener('click', function() {
            editingRecipe.addSubFood(currentFood.ndbno, currentFood.name,
              meas.Measurement(100, meas.GRAMS), false);
            renderRecipeEditing();
          });

          addCell.appendChild(addButton);

          currentRow.appendChild(nameCell);
          currentRow.appendChild(categoryCell);
          currentRow.appendChild(addCell);
          searchResultsArea.appendChild(currentRow);
        }

      } else if(responseCode == api.NO_RESULTS) {
        searchResultsArea.appendChild(errorRow("No results found"));
      } else if(responseCode == api.INVALID_KEY) {
        searchResultsArea.appendChild(errorRow("Invalid API key"));
      } else {
        searchResultsArea.appendChild(errorRow("URL not found"));
      }
    });
}

setup();
