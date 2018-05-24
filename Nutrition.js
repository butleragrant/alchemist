const NUTRIENT_LIST = {
  "Added Sugars": {
    dv: 50,
    unit: "g",
    ndbId: -1
  },
  "Calcium": {
    dv: 1300,
    unit: "mg",
    ndbId: 301
  },
  "Cholesterol": {
    dv: 300,
    unit: "mg",
    ndbId: 601
  },
  "Dietary Fiber": {
    dv: 25,
    unit: "g",
    ndbId: 291
  },
  "Calories": {
    dv: 2000,
    unit: "kcal",
    ndbId: 208
  },
  "Iron": {
    dv: 18,
    unit: "mg",
    ndbId: 303
  },
  "Potassium": {
    dv: 3500,
    unit: "mg",
    ndbId: 306
  },
  "Protein": {
    dv: 50,
    unit: "g",
    ndbId: 203
  },
  "Saturated Fat": {
    dv: 20,
    unit: "g",
    ndbId: 606
  },
  "Sodium": {
    dv: 2400,
    unit: "mg",
    ndbId: 307
  },
  "Total Carbohydrate": {
    dv: 300,
    unit: "g",
    ndbId: 205
  },
  "Total Fat": {
    dv: 65,
    unit: "g",
    ndbId: 204
  },
  "Total Sugars": {
    dv: 0,
    unit: "g",
    ndbId: 269
  },
  "Trans Fat": {
    dv: 0,
    unit: "g",
    ndbId: 605
  },
  "Vitamin D": {
    dv: 10,
    unit: "\u00b5g",
    ndbId: 328
  }
};

function roundNutrients(nutrients) {
  let roundedNutrients = {};
  //Calories:
  if(nutrients["Calories"] < 5) {
    roundedNutrients["Calories"] = 0;
  } else if(nutrients["Calories"] <= 50) {
    roundedNutrients["Calories"] = Math.round(nutrients["Calories"] / 5.0) * 5;
  } else {
    roundedNutrients["Calories"] = Math.round(nutrients["Calories"] / 10.0) * 10;
  }

  //Total Fat:
  if(nutrients["Total Fat"] < 0.5) {
    roundedNutrients["Total Fat"] = 0;
  } else if(nutrients["Total Fat"] < 5) {
    roundedNutrients["Total Fat"] = Math.round(nutrients["Total Fat"] / 0.5) * 0.5;
  } else {
    roundedNutrients["Total Fat"] = Math.round(nutrients["Total Fat"]);
  }

  //Saturated Fat
  if(nutrients["Saturated Fat"] < 0.5) {
    roundedNutrients["Saturated Fat"] = 0;
  } else if(nutrients["Saturated Fat"] < 5) {
    roundedNutrients["Saturated Fat"] = Math.round(nutrients["Saturated Fat"] / 0.5) * 0.5;
  } else {
    roundedNutrients["Saturated Fat"] = Math.round(nutrients["Saturated Fat"]);
  }

  //Trans Fat
  if(nutrients["Trans Fat"] < 0.5) {
    roundedNutrients["Trans Fat"] = 0;
  } else if(nutrients["Trans Fat"] < 5) {
    roundedNutrients["Trans Fat"] = Math.round(nutrients["Trans Fat"] / 0.5) * 0.5;
  } else {
    roundedNutrients["Trans Fat"] = Math.round(nutrients["Trans Fat"]);
  }

  //cholesterol
  if(nutrients["Cholesterol"] < 2) {
    roundedNutrients["Cholesterol"] = 0;
  } else if(nutrients["Cholesterol"] <= 5) {
    roundedNutrients["Cholesterol"] = "less than 5";
  } else {
    roundedNutrients["Cholesterol"] = Math.round(nutrients["Cholesterol"] / 5.0) * 5;
  }

  //Sodium
  if(nutrients["Sodium"] < 5) {
    roundedNutrients["Sodium"] = 0;
  } else if(nutrients["Sodium"] <= 140) {
    roundedNutrients["Sodium"] = Math.round(nutrients["Sodium"] / 5.0) * 5;
  } else {
    roundedNutrients["Sodium"] = Math.round(nutrients["Sodium"] / 10.0) * 10;
  }

  //Potassium
  if(nutrients["Potassium"] < 5) {
    roundedNutrients["Potassium"] = 0;
  } else if(nutrients["Potassium"] <= 140) {
    roundedNutrients["Potassium"] = Math.round(nutrients["Potassium"] / 5.0) * 5;
  } else {
    roundedNutrients["Potassium"] = Math.round(nutrients["Potassium"] / 10.0) * 10;
  }

  //Total Carbohydrate:
  if(nutrients["Total Carbohydrate"] < 0.5) {
    roundedNutrients["Total Carbohydrate"] = 0;
  } else if(nutrients["Total Carbohydrate"] < 1) {
    roundedNutrients["Total Carbohydrate"] = "less than 1";
  } else {
    roundedNutrients["Total Carbohydrate"] = Math.round(nutrients["Total Carbohydrate"]);
  }

  //Dietary Fiber:
  if(nutrients["Dietary Fiber"] < 0.5) {
    roundedNutrients["Dietary Fiber"] = 0;
  } else if(nutrients["Dietary Fiber"] < 1) {
    roundedNutrients["Dietary Fiber"] = "less than 1";
  } else {
    roundedNutrients["Dietary Fiber"] = Math.round(nutrients["Dietary Fiber"]);
  }

  //Sugars:
  if(nutrients["Total Sugars"] < 0.5) {
    roundedNutrients["Total Sugars"] = 0;
  } else if(nutrients["Total Sugars"] < 1) {
    roundedNutrients["Total Sugars"] = "less than 1";
  } else {
    roundedNutrients["Total Sugars"] = Math.round(nutrients["Total Sugars"]);
  }

  //Added Sugars:
  if(nutrients["Added Sugars"] < 0.5) {
    roundedNutrients["Added Sugars"] = 0;
  } else if(nutrients["Added Sugars"] < 1) {
    roundedNutrients["Added Sugars"] = "less than 1";
  } else {
    roundedNutrients["Added Sugars"] = Math.round(nutrients["Added Sugars"]);
  }

  //Protein:
  if(nutrients["Protein"] < 0.5) {
    roundedNutrients["Protein"] = 0;
  } else if(nutrients["Protein"] < 1) {
    roundedNutrients["Protein"] = "less than 1";
  } else {
    roundedNutrients["Protein"] = Math.round(nutrients["Protein"]);
  }

  //Iron, calcium. vitamin D
  roundedNutrients["Iron"] = Math.round(nutrients["Iron"]);
  roundedNutrients["Calcium"] = Math.round(nutrients["Calcium"]);
  roundedNutrients["Vitamin D"] = Math.round(nutrients["Vitamin D"]);

  return roundedNutrients;
}

function dailyValues(nutrients) {
  let dailyValues = {};
  Object.keys(nutrients).forEach(function(nutrient) {
    if(NUTRIENT_LIST[nutrient].dv > 0) {
      dailyValues[nutrient] = Math.round((nutrients[nutrient] * 100.0) / NUTRIENT_LIST[nutrient].dv);
    } else {
      dailyValues[nutrient] = NaN;
    }
  });

  return dailyValues;
}


module.exports = {
  NUTRIENT_LIST,
  roundNutrients,
  dailyValues
};
