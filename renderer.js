// This file is required by the index.html file and will
// be executed in the renderer process for that window.


const alch = require('./alchemist.js');
const electron = require('electron');
const $ = require('jquery');
const bs = require('bootstrap');
const meas = require('./Measurement.js');

let control = new alch.Alchemist();

//setup() runs onload, hooks static buttons, loads user data, and sets the
//initial state
function setup() {
  populateUnitSelectors(); //add options to the unit selection dropdowns
  setupSettings();
  setupMainPage();
  setupRecipeEditor();
  setupFoodEditor();
  setupNutritionInfo();

  renderMainPage();
}

//Hook static buttons on the "main page" (recipe and food lists)
function setupMainPage() {
  $('#new-recipe-button').click(function() {
    let newRid = control.newRecipe();
    editRecipe(newRid, function() {
      $('#save-status-saved').hide();
      $('#save-status-error').hide();
      $('#save-status-saving').show();
      control.saveRecipeData(function(error) {
        $('#save-status-saving').hide();
        if(error) {
          $('#save-status-error').html(error);
          $('#save-status-error').show();
        } else {
          $('#save-status-saved').show();
        }
      });
      renderMainPage();
    });
  });

  $('#new-food-button').click(function() {
    let newFid = control.newFood();
    editFood(newFid, function() {
      $('#save-status-saved').hide();
      $('#save-status-error').hide();
      $('#save-status-saving').show();
      control.saveRecipeData(function(error) {
        $('#save-status-saving').hide();
        if(error) {
          $('#save-status-error').html(error);
          $('#save-status-error').show();
        } else {
          $('#save-status-saved').show();
        }
      });
      renderMainPage();
    });
  });

  $('#save-status-saved').show();
  $('#save-status-saving').hide();
  $('#save-status-error').hide();
}

//Renders the "main page" (recipe and food lists)
function renderMainPage() {
  //Create rows of recipes:
  let recipes = control.allRecipes();

  $('.recipe-row').remove(); //delete rows from a previous rendering
  $('#recipe-list .empty-table-row').show(); //Show an "no recipes" message
  Object.keys(recipes).forEach(function(rid) {
    $('#recipe-list .empty-table-row').hide(); //remove the "no recipes" message

    let nameCell = $('<td></td>');
    let factsCell = $('<td></td>');
    let editCell = $('<td></td>');
    let deleteCell = $('<td></td>');

    let factsButton = $('<button class="btn btn-primary" type="button">Nutrition Info</button>');
    factsButton.click(function() {
      showNutritionInfo(rid);
    });

    let editButton = $('<button class="btn btn-primary" type="button">Edit</button>');
    editButton.click(function() {
      editRecipe(rid, function() {
        $('#save-status-saved').hide();
        $('#save-status-error').hide();
        $('#save-status-saving').show();
        control.saveRecipeData(function(error) {
          $('#save-status-saving').hide();
          if(error) {
            $('#save-status-error').html(error);
            $('#save-status-error').show();
          } else {
            $('#save-status-saved').show();
          }
        });
        renderMainPage();
      });
    });

    let deleteButton = $('<button class="btn btn-primary" type="button">Delete</button>');
    deleteButton.click(function() {
      control.deleteRecipe(rid);
      $('#save-status-saved').hide();
      $('#save-status-error').hide();
      $('#save-status-saving').show();
      console.log("saving...");
      control.saveRecipeData(function(error) {
        console.log("done saving");
        $('#save-status-saving').hide();
        if(error) {
          $('#save-status-error').html(error);
          $('#save-status-error').show();
        } else {
          $('#save-status-saved').show();
        }
      });
      renderMainPage();
    });

    nameCell.append(recipes[rid]);
    factsCell.append(factsButton);
    editCell.append(editButton);
    deleteCell.append(deleteButton);

    let row = $('<tr class="recipe-row"></tr>');
    row.append(nameCell);
    row.append(factsCell);
    row.append(editCell);
    row.append(deleteCell);
    $('#recipe-list').append(row);
  });

  //Create rows for foods:
  let foods = control.allFoods();

  $('.food-row').remove(); //Delete rows from previous renderings
  $('#food-list .empty-table-row').show(); //Show a "no foods" message
  Object.keys(foods).forEach(function(fid) {
    $('#food-list .empty-table-row').hide(); //Hide the "no foods" message
    let nameCell = $('<td></td>');
    let factsCell = $('<td></td>');
    let editCell = $('<td></td>');
    let deleteCell = $('<td></td>');

    let factsButton = $('<button class="btn btn-primary" type="button">Nutrition Info</button>');
    factsButton.click(function() {
      //TODO do we want this??????
    });

    let editButton = $('<button class="btn btn-primary" type="button">Edit</button>');
    editButton.click(function() {
      editFood(fid, function() {
        $('#save-status-saved').hide();
        $('#save-status-error').hide();
        $('#save-status-saving').show();
        control.saveRecipeData(function(error) {
          $('#save-status-saving').hide();
          if(error) {
            $('#save-status-error').html(error);
            $('#save-status-error').show();
          } else {
            $('#save-status-saved').show();
          }
        });
        renderMainPage();
      });
    });

    let deleteButton = $('<button class="btn btn-primary" type="button">Delete</button>');
    deleteButton.click(function() {
      control.deleteFood(fid);
      $('#save-status-saved').hide();
      $('#save-status-error').hide();
      $('#save-status-saving').show();
      control.saveRecipeData(function(error) {
        $('#save-status-saving').hide();
        if(error) {
          $('#save-status-error').html(error);
          $('#save-status-error').show();
        } else {
          $('#save-status-saved').show();
        }
      });
      renderMainPage();
    });

    nameCell.append(foods[fid]);
    factsCell.append(factsButton);
    editCell.append(editButton);
    deleteCell.append(deleteButton);

    let row = $('<tr class="food-row"></tr>');
    row.append(nameCell);
    row.append(factsCell);
    row.append(editCell);
    row.append(deleteCell);
    $('#food-list').append(row);
  });

  $('#edit-recipe-container').hide();
  $('#edit-food-container').hide();
  $('#main-page-container').show();
}

