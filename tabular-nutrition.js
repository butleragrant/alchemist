const nut = require('./nutrition.js');
const electron = require('electron');
const fs = require('fs');

function setup() {
  let hash = location.hash.replace(/^.*#/, '');
  console.log(hash);

  let nutrientData = JSON.parse(hash);

  let roundedNutrientData = {};
  for(let fieldName in nutrientData) {
    if(nutrientData.hasOwnProperty(fieldName)) {
      if(nutrientData[fieldName] < 1 && nutrientData[fieldName] > 0) {
        roundedNutrientData[fieldName] = nutrientData[fieldName].toFixed(1);
      } else {
        roundedNutrientData[fieldName] = nutrientData[fieldName].toFixed(0);
      }

    }
  }

  let nutrientPercentDV = {};
  for(let nutrientId in nut.nutrientList) {
    if(nut.nutrientList.hasOwnProperty(nutrientId) && nut.nutrientList[nutrientId].dv > 0) {
      nutrientPercentDV[nutrientId] = (100 * nutrientData[nutrientId] /
        nut.nutrientList[nutrientId].dv).toFixed(0);
    }
  }

  document.getElementById("serving-size").innerHTML = "" +
    roundedNutrientData.servingSize + "g";
  document.getElementById("calories").innerHTML = roundedNutrientData[208];
  document.getElementById("total-fat").innerHTML = roundedNutrientData[204];
  document.getElementById("sat-fat").innerHTML = roundedNutrientData[606];
  document.getElementById("trans-fat").innerHTML = roundedNutrientData[605];
  document.getElementById("cholesterol").innerHTML = roundedNutrientData[601];
  document.getElementById("sodium").innerHTML = roundedNutrientData[307];
  document.getElementById("total-carb").innerHTML = roundedNutrientData[205];
  document.getElementById("dietary-fiber").innerHTML = roundedNutrientData[291];
  document.getElementById("total-sugars").innerHTML = roundedNutrientData[269];
  document.getElementById("added-sugars").innerHTML = roundedNutrientData[0];
  document.getElementById("protein").innerHTML = roundedNutrientData[203];

  document.getElementById("total-fat-dv").innerHTML = nutrientPercentDV[204];
  document.getElementById("sat-fat-dv").innerHTML = nutrientPercentDV[606];
  document.getElementById("cholesterol-dv").innerHTML = nutrientPercentDV[601];
  document.getElementById("sodium-dv").innerHTML = nutrientPercentDV[307];
  document.getElementById("total-carb-dv").innerHTML = nutrientPercentDV[205];
  document.getElementById("dietary-fiber-dv").innerHTML = nutrientPercentDV[291];
  document.getElementById("added-sugars-dv").innerHTML = nutrientPercentDV[0];
  document.getElementById("vitamin-d-dv").innerHTML = nutrientPercentDV[328];
  document.getElementById("calcium-dv").innerHTML = nutrientPercentDV[301];
  document.getElementById("iron-dv").innerHTML = nutrientPercentDV[303];
  document.getElementById("potassium-dv").innerHTML = nutrientPercentDV[306];

  document.getElementById("print-button").addEventListener("click", function() {
    document.getElementById("print-area").style.display = "none";
    let thisBrowserWindow = electron.remote.getCurrentWindow();
    let webContents = electron.remote.getCurrentWebContents();
    electron.remote.dialog.showSaveDialog(thisBrowserWindow, {}, function(filename) {
      webContents.printToPDF({landscape: true}, function(error, pdf) {
        document.getElementById("print-area").style.display = "block";
        if(error) {
          throw error;
        } else {
          fs.writeFile(filename, pdf, function(error) {
            if(error) {
              throw error;
            } else {
              console.log("Saving Complete");
            }
          })
        }
      })
    });
  });
}

setup();
