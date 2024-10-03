(function (window, document, $, LZString) {
"use strict";

document.forms[0].reset();

// initialize input caches
$('input:not([type]), input[type="number"]').each(function () {
	this.type = "number";
	this.min = 0;
	this.parsedValue = Number(this.value) || 0;
});

// shorthand
function byId(id) {
	return document.getElementById(id);
}

function setInput(ele, val, callHandler) {
	if (ele.type === "checkbox") {
		ele.checked = val;
		return ele.checked;
	}

	val = Number(val) || 0;
	ele.value = val;
	ele.parsedValue = val;

	if (callHandler && ele.handler) {
		ele.handler();
	}
	return val;
}

function getMeta(metaData, name) {
	if (metaData && metaData.length) {
		for (var i = metaData.length - 1; i >= 0; i--) {
			var meta = metaData[i];
			if (name === meta.name) {
				return meta;
			}
		}
	}
	return null;
}

function getTriValue(value, stripe) {
	return (Math.sqrt(1 + 8 * value / stripe) - 1) / 2;
}

function darkFutureYears() {
	return currentYear - 40000;
}

var postfixes = [
	{limit: 1e210, divisor: 1e210, postfix: ["Q", " Quita"]},
	{limit:  1e42, divisor:  1e42, postfix: ["W", " Wololo"]},
	{limit:  1e39, divisor:  1e39, postfix: ["L", " Lotta"]},
	{limit:  1e36, divisor:  1e36, postfix: ["F", " Ferro"]},
	{limit:  1e33, divisor:  1e33, postfix: ["H", " Helo"]}, // or Ballard
	{limit:  1e30, divisor:  1e30, postfix: ["S", " Squilli"]},
	{limit:  1e27, divisor:  1e27, postfix: ["U", " Umpty"]},
	{limit:  1e24, divisor:  1e24, postfix: ["Y", " Yotta"]},
	{limit:  1e21, divisor:  1e21, postfix: ["Z", " Zeta"]},
	{limit:  1e18, divisor:  1e18, postfix: ["E", " Exa"]},
	{limit:  1e15, divisor:  1e15, postfix: ["P", " Peta"]},
	{limit:  1e12, divisor:  1e12, postfix: ["T", " Tera"]},
	{limit:   1e9, divisor:   1e9, postfix: ["G", " Giga"]},
	{limit:   1e6, divisor:   1e6, postfix: ["M", " Mega"]},
	{limit:   9e3, divisor:   1e3, postfix: ["K", " Kilo"]} // WHAT
];

var ticksPerSecond = 5;

function getDisplayValueExt(value, prefix, usePerTickHack, precision, postfix) {
	if (!value) { return "0"; }
	if (!isFinite(value)) {
		return getDisplayValue(value, prefix);
	}

	if (usePerTickHack) {
		usePerTickHack = byId("usePerSecondValues").checked;
	}
	if (usePerTickHack) {
		value = value * ticksPerSecond;
	}

	postfix = postfix || "";
	var absValue = Math.abs(value);
	for (var i = 0; i < postfixes.length; i++) {
		var p = postfixes[i];
		if (absValue >= p.limit) {
			if (usePerTickHack) { // Prevent recursive * gameRate;
				value = value / ticksPerSecond;
			}
			return getDisplayValueExt(value / p.divisor, prefix, usePerTickHack, precision, postfix + p.postfix[0]);
		}
	}

	return getDisplayValue(value, prefix, precision) + postfix + (usePerTickHack ? "/sec" : "");
}

function getDisplayValue(floatVal, plusPrefix, precision) {
	var plusSign = "+";
	if (floatVal <= 0 || !plusPrefix) {
		plusSign = "";
	}

	if (precision === undefined) {
		precision = byId("forceHighPrecision").checked ? 3 : 2;
	}

	var mantisa = "";
	if (Math.abs(floatVal) < Math.pow(10, -precision)) {
		mantisa = "(...)";
	}

	if (!floatVal.toFixed) {
		return plusSign + floatVal;
	}

	if (floatVal.toFixed() == floatVal) {
		var toFixed = floatVal.toFixed();
		return plusSign + toFixed;
	} else {
		toFixed = floatVal.toFixed(precision);
		return plusSign + toFixed + mantisa;
	}
}


function createCheckbox(text, className) {
	var label = $('<label><input type="checkbox"> ' + text + '</label>')[0];
	var cbox = label.children[0];
	if (className) {
		cbox.className = className;
	}
	return cbox;
}

function createInput(className, max) {
	var input = $('<input type="number" value="0" placeholder="0">')[0];
	if (className) {
		input.className = className;
	}
	input.parsedValue = 0;
	input.min = 0;

	if (!isNaN(max)) {
		input.max = max;
	}
	return input;
}

// function capitalize(str) {
// 	return str[0].toUpperCase() + str.slice(1);
// }

var globalEffectsCached = {};

var Cycles = [
	{
		name: "charon",
		title: "Charon",
		glyph: "&#9049;",
		uglyph: "⍙",
		effects: {
			// "entangler-gflopsConsumption": 2,
			// "moonOutpost-unobtainiumPerTickSpace": 0.9
		// },
		// festivalEffects: {
		// 	"catnip": 1.5,
		// 	"wood": 1.5,
		// 	"minerals": 1.5
		}
	}, {
		name: "umbra",
		title: "Umbra",
		glyph: "&#9062;",
		uglyph: "⍦",
		effects: {
			"hrHarvester-energyProduction": 1.5/* ,
			"planetCracker-uraniumPerTickSpace": 0.9,
			"hydrofracturer-oilPerTickAutoprodSpace": 0.75 */
		// },
		// festivalEffects: {
		// 	"coal": 1.5,
		// 	"iron": 1.5,
		// 	"titanium": 1.5,
		// 	"gold": 1.5
		}
	}, {
		name: "yarn",
		title: "Yarn",
		glyph: "&#9063;",
		uglyph: "⍧",
		effects: {
			// "hydroponics-catnipRatio": 2,
			// "researchVessel-starchartPerTickBaseSpace": 0.5
		// },
		// festivalEffects: {
		// 	"culture": 2
		}
	}, {
		name: "helios",
		title: "Helios",
		glyph: "&#8978;",
		uglyph: "⌒",
		effects: {
			"sunlifter-energyProduction": 1.5/* ,
			"cryostation-woodMax": 0.9,
			"cryostation-mineralsMax": 0.9,
			"cryostation-ironMax": 0.9,
			"cryostation-coalMax": 0.9,
			"cryostation-uraniumMax": 0.9,
			"cryostation-titaniumMax": 0.9,
			"cryostation-oilMax": 0.9,
			"cryostation-unobtainiumMax": 0.9 */
		// },
		// festivalEffects: {
		// 	"faith": 2,
		// 	"unicorns": 1.25
		}
	}, {
		name: "cath",
		title: "Cath",
		glyph: "&#9022;",
		uglyph: "⌾",
		effects: {
			// "spaceElevator-prodTransferBonus": 2,
			// "sattelite-starchartPerTickBaseSpace": 2,
			// "sattelite-observatoryRatio": 2,
			// "spaceStation-scienceRatio": 1.5,
			// "spaceBeacon-starchartPerTickBaseSpace": 0.1
		// },
		// festivalEffects: {
		// 	"manpower": 2
		}
	}, {
		name: "redmoon",
		title: "Redmoon",
		glyph: "&#9052;",
		uglyph: "⍜",
		effects: {
			// "moonOutpost-unobtainiumPerTickSpace": 1.2,
			// "entangler-gflopsConsumption": 0.5
		// },
		// festivalEffects: {
		// 	"unobtainium": 2
		}
	}, {
		name: "dune",
		title: "Dune",
		glyph: "&#9067;",
		uglyph: "⍫",
		effects: {
			// "planetCracker-uraniumPerTickSpace": 1.1,
			// "hydrofracturer-oilPerTickAutoprodSpace": 1.5,
			"hrHarvester-energyProduction": 0.75
		// },
		// festivalEffects: {
		// 	"uranium": 2
		}
	}, {
		name: "piscine",
		title: "Piscine",
		glyph: "&#9096;",
		uglyph: "⎈",
		effects: {
			// "researchVessel-starchartPerTickBaseSpace": 1.5,
			// "hydroponics-catnipRatio": 0.5
		// },
		// festivalEffects: {
		// 	"science": 2
		}
	}, {
		name: "terminus",
		title: "Terminus",
		glyph: "&#9053;",
		uglyph: "⍝",
		effects: {
			// "cryostation-woodMax": 1.2,
			// "cryostation-mineralsMax": 1.2,
			// "cryostation-ironMax": 1.2,
			// "cryostation-coalMax": 1.2,
			// "cryostation-uraniumMax": 1.2,
			// "cryostation-titaniumMax": 1.2,
			// "cryostation-oilMax": 1.2,
			// "cryostation-unobtainiumMax": 1.2,
			"sunlifter-energyProduction": 0.5
		// },
		// festivalEffects: {
		// 	"oil": 2
		}
	}, {
		name: "kairo",
		title: "Kairo",
		glyph: "&#8483;",
		uglyph: "℣",
		effects: {
			// "spaceBeacon-starchartPerTickBaseSpace": 5,
			// "spaceElevator-prodTransferBonus": 0.5,
			// "sattelite-starchartPerTickBaseSpace": 0.75,
			// "sattelite-observatoryRatio": 0.75,
			// "spaceStation-scienceRatio": 0.75
		// },
		// festivalEffects: {
		// 	"starchart": 5
		}
	}
];

var cycleOptions = "";
for (var i = 0; i < Cycles.length; i++) {
	var cycle = Cycles[i];
	cycleOptions += '<option value="' + i + '">' + cycle.glyph + " " + cycle.title + "</option>";
}
byId("cycleSel").innerHTML = cycleOptions;

function cycleEffectsBasics(baseEffects, building_name) {
	var effects = baseEffects;
	if (getMeta(Perks, "numerology").ownedNode.checked) {
		effects = {};
		var list_effects_cycle = Cycles[currentCycle].effects;

		for (var effect in baseEffects) {
			effects[effect] = baseEffects[effect];
			var effect_cycle = building_name + "-" + effect;
			if (typeof list_effects_cycle[effect_cycle] !== "undefined") {
				effects[effect] *= list_effects_cycle[effect_cycle];
			}
		}
	}

	return effects;
}


var Buildings = [
	{
		name: "pasture",
		stages: [
			{
				label: "Pasture",
				effects: {},
				disabled: true // meh
			}, {
				label: "Solar Farm",
				effects: {
					"energyProduction": 2
				}
			}
		],
		stage: 1,
		calculateEffects: function (self) {
			var effects = {};
			if (self.stage == 1) {
				effects["energyProduction"] = 2;
				effects["energyProduction"] *= 1 + getEffect("solarFarmRatio");
				if (currentSeason == 3) {
					effects["energyProduction"] *= 0.75;
				} else if (currentSeason == 1) {
					effects["energyProduction"] /= 0.75;
				}

				var seasonRatio = getEffect("solarFarmSeasonRatio");
				if ((currentSeason == 3 && seasonRatio == 1) || (currentSeason != 1 && seasonRatio == 2)) {
					effects["energyProduction"] *= 1 + 0.15 * seasonRatio;
				}
			}
			return effects;
		}
	}, {
		name: "aqueduct",
		stages: [
			{
				label: "Aqueduct",
				effects: {},
				disabled: true // meh
			}, {
				label: "Hydro Plant",
				effects: {
					"energyProduction": 5
				}
			}
		],
		stage: 1,
		calculateEffects: function (self) {
			var effects = {};
			if (self.stage == 1) {
				effects["energyProduction"] = 5;
				effects["energyProduction"] *= 1 + getEffect("hydroPlantRatio");
			}
			return effects;
		}
	}, {
		name: "library",
		stages: [
			{
				label: "Library",
				effects: {},
				disabled: true // meh
			}, {
				label: "Data Center",
				effects: {
					"energyConsumption": 2
				}
			}
		],
		stage: 1,
		calculateEffects: function (self) {
			var effects = {};
			if (self.stage == 1) {
				effects["energyConsumption"] = 2;
				if (getMeta(Upgrades, "cryocomputing").ownedNode.checked) {
					effects["energyConsumption"] = 1;
				}
			}
			return effects;
		}
	}, {
		name: "biolab",
		label: "Bio Lab",
		effects: {
			"energyConsumption": 0
		},
		calculateEffects: function () {
			var effects = {};
			if (getMeta(Upgrades, "biofuel").ownedNode.checked) {
				effects["energyConsumption"] = 1;
			}
			return effects;
		}
	}, {
		name: "calciner",
		label: "Calciner",
		effects: {
			"energyConsumption": 1
		}
	}, {
		name: "steamworks",
		label: "Steamworks",
		effects: {
			"energyProduction": 1
		}
	}, {
		name: "magneto",
		label: "Magneto",
		effects: {
			"energyProduction": 5
		}
	}, {
		name: "oilWell",
		label: "Oil Well",
		effects: {
			"energyConsumption": 0
		},
		calculateEffects: function (self) {
			var effects = {};
			if (self.isAutomationEnabled && getMeta(Upgrades, "pumpjack").ownedNode.checked) {
				effects["energyConsumption"] = 1;
			}
			return effects;
		},
		isAutomationEnabled: false
	}, {
		name: "factory",
		label: "Factory",
		effects: {
			"energyConsumption": 2
		},
	}, {
		name: "reactor",
		label: "Reactor",
		effects: {
			"energyProduction": 10
		},
		calculateEffects: function (self) {
			var effects = {
				"energyProduction": 10 * (1 + getEffect("reactorEnergyRatio"))
			};
			if (getMeta(Upgrades, "thoriumReactors").ownedNode.checked && !self.isAutomationEnabled) {
				effects["energyProduction"] -= 2.5;
			}
			return effects;
		},
		isAutomationEnabled: false
	}, {
		name: "accelerator",
		label: "Accelerator",
		effects: {
			"energyConsumption": 2
		}
	}, {
		name: "chronosphere",
		label: "Chronosphere",
		effects: {
			"energyConsumption": 20
		}
	}, {
		name: "aiCore",
		label: "AI Core",
		effects: {
			"energyConsumption": 2
		},
		calculateEffects: function (self) {
			// Core #1: 2   ; Total:  2  ; Average: 2    =  8/4 = (3*1+5)/4
			// Core #2: 3.5 ; Total:  5.5; Average: 2.75 = 11/4 = (3*2+5)/4
			// Core #3: 5   ; Total: 10.5; Average: 3.5  = 14/4 = (3*3+5)/4
			// Core #4: 6.5 ; Total: 17  ; Average: 4.25 = 17/4 = (3*4+5)/4
			// etc.
			return {
				"energyConsumption": (3 * self.ownedNode.parsedValue + 5) / 4
			};
		}
	}
];

function setStagedBuilding(bld, stage) {
	stage = Math.min(Math.max(stage, bld.minStage), bld.stages.length - 1) || bld.minStage;
	bld.stage = stage;

	bld.nameNode.textContent = bld.stages[stage].label || bld.name;
	if (bld.stageDownBtn) { bld.stageDownBtn.classList.toggle("hidden", stage === bld.minStage); }
	if (bld.stageUpBtn) { bld.stageUpBtn.classList.toggle("hidden", stage === bld.stages.length - 1); }

	if (bld.ownedNode.handler) {
		bld.ownedNode.handler();
	}
}

var node = byId("buildingsBlock");
var tr;
for (i = 0; i < Buildings.length; i++) {
	var bld = Buildings[i];

	tr = document.createElement("tr");

	node.appendChild(tr);

	bld.nameNode = document.createElement("td");
	bld.nameNode.textContent = bld.label || bld.name;

	tr.appendChild(bld.nameNode);

	var td = document.createElement("td");
	tr.appendChild(td);

	bld.ownedNode = createInput("building", 999);
	bld.ownedNode.metaObj = bld;
	td.appendChild(bld.ownedNode);

	if (typeof bld.isAutomationEnabled !== "undefined") {
		bld.isAutomationEnabledCheckbox = createCheckbox("Automation enabled");
		bld.isAutomationEnabledCheckbox.checked = bld.isAutomationEnabled;
		td.appendChild(bld.isAutomationEnabledCheckbox.parentNode);

		bld.isAutomationEnabledCheckbox.handler = function () {
			this.isAutomationEnabled = this.isAutomationEnabledCheckbox.checked;
		}.bind(bld);
	}

	if (bld.stages) {
		bld.minStage = 0;
		for (var j = 0; j < bld.stages.length; j++) {
			if (!bld.stages[j].disabled) {
				bld.minStage = j;
				break;
			}
		}
		setStagedBuilding(bld, bld.stage);
	}
}


var Religion = [
	{
		name: "darkNova",
		label: "Dark Nova",
		effects: {
			"energyProductionRatio": 0.02
		}
	}
];

node = byId("religionBlock");
for (i = 0; i < Religion.length; i++) {
	var r = Religion[i];

	tr = document.createElement("tr");
	node.appendChild(tr);

	r.nameNode = document.createElement("td");
	r.nameNode.textContent = r.label || r.name;
	tr.appendChild(r.nameNode);

	td = document.createElement("td");
	tr.appendChild(td);

	r.ownedNode = createInput("religion", 999);
	r.ownedNode.metaObj = r;
	td.appendChild(r.ownedNode);
}


var Upgrades = [
	{
		name: "photovoltaic",
		label: "Photovoltaic Cells",
		effects: {
			"solarFarmRatio": 0.5
		}
	}, {
		name: "thinFilm",
		label: "Thin Film Cells",
		effects: {
			"solarFarmSeasonRatio": 1
		}
	}, {
		name: "qdot",
		label: "Quantum Dot Cells",
		effects: {
			"solarFarmSeasonRatio": 1
		}
	}, {
		name: "solarSatellites",
		label: "Solar Satellites",
		effects: {}
	}, {
		name: "cryocomputing",
		label: "Cryocomputing",
		effects: {}
	}, {
		name: "hydroPlantTurbines",
		label: "Hydro Plant Turbines",
		effects: {
			"hydroPlantRatio": 0.15
		}
	}, {
		name: "amBases",
		label: "Antimatter Bases",
		effects: {}
	}, {
		name: "pumpjack",
		label: "Pumpjack",
		effects: {}
	}, {
		name: "biofuel",
		label: "Biofuel Processing",
		effects: {}
	}, {
		name: "coldFusion",
		label: "Cold Fusion",
		effects: {
			"reactorEnergyRatio": 0.25
		}
	}, {
		name: "thoriumReactors",
		label: "Thorium Reactors",
		effects: {
			"reactorEnergyRatio": 0.25
		}
	}
];

node = byId("workshopBlock");
for (i = 0; i < Upgrades.length; i++) {
	var upgrade = Upgrades[i];

	var div = document.createElement("div");
	upgrade.ownedNode = createCheckbox(upgrade.label || upgrade.name, "upgrade");
	div.appendChild(upgrade.ownedNode.parentNode);

	node.appendChild(div);
}


var Perks = [
	{
		name: "numerology",
		label: "Numerology",
		effects: {}
	/* }, {
		name: "numeromancy",
		label: "Numeromancy",
		effects: {} */
	}
];

node = byId("perksBlock");
for (i = 0; i < Perks.length; i++) {
	var perk = Perks[i];

	div = document.createElement("div");
	perk.ownedNode = createCheckbox(perk.label || perk.name, "perk");
	div.appendChild(perk.ownedNode.parentNode);

	if (perk.isHidden) {
		$(div).addClass("hidden");
	}

	node.appendChild(div);
}


var Programs = [
	{
		name: "sattelite",
		label: "Satellite",
		effects: {
			"energyConsumption": 1,
			"energyProduction": 0
		},
		calculateEffects: function () {
			var effects = {};
			if (getMeta(Upgrades, "solarSatellites").ownedNode.checked) {
				effects["energyProduction"] = 1;
			} else {
				effects["energyConsumption"] = 1;
			}
			return effects;
		}
	}, {
		name: "spaceStation",
		label: "Space Station",
		effects: {
			"energyConsumption": 10
		}
	}, {
		name: "moonOutpost",
		label: "Lunar Outpost",
		effects: {
			"energyConsumption": 5
		}
	}, {
		name: "moonBase",
		label: "Moon base",
		effects: {
			"energyConsumption": 10
		},
		calculateEffects: function () {
			return {
				"energyConsumption": getMeta(Upgrades, "amBases").ownedNode.checked ? 5 : 10
			};
		}
	}, {
		name: "orbitalArray",
		label: "Orbital Array",
		effects: {
			"energyConsumption": 20
		}
	}, {
		name: "sunlifter",
		label: "Sunlifter",
		effects: {
			"energyProduction": 30
		}
	}, {
		name: "containmentChamber",
		label: "Cont. Chamber",
		effects: {
			"energyConsumption": 50
		},
		calculateEffects: function () {
			return {
				"energyConsumption": 50 * (1 + getMeta(Programs, "heatsink").ownedNode.parsedValue * 0.01)
			};
		}
	}, {
		name: "heatsink",
		label: "Heatsink",
		effects: {},
	}, {
		name: "hrHarvester",
		label: "HR Harvester",
		effects: {
			"energyConsumption": 50
		},
		calculateEffects: function () {
			var yearBonus = darkFutureYears();
			if (yearBonus < 0) {
				yearBonus = 0;
			}

			return {
				"energyProduction": 1 * (1 + getTriValue(yearBonus, 0.075) * 0.01) *
					(1 + getEffect("umbraBoostRatio"))
			};
		}
	}, {
		name: "entangler",
		label: "Entanglement St.",
		effects: {
			"energyConsumption": 25
		}
	}, {
		name: "tectonic",
		label: "Tectonic",
		effects: {
			"energyProduction": 25
		},
		calculateEffects: function () {
			var moltenCore = getMeta(Programs, "moltenCore");
			return {
				// cannot use getEffect() because how calculations are summed
				"energyProduction": 25 * (1 + moltenCore.ownedNode.parsedValue * moltenCore.effects["tectonicBonus"])
			};
		}
	}, {
		name: "moltenCore",
		label: "Molten Core",
		effects: {
			"tectonicBonus": 0.05
		}
	}
];

node = byId("spaceBlock");
for (i = 0; i < Programs.length; i++) {
	var program = Programs[i];

	tr = document.createElement("tr");
	node.appendChild(tr);

	program.nameNode = document.createElement("td");
	program.nameNode.textContent = program.label || program.name;
	tr.appendChild(program.nameNode);

	td = document.createElement("td");
	tr.appendChild(td);

	program.ownedNode = createInput("program", 999);
	program.ownedNode.metaObj = program;
	td.appendChild(program.ownedNode);
}


var Time = [
	{
		name: "voidRift",
		label: "Void Rift",
		effects: {
			"umbraBoostRatio": 0.1
		}
	}, {
		name: "chronocontrol",
		label: "Chronocontrol",
		effects: {
			"energyConsumption": 15
		}
	}
];

node = byId("timeBlock");
for (i = 0; i < Time.length; i++) {
	var tu = Time[i];

	tr = byId(tu.name + "Row");
	if (!tr) {
		tr = document.createElement("tr");
		node.appendChild(tr);
	}
	// tu.nodeRow = tr;

	tu.nameNode = document.createElement("td");
	tu.nameNode.textContent = tu.label || tu.name;
	tr.appendChild(tu.nameNode);

	td = document.createElement("td");
	tr.appendChild(td);

	tu.ownedNode = createInput("timeUpgrade", 999);
	tu.ownedNode.metaObj = tu;
	td.appendChild(tu.ownedNode);
}


function countEffects(obj, effects, count, skipDoubleCons) {
	if (!isFinite(count)) {
		count = 1;
	}

	if (!effects) { return; }
	for (var effectName in effects) {
		var effect = effects[effectName] * count;
		if (energyChallengeActive && effectName === "energyConsumption" && !skipDoubleCons) {
			effect *= 2;
		}
		obj[effectName] = (obj[effectName] || 0) + effect;
	}
}


function cacheEffects() {
	globalEffectsCached = {};

	for (var i = Upgrades.length - 1; i >= 0; i--) {
		var upgrade = Upgrades[i];
		if (upgrade.ownedNode.checked && upgrade.effects) {
			countEffects(globalEffectsCached, upgrade.effects);
		}
	}

	// for (i = Perks.length - 1; i >= 0; i--) {
	// 	var perk = Perks[i];
	// 	if (perk.ownedNode.checked && perk.effects) {
	// 		countEffects(perk.effects);
	// 	}
	// }

	for (i = Time.length - 1; i >= 0; i--) {
		var tu = Time[i];
		if (tu.effects) {
			countEffects(globalEffectsCached, tu.effects, tu.ownedNode.value, true);
		}
	}

	for (i = Religion.length - 1; i >= 0; i--) {
		var r = Religion[i];
		if (r.effects) {
			countEffects(globalEffectsCached, r.effects, r.ownedNode.value);
		}
	}
}

// separate in case I do more calculations involving cycle/season changes, don't have to recalculate the stuff not dependent on those
// do have to watch out for stuff like moltenCores though
function calculateEnergy() {
	var energyEffects = {
		energyProd: getEffect("energyProduction"),
		energyCons: getEffect("energyConsumption")
	};

	for (var i = Buildings.length - 1; i >= 0; i--) {
		var bld = Buildings[i];
		if (!bld.ownedNode.parsedValue) {
			continue;
		}

		var bldEffects = bld.effects;
		if (bld.stages) {
			bldEffects = bld.stages[bld.stage].effects;
		}
		if (bld.calculateEffects) {
			bldEffects = bld.calculateEffects(bld);
		}

		countEffects(energyEffects, bldEffects, bld.ownedNode.parsedValue);
	}

	for (i = Programs.length - 1; i >= 0; i--) {
		var program = Programs[i];
		var programEffects = program.effects;
		if (program.calculateEffects) {
			programEffects = program.calculateEffects(program);
		}
		programEffects = cycleEffectsBasics(programEffects, program.name);
		countEffects(energyEffects, programEffects, program.ownedNode.value, program.name === "entangler");
	}

	var energyProd = energyEffects["energyProduction"] * (1 + getEffect("energyProductionRatio"));
	var energyCons = energyEffects["energyConsumption"];

	return {
		energyProd: energyProd,
		energyCons: energyCons,
		energyTotal: energyProd - energyCons
	};
}

function getEffect(effectName) {
	return Number(globalEffectsCached[effectName]) || 0;
}


var currentSeason = 0;
var currentYear = 0;
var currentCycle = 0;
var energyChallengeActive = false;


function calculate() {
	currentSeason = byId("season").selectedIndex;
	currentYear = byId("year").parsedValue;
	currentCycle = byId("cycleSel").value;
	energyChallengeActive = byId("energyChallengeActive").checked;

	cacheEffects();

	var currentEnergy = calculateEnergy();

	byId("energyProdCurrent").textContent = "+" + getDisplayValueExt(currentEnergy.energyProd) + "Wt";
	byId("energyConsCurrent").textContent = "-" + getDisplayValueExt(currentEnergy.energyCons) + "Wt";
	$("#energyTotalCurrent").html("&#9889;&nbsp;" + getDisplayValueExt(currentEnergy.energyTotal) + "Wt")
		.toggleClass("green", currentEnergy.energyTotal >= 0)
		.toggleClass("red", currentEnergy.energyTotal < 0);
}


// event management
$(document).on("input", 'input:not([type="checkbox"])', function () {
	var value = this.classList.contains("deci") ? parseFloat(this.value) : parseInt(this.value, 10);

	value = Math.max(value, this.minValue || 0) || 0;
	if (this.parsedValue !== value) {
		this.parsedValue = value;
		if (this.handler) { this.handler(); }
		calculate();
	}

})
.on("change", "select", function () {
	calculate();

})
.on("click", 'input[type="checkbox"]:not(.collapser)', function () {
	if (this.handler) { this.handler(); }
	calculate();
});

$("#showImport").click(function () {
	$("#importDiv").removeClass("hidden");
	$("#importError").addClass("hidden");
	byId("importData").value = "";
	byId("importData").focus();
});

$("#importCancel").click(function () {
	$("#importDiv").addClass("hidden");
});


function loadMetadata(saveArr, metaArr, inputKey, handler) {
	if (!saveArr || !saveArr.length || !metaArr || (!inputKey && !handler)) {
		return;
	}

	for (var i = saveArr.length - 1; i >= 0; i--) {
		var saveMeta = saveArr[i];

		var meta = getMeta(metaArr, saveMeta.name);
		if (meta && inputKey && meta.ownedNode) {
			setInput(meta.ownedNode, saveMeta[inputKey]);
		}
		if (handler) {
			handler(saveMeta, meta);
		}
	}
}

function resetForm() {
	document.forms[0].reset();
	$('input[type="number"]').each(function () {
		this.parsedValue = 0;
	});
}

// import save data
$("#importOK").click(function () {
	var data = byId("importData").value.replace(/\s/g, "");
	if (!data) { return; }
	if (!confirm("Are you sure you want to import?")) { return; }

	var resetOnError = false;

	try {
		var json = LZString.decompressFromBase64(data) || atob(data);
		if (!json) {
			throw new Error("Save data not found");
		}
		var saveData = JSON.parse(json);
		if (!saveData) {
			throw new Error("Save data not found");
		}
		byId("importDiv").classList.add("hidden");

		resetForm();
		resetOnError = true;

		for (var i = Buildings.length - 1; i >= 0; i--) {
			var bld = Buildings[i];
			if (bld.stages) {
				setStagedBuilding(bld, 0);
			}
		}

		if (saveData.calendar) {
			setInput(byId("year"), saveData.calendar.year);
			setInput(byId("season"), saveData.calendar.season);
			if (Cycles[saveData.calendar.cycle]) {
				byId("cycleSel").value = saveData.calendar.cycle;
			}
		}

		if (saveData.challenges && saveData.challenges.currentChallenge === "energy") {
			byId("energyChallengeActive").checked = true;
		}

		if (saveData.workshop) {
			loadMetadata(saveData.workshop.upgrades, Upgrades, "researched");
		}

		if (saveData.prestige) {
			loadMetadata(saveData.prestige.perks, Perks, "researched");
		}

		if (saveData.religion) {
			// loadMetadata(saveData.religion.zu, Religion, "on");
			// loadMetadata(saveData.religion.ru, Religion, "on");
			loadMetadata(saveData.religion.tu, Religion, "on");
		}

		if (saveData.space) {
			for (i = saveData.space.planets.length - 1; i >= 0; i--) {
				loadMetadata(saveData.space.planets[i].buildings, Programs, "on");
			}
		}

		if (saveData.time) {
			loadMetadata(saveData.time.cfu, Time, "on");
			loadMetadata(saveData.time.vsu, Time, "on");
		}

		if (saveData.buildings) {
			for (i = saveData.buildings.length - 1; i >= 0; i--) {
				var saveBld = saveData.buildings[i];

				bld = getMeta(Buildings, saveBld.name);
				if (bld) {
					var value = 0;
					if (bld.stages) {
						setStagedBuilding(bld, saveBld.stage);
						if (saveBld.stage == bld.stage) {
							value = saveBld.on;
						}

					} else {
						value = saveBld.on;
					}
					setInput(bld.ownedNode, value);

					if (typeof bld.isAutomationEnabled !== "undefined") {
						bld.isAutomationEnabled = Boolean(saveBld.isAutomationEnabled);
						bld.isAutomationEnabledCheckbox.checked = bld.isAutomationEnabled;
					}
				}
			}
		}

		var saveGame = saveData.game || {};

		if (saveGame.opts) {
			// byId("usePerSecondValues").checked = saveGame.opts.usePerSecondValues;
			byId("forceHighPrecision").checked = saveGame.opts.forceHighPrecision;
		}

	} catch (err) {
		$("#importError").removeClass("hidden");
		if (resetOnError) {
			resetForm();
		}
		throw err;

	} finally {
		calculate();
	}
});


calculate();

document.forms[0].classList.remove("hidden");
document.body.removeChild(document.getElementById("load"));

})(this, this.document, this.jQuery, this.LZString);