function setupRecipeEditor() {
  //TODO do need/want this?
}

//Edit a recipe:
function editRecipe(rid, doneCallback) {
  let recipeEditor = control.editRecipe(rid);
  renderRecipeEditor(recipeEditor, doneCallback);
}

//Render the recipe editing screen
function renderRecipeEditor(recipeEditor, doneCallback) {
  //Recipe name field:
  $('#recipe-name-input').val(recipeEditor.getName());
  $('#recipe-name-input').change(function() {
    recipeEditor.setName($('#recipe-name-input').val());
  });

  //Serving size field:
  let servingSize = recipeEditor.getServingSize();
  $('#serving-size-input').val(servingSize.amount);
  $('#serving-size-unit').val(servingSize.unit);
  $('#serving-size-input, #serving-size-unit').change(function() {
    recipeEditor.setServingSize($('#serving-size-input').val(), $('serving-size-unit').val());
  });


  $('.edit-recipe-subRecipe-row').remove();
  $('#edit-recipe-subRecipes .empty-table-row').show();
  let subRecipes = recipeEditor.listSubRecipes();
  Object.keys(subRecipes).forEach(function(subRid) {
    $('#edit-recipe-subRecipes .empty-table-row').hide();

    let nameCell = $('<td></td>');
    let amountCell = $('<td></td>');
    let unitCell = $('<td></td>');
    let deleteCell = $('<td></td>');

    nameCell.append(subRecipes[subRid].name);

    let amountInput = $('<input type="number" class="quantity-input form-control"/>');
    amountInput.val(subRecipes[subRid].amount);
    amountCell.append(amountInput);

    let unitSelect = $('<select class="form-control unit-select"/>)');
    populateUnitSelector(unitSelect);
    unitSelect.val(subRecipes[subRid].unit);
    unitCell.append(unitSelect);

    let deleteButton = $('<button class="btn btn-primary" type="button">Delete</button>');
    deleteCell.append(deleteButton);

    let row = $('<tr class="edit-recipe-subRecipe-row"></tr>');
    row.append(nameCell);
    row.append(amountCell);
    row.append(unitCell);
    row.append(deleteCell);

    //Elements are created, now hook changes etc.
    amountInput.change(function() {
      recipeEditor.addSubRecipe(subRid, amountInput.val(), unitSelect.val());
    });

    unitSelect.change(function() {
      recipeEditor.addSubRecipe(subRid, amountInput.val(), unitSelect.val());
    });

    deleteButton.click(function() {
      recipeEditor.deleteSubRecipe(subRid);
      renderRecipeEditor(recipeEditor, doneCallback);
    });

    //and append the row
    $('#edit-recipe-subRecipes').append(row);
  });

  $('.edit-recipe-subFood-row').remove();
  $('#edit-recipe-subFoods .empty-table-row').show();
  let subFoods = recipeEditor.listSubFoods();
  console.log("subFoods in renderer is " + JSON.stringify(subFoods));
  Object.keys(subFoods).forEach(function(subFid) {
    $('#edit-recipe-subFoods .empty-table-row').hide();

    let nameCell = $('<td></td>');
    let amountCell = $('<td></td>');
    let unitCell = $('<td></td>');
    let deleteCell = $('<td></td>');

    nameCell.append(subFoods[subFid].name);

    let amountInput = $('<input type="number" id="serving-size-input" class="quantity-input form-control"/>');
    amountInput.val(subFoods[subFid].amount);
    amountCell.append(amountInput);

    let unitSelect = $('<select id="serving-size-unit" class="form-control unit-select"/>)');
    populateUnitSelector(unitSelect);
    unitSelect.val(subFoods[subFid].unit);
    unitCell.append(unitSelect);

    let deleteButton = $('<button class="btn btn-primary" type="button">Delete</button>');
    deleteCell.append(deleteButton);

    let row = $('<tr class="edit-recipe-subRecipe-row"></tr>');
    row.append(nameCell);
    row.append(amountCell);
    row.append(unitCell);
    row.append(deleteCell);

    //Elements are created, now hook changes etc.
    amountInput.change(function() {
      recipeEditor.addSubFood(subFid, amountInput.val(), unitSelect.val());
    });

    unitSelect.change(function() {
      recipeEditor.addSubFood(subFid, amountInput.val(), unitSelect.val());
    });

    deleteButton.click(function() {
      recipeEditor.deleteSubFood(subFid);
      renderRecipeEditor(recipeEditor, doneCallback);
    });

    //and append the row
    $('#edit-recipe-subFoods').append(row);
  });

  $('.recipe-search-row').remove();
  $('#recipe-search-results .empty-table-row').show();
  $('#recipe-search-text').val("");
  //Searching recipes
  $('#recipe-search-text').off('input').on('input', function() {
    let searchString = $('#recipe-search-text').val();
    let results = recipeEditor.searchRecipes(searchString);
    console.log("results are: " + JSON.stringify(results));

    let resultsTable = $('#recipe-search-results')

    $('.recipe-search-row').remove();
    $('#recipe-search-results .empty-table-row').show();
    Object.keys(results).forEach(function(resultRid) {
      $('#recipe-search-results .empty-table-row').hide();

      let row = $('<tr class="recipe-search-row"></tr>');

      let nameCell = $('<td></td>');
      let addCell = $('<td></td>');

      nameCell.append(results[resultRid]);

      let addButton = $('<button class="btn" type="button">Add</button>');
      addButton.click(function() {
        recipeEditor.addSubRecipe(resultRid);
        renderRecipeEditor(recipeEditor, doneCallback);
      });

      addCell.append(addButton);

      row.append(nameCell);
      row.append(addButton);

      resultsTable.append(row);
    });
  });

  $('.food-search-row').remove();
  $('#food-search-results .empty-table-row').show();
  $('#food-search-text').val("");
  //Searching foods:
  $('#food-search-text').off('input').on('input', function() {
    let searchString = $('#food-search-text').val();
    let results = recipeEditor.searchFoods(searchString);
    console.log("Food search results are: " + JSON.stringify(results));
    $('.food-search-row').remove();
    let resultsTable = $('#food-search-results')
    $('#food-search-results .empty-table-row').show();
    Object.keys(results).forEach(function(resultFid) {
      $('#food-search-results .empty-table-row').hide();

      let row = $('<tr class="food-search-row"></tr>');

      let nameCell = $('<td></td>');
      let addCell = $('<td></td>');

      nameCell.append(results[resultFid]);

      let addButton = $('<button class="btn" type="button">Add</button>');
      addButton.click(function() {
        console.log("add button clicked");
        recipeEditor.addSubFood(resultFid);
        renderRecipeEditor(recipeEditor, doneCallback);
      });

      addCell.append(addButton);

      row.append(nameCell);
      row.append(addCell);

      resultsTable.append(row);
    });
  });


  $('#recipe-save-button').off('click').click(function() {
    recipeEditor.save();
    doneCallback();
  });

  $('#recipe-cancel-button').off('click').click(function() {
    console.log("cancelling recipe editing");
    doneCallback();
  });

  $('#main-page-container').hide();
  $('#edit-food-container').hide();
  $('#edit-recipe-container').show();

}

function setupFoodEditor() {
  $('#added-sugars-check').change(function() {
    $('#added-sugars-input').prop('disabled', this.checked);
    if(this.checked) {
      $('#added-sugars-input').val($('#sugars-input').val());
      $('#sugars-input').change(function() {
        $('#added-sugars-input').val($('#sugars-input').val());
      });
    } else {
      $('#sugars-input').off('change');
    }

  });
}

//TODO: make sure added sugars is not > than total sugars
//same with the fats
function editFood(fid, doneCallback) {
  let foodEditor = control.editFood(fid);
  renderFoodEditor(foodEditor, doneCallback);
}

function renderFoodEditor(foodEditor, doneCallback) {
  //The recipe editor updates the editor object throughout the construction process
  //This is necessary for it but for the food editor, it can just do its updates
  //when the save button is clicked.
  $('#food-name-input').val(foodEditor.getName());

  let servingSize = foodEditor.getServingSize();
  $('#food-serving-size-input').val(servingSize.amount);
  $('#food-serving-size-unit').val(servingSize.unit);

  let nutrients = foodEditor.getNutrients();

  $('#calories-input').val(nutrients["Calories"]);
  $('#fat-input').val(nutrients["Total Fat"]);
  $('#saturated-fat-input').val(nutrients["Saturated Fat"]);
  $('#trans-fat-input').val(nutrients["Trans Fat"]);
  $('#cholesterol-input').val(nutrients["Cholesterol"]);
  $('#sodium-input').val(nutrients["Sodium"]);
  $('#carbohydrate-input').val(nutrients["Total Carbohydrate"]);
  $('#fiber-input').val(nutrients["Dietary Fiber"]);
  $('#sugars-input').val(nutrients["Total Sugars"]);
  $('#added-sugars-input').val(nutrients["Added Sugars"]);
  $('#protein-input').val(nutrients["Protein"]);
  $('#calcium-input').val(nutrients["Calcium"]);
  $('#iron-input').val(nutrients["Iron"]);
  $('#potassium-input').val(nutrients["Potassium"]);
  $('#vitamin-d-input').val(nutrients["Vitamin D"]);

  if(nutrients["Total Sugars"] == nutrients["Added Sugars"]) {
    $('#added-sugars-check').prop('checked', true);
    $('#added-sugars-check').change();
  } else {
    $('#added-sugars-check').prop('checked', false);
    $('#added-sugars-check').change();
  }

  //Searching the NDB:
  $('#ndb-search-results #state-row').html('<td>Search the USDA DB above</td>');
  $('#ndb-search-results .result-row').remove();
  $('#ndb-search-results #state-row').show();
  $('#ndb-search-button').off('click').click(function() {
      let branded = $('#ndb-branded-checkbox').prop('checked');
      let searchString = $('#ndb-search-text').val();

      $('#ndb-search-results #state-row').html('<td>Loading...</td>');

      foodEditor.searchDatabase(searchString, branded, function(results, error) {
        console.log("Made it to the final callback.");
        if(error) {
          console.log("error is: " + error);
          $('#ndb-search-results #state-row').html('<td>' + error + '</td>');
        } else {
          console.log("No error.");
          $('#ndb-search-results #state-row').hide();
          $('#ndb-search-results .result-row').remove();
          Object.keys(results).forEach(function(ndbid) {
            console.log("Result row for ndbid: " + ndbid);
            let row = $('<tr class="result-row"></tr>');

            let nameCell = $('<td></td>');
            nameCell.append(results[ndbid].name);

            let addCell = $('<td></td>');
            let addButton = $('<button class="btn" type="button">Add</button>');
            addButton.click(function() {
              foodEditor.importFood(ndbid, function(error) {
                renderFoodEditor(foodEditor, doneCallback, error);
              });
            });
            addCell.append(addButton);

            row.append(nameCell);
            row.append(addCell);

            $('#ndb-search-results').append(row);
          });
        }
      });
  });

  $('#save-food-button').off('click').click(function() {
    let newNutrients = {};
    newNutrients["Calories"] = $('#calories-input').val();
    newNutrients["Total Fat"] = $('#fat-input').val();
    newNutrients["Saturated Fat"] = $('#saturated-fat-input').val();
    newNutrients["Trans Fat"] = $('#trans-fat-input').val();
    newNutrients["Cholesterol"] = $('#cholesterol-input').val();
    newNutrients["Sodium"] = $('#sodium-input').val();
    newNutrients["Total Carbohydrate"] = $('#carbohydrate-input').val();
    newNutrients["Dietary Fiber"] = $('#fiber-input').val();
    newNutrients["Total Sugars"] = $('#sugars-input').val();
    newNutrients["Added Sugars"] = $('#added-sugars-input').val();
    newNutrients["Protein"] = $('#protein-input').val();
    newNutrients["Calcium"] = $('#calcium-input').val();
    newNutrients["Iron"] = $('#iron-input').val();
    newNutrients["Potassium"] = $('#potassium-input').val();
    newNutrients["Vitamin D"] = $('#vitamin-d-input').val();
    foodEditor.setNutrients(newNutrients);

    foodEditor.setName($('#food-name-input').val());

    foodEditor.setServingSize($('#food-serving-size-input').val(),
        $('#food-serving-size-unit').val());

    foodEditor.save();
    doneCallback();
  });

  $('#edit-recipe-container').hide();
  $('#main-page-container').hide();
  $('#edit-food-container').show();
}

//TODO: this function
function setupSettings() {
  let settings = control.getSettings();
  $('#api-key-input').val(settings["apiKey"]);
  $('#api-key-input').change(function() {
    control.setSetting("apiKey", $('#api-key-input').val());
  });
}

function setupNutritionInfo() {
  $("#print-nutrition-button").click(function() {
    let nutritionHTML = "<link rel=\"stylesheet\" href=\"tabular-nutrition.css\"/>" + $("#nutrition-print-area").html();

    let window = new electron.remote.BrowserWindow({});
    window.loadURL("data:text/html," + nutritionHTML, {
      baseURLForDataURL: `file://${__dirname}/`
    });
    window.show();
  });
}


function showNutritionInfo(rid) {
  let nutritionInfo = control.getNutrition(rid);
  let ingredientString = control.ingredientString(rid);
  //unpack
  let nutrients = nutritionInfo.nutrients;
  let dailyValues = nutritionInfo.dailyValues;

  $('#nutrition-info-title').html(control.getRecipeName(rid));

  $('#serving-size').html(nutritionInfo.servingSize.amountInUnit(0) + "g");

  $("#calories").html(nutrients["Calories"]);
  $("#total-fat").html(nutrients["Total Fat"]);
  $("#sat-fat").html(nutrients["Saturated Fat"]);
  $("#trans-fat").html(nutrients["Trans Fat"]);
  $("#cholesterol").html(nutrients["Cholesterol"]);
  $("#sodium").html(nutrients["Sodium"]);
  $("#total-carb").html(nutrients["Total Carbohydrate"]);
  $("#dietary-fiber").html(nutrients["Dietary Fiber"]);
  $("#total-sugars").html(nutrients["Total Sugars"]);
  $("#added-sugars").html(nutrients["Added Sugars"]);
  $("#protein").html(nutrients["Protein"]);

  $("#total-fat-dv").html(dailyValues["Total Fat"]);
  $("#sat-fat-dv").html(dailyValues["Saturated Fat"]);
  $("#cholesterol-dv").html(dailyValues["Cholesterol"]);
  $("#sodium-dv").html(dailyValues["Sodium"]);
  $("#total-carb-dv").html(dailyValues["Total Carbohydrate"]);
  $("#dietary-fiber-dv").html(dailyValues["Dietary Fiber"]);
  $("#added-sugars-dv").html(dailyValues["Added Sugars"]);
  $("#vitamin-d-dv").html(dailyValues["Vitamin D"]);
  $("#calcium-dv").html(dailyValues["Calcium"]);
  $("#iron-dv").html(dailyValues["Iron"]);
  $("#potassium-dv").html(dailyValues["Potassium"]);

  $('#ingredient-string').html("Ingredients: " + ingredientString);
  $('#nutrition-info-modal').modal('show');
}


function populateUnitSelector(selector) {
  for(let i = 0; i < meas.UNITS_TABLE.length; i++) {
    selector.append('<option value="' + i + '" >' + meas.UNITS_TABLE[i].abbrev + '</option>');
  }
}

function populateUnitSelectors() {
  let unitSelectors = $('.unit-select');
  for(let i = 0; i < meas.UNITS_TABLE.length; i++) {
    unitSelectors.append('<option value="' + i + '" >' + meas.UNITS_TABLE[i].abbrev + '</option>');
  }

}


setup();
