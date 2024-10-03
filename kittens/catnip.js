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

// Kittens Game methods
function rand(n) {
	return Math.floor(Math.random() * n);
}

function getHyperbolicEffect(effect, limit) {
	var absEffect = Math.abs(effect);
	var maxUndiminished = 0.75 * limit; // first 75% is free from diminishing returns
	if (absEffect <= maxUndiminished) {
		// Not high enough for diminishing returns to apply
		return effect;
	}

	var diminishedPortion = absEffect - maxUndiminished;
	var delta = 0.25 * limit; // Lower values will approach 1 more quickly.

	// The last 25% will approach .25 but cannot actually reach it
	var diminishedEffect = (1 - (delta / (diminishedPortion + delta))) * 0.25 * limit;
	var totalEffect = maxUndiminished + diminishedEffect;

	return effect < 0 ? -totalEffect : totalEffect;
}

function getTriValue(value, stripe) {
	return (Math.sqrt(1 + 8 * value / stripe) - 1) / 2;
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

function skillToText(value) {
	if (value >= 9000) { return "Master"; }
	if (value >= 5000) { return "Proficient"; }
	if (value >= 2500) { return "Skilled"; }
	if (value >= 1200) { return "Competent"; }
	if (value >= 500)  { return "Adequate"; }
	if (value >= 100)  { return "Novice"; }
	return "Dabbling";
}
// end KG methods


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

function getValue(node) {
	var value = 0;
	if (node.type === "checkbox") {
		value = node.checked;
	} else {
		value = node.parsedValue;
	}
	return Number(value) || 0;
}

function getMetaValue(meta) {
	var value = 0;
	if (meta && meta.ownedNode) {
		value = getValue(meta.ownedNode);
	}
	return value;
}

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

var globalEffectsCached = {};
var globalEffectNames = {};

function registerEffectNames(effects) {
	if (effects) {
		for (var effectName in effects) {
			globalEffectNames[effectName] = true;
		}
	}
}


var Cycles = [
	{
		name: "charon",
		title: "Charon",
		glyph: "&#9049;",
		uglyph: "⍙",
		effects: {
			// "entangler-gflopsConsumption": 2,
			// "moonOutpost-unobtainiumPerTickSpace": 0.9
		},
		festivalEffects: {
			"catnip": 1.5/* ,
			"wood": 1.5,
			"minerals": 1.5 */
		}
	}, {
		name: "umbra",
		title: "Umbra",
		glyph: "&#9062;",
		uglyph: "⍦",
		effects: {
			// "hrHarvester-energyProduction": 1.5,
			// "planetCracker-uraniumPerTickSpace": 0.9,
			// "hydrofracturer-oilPerTickAutoprodSpace": 0.75
		},
		festivalEffects: {
			// "coal": 1.5,
			// "iron": 1.5,
			// "titanium": 1.5,
			// "gold": 1.5
		}
	}, {
		name: "yarn",
		title: "Yarn",
		glyph: "&#9063;",
		uglyph: "⍧",
		effects: {
			"hydroponics-catnipRatio": 2,
			// "researchVessel-starchartPerTickBaseSpace": 0.5
		},
		festivalEffects: {
			// "culture": 2
		}
	}, {
		name: "helios",
		title: "Helios",
		glyph: "&#8978;",
		uglyph: "⌒",
		effects: {
			// "sunlifter-energyProduction": 1.5,
			// "cryostation-woodMax": 0.9,
			// "cryostation-mineralsMax": 0.9,
			// "cryostation-ironMax": 0.9,
			// "cryostation-coalMax": 0.9,
			// "cryostation-uraniumMax": 0.9,
			// "cryostation-titaniumMax": 0.9,
			// "cryostation-oilMax": 0.9,
			// "cryostation-unobtainiumMax": 0.9
		},
		festivalEffects: {
			// "faith": 2,
			// "unicorns": 1.25
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
		},
		festivalEffects: {
			// "manpower": 2
		}
	}, {
		name: "redmoon",
		title: "Redmoon",
		glyph: "&#9052;",
		uglyph: "⍜",
		effects: {
			// "moonOutpost-unobtainiumPerTickSpace": 1.2,
			// "entangler-gflopsConsumption": 0.5
		},
		festivalEffects: {
			// "unobtainium": 2
		}
	}, {
		name: "dune",
		title: "Dune",
		glyph: "&#9067;",
		uglyph: "⍫",
		effects: {
			// "planetCracker-uraniumPerTickSpace": 1.1,
			// "hydrofracturer-oilPerTickAutoprodSpace": 1.5,
			// "hrHarvester-energyProduction": 0.75
		},
		festivalEffects: {
			// "uranium": 2
		}
	}, {
		name: "piscine",
		title: "Piscine",
		glyph: "&#9096;",
		uglyph: "⎈",
		effects: {
			// "researchVessel-starchartPerTickBaseSpace": 1.5,
			"hydroponics-catnipRatio": 0.5
		},
		festivalEffects: {
			// "science": 2
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
			// "sunlifter-energyProduction": 0.5
		},
		festivalEffects: {
			// "oil": 2
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
		},
		festivalEffects: {
			// "starchart": 5
		}
	}
];

var currentCycle = 0;

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

function cycleEffectsFestival(effects) {
	if (getMeta(Perks, "numeromancy").ownedNode.checked && byId("festival").checked) {
		var list_festivalEffects_cycle = Cycles[currentCycle].festivalEffects;

		for (var effect in effects) {
			var effect_cycle = effect;
			if (typeof list_festivalEffects_cycle[effect_cycle] !== "undefined") {
				effects[effect] *= list_festivalEffects_cycle[effect_cycle];
			}
		}
	}

	return effects;
}


var Resources = [
	{
		name: "catnip",
		type: "common"
	}, {
		name: "kittens",
		type: "common",
		ownedNode: byId("numKittens")
	}, {
		name: "furs",
		type: "uncommon"
	}, {
		name: "ivory",
		type: "uncommon"
	}, {
		name: "spice",
		type: "uncommon"
	}, {
		name: "unicorns",
		type: "rare"
	}, {
		name: "alicorn",
		title: "alicorns",
		type: "rare"
	}, {
		name: "necrocorn",
		title: "necrocorns",
		type: "rare"
	}, {
		name: "tears",
		type: "rare"
	}, {
		name: "karma",
		type: "rare",
		ownedNode: byId("karma")
	}, {
		name: "paragon",
		type: "common",
		ownedNode: byId("paragon")
	}, {
		name: "burnedParagon",
		title: "burned paragon",
		type: "common",
		ownedNode: byId("burnedParagon")
	}, {
		name: "relic",
		title: "relic",
		type: "exotic"
	}, {
		name: "void",
		title: "void",
		type: "exotic"
	}, {
		name: "elderBox",
		title: "present box",
		type: "exotic"
	}, {
		name: "wrappingPaper",
		title: "wrapping paper",
		type: "exotic"
	}, {
		name: "blackcoin",
		title: "blackcoin",
		type: "exotic"
	}, {
		name: "bloodstone",
		title: "bloodstone",
		type: "exotic"
	}
];

var node = byId("rareResources");
for (i = 0; i < Resources.length; i++) {
	var res = Resources[i];
	if (res.type !== "common" && !res.ownedNode) {
		res.ownedNode = createCheckbox(capitalize(res.title || res.name), "resource rare");
		node.appendChild(res.ownedNode.parentNode);
		node.appendChild(document.createTextNode(" "));
	}
}


var Buildings = [
	{
		name: "field",
		label: "Catnip field",
		effects: {
			"catnipPerTickBase": 0.125
		}
	}, {
		name: "pasture",
		stages: [
			{
				label: "Pasture",
				effects: {
					"catnipDemandRatio": -0.005
				}
			}
		], // don't care about solar farms
		stage: 0
	}, {
		name: "aqueduct",
		stages: [
			{
				label: "Aqueduct",
				effects: {
					"catnipRatio": 0.03
				}
			}
		], // don't care about hydro dams
		stage: 0
	}, {
		name: "hut",
		label: "Hut",
		effects: {
			"maxKittens": 2
		}
	}, {
		name: "logHouse",
		label: "Log House",
		effects: {
			"maxKittens": 1
		}
	}, {
		name: "mansion",
		label: "Mansion",
		effects: {
			"maxKittens": 1
		}
	}, {
		name: "biolab",
		label: "Bio Lab",
		effects: {},
		calculateEffects: function () {
			var effects = {};
			if (getMeta(Upgrades, "biofuel").ownedNode.checked) {
				effects = {
				"catnipPerTickCon": -1
				};
			}
			return effects;
		},
	}, {
		name: "amphitheatre",
		stages: [
			{
				label: "Amphitheatre",
				effects: {
					"unhappinessRatio": -0.048
				}
			}, {
				label: "Broadcast Tower",
				effects: {
					"unhappinessRatio": -0.75
				}
			}
		],
		stage: 0
	}, {
		name: "temple",
		label: "Temple",
		effects: {
			"happiness": 0
		},
		calculateEffects: function () {
			var effects = {
				"happiness": 0
			};
			var sunAltar = getMeta(Religion, "sunAltar");
			if (sunAltar.ownedNode.parsedValue > 0) {
				effects["happiness"] = 0.4 + 0.1 * sunAltar.ownedNode.parsedValue;
			}
			return effects;
		}
	}, {
		name: "unicornPasture",
		label: "Unic. Pasture",
		effects: {
			"catnipDemandRatio": -0.0015
		}
	}
];

function setStagedBuilding(bld, stage) {
	if (stage >= 0 && stage <= bld.stages.length - 1) {
		bld.stage = stage;
	}

	stage = bld.stage;

	bld.nameNode.textContent = bld.stages[stage].label || bld.name;
	bld.stageDownBtn.classList.toggle("hidden", stage === 0);
	bld.stageUpBtn.classList.toggle("hidden", stage === bld.stages.length - 1);

	if (bld.ownedNode.handler) {
		bld.ownedNode.handler();
	}
}

node = byId("buildingsBlock");
var tr;
for (i = 0; i < Buildings.length; i++) {
	var bld = Buildings[i];

	if (i % 2 === 0) {
		tr = document.createElement("tr");
		node.appendChild(tr);
	}

	bld.nameNode = document.createElement("td");
	bld.nameNode.textContent = bld.label || bld.name;
	tr.appendChild(bld.nameNode);

	var td = document.createElement("td");
	tr.appendChild(td);

	bld.ownedNode = createInput("building", 999);
	bld.ownedNode.metaObj = bld;
	td.appendChild(bld.ownedNode);

	registerEffectNames(bld.effects);

	if (bld.stages) {
		td.appendChild(document.createTextNode(" "));

		bld.stageDownBtn = document.createElement("input");
		bld.stageDownBtn.type = "button";
		bld.stageDownBtn.value = "V";
		bld.stageDownBtn.metaObj = bld;
		td.appendChild(bld.stageDownBtn);

		bld.stageUpBtn = document.createElement("input");
		bld.stageUpBtn.type = "button";
		bld.stageUpBtn.value = "^";
		bld.stageUpBtn.metaObj = bld;
		td.appendChild(bld.stageUpBtn);

		setStagedBuilding(bld);

		for (var j = bld.stages.length - 1; j >= 0; j--) {
			registerEffectNames(bld.stages[j].effects);
		}
	}
}


var Religion = [
	{
		name: "sunAltar",
		label: "Sun Altar",
		effects: {}
	}, {
		name: "blackObelisk",
		label: "Black Obelisk",
		effects: {}
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

	registerEffectNames(r.effects);
}


var Upgrades = [
	{
		name: "mineralHoes",
		label: "Mineral Hoes",
		effects: {
			"catnipJobRatio": 0.5
		}
	}, {
		name: "ironHoes",
		label: "Iron Hoes",
		effects: {
			"catnipJobRatio": 0.3
		}
	}, {
		name: "biofuel",
		label: "Biofuel processing",
		effects: {}
	}, {
		name: "logistics",
		label: "Logistics",
		effects: {
			"skillMultiplier": 0.15
		}
	}, {
		name: "augumentation",
		label: "Augmentations",
		effects: {
			"skillMultiplier": 1
		}
	}, {
		name: "assistance",
		label: "Robotic Assistance",
		effects: {
			"catnipDemandWorkerRatioGlobal": -0.25
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

	registerEffectNames(upgrade.effects);
}


var Perks = [
	{
		name: "numerology",
		label: "Numerology",
		effects: {}
	}, {
		name: "numeromancy",
		label: "Numeromancy",
		effects: {}
	}, {
		name: "malkuth",
		label: "Malkuth",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "yesod",
		label: "Yesod",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "hod",
		label: "Hod",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "netzach",
		label: "Netzach",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "tiferet",
		label: "Tiferet",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "gevurah",
		label: "Gevurah",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "chesed",
		label: "Chesed",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "binah",
		label: "Binah",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "chokhmah",
		label: "Chokhmah",
		effects: {
			"paragonRatio": 0.05
		}
	}, {
		name: "keter",
		label: "Keter",
		effects: {
			"paragonRatio": 0.05
		}
	}
];

node = byId("perksBlock");
for (i = 0; i < Perks.length; i++) {
	var perk = Perks[i];

	div = document.createElement("div");
	perk.ownedNode = createCheckbox(perk.label || perk.name, "perk");
	div.appendChild(perk.ownedNode.parentNode);

	node.appendChild(div);

	registerEffectNames(perk.effects);
}


var Programs = [
	{
		name: "spaceStation",
		label: "Space Station",
		effects: {
			"maxKittens": 2
		}
	}, {
		name: "terraformingStation",
		label: "Terraforming Station",
		effects: {
			"maxKittens": 1
		}
	}, {
		name: "hydroponics",
		label: "Hydroponics",
		effects: {
			"catnipRatio": 0.025
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

	registerEffectNames(program.effects);
}


var Time = [
	{
		name: "cryochambers",
		label: "Cryochambers",
		effects: {
			"maxKittens": 1
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

	registerEffectNames(tu.effects);
}


var Seasons = [
	{
		name: "spring",
		modifier: 1.5
	}, {
		name: "summer",
		modifier: 1
	}, {
		name: "autumn",
		row: null,
		modifier: 1
	}, {
		name: "winter",
		modifier: 0.25
	}
];

var AverageSeason = {
	normal: 0,
	winterIsComingDone: 0
};

function avgSeason(season, winterIsComingDone) {
	var seasonMod = season.modifier;
	var weatherChance = 0.35; // 35% chance of warm/cold seasons, ignoring the requirement of year >= 3
	var warmChance = 0.5; // 50% chance of warm weather
	if (winterIsComingDone) {
		warmChance += 0.15; // +15% chance of warm weather
	}

	return ((1 - weatherChance) * seasonMod + weatherChance * (warmChance * (seasonMod + 0.15) + (1 - warmChance) * (seasonMod - 0.15)));
}


for (i = 0; i < Seasons.length; i++) {
	var s = Seasons[i];
	s.row = byId(s.name + "Row");
	s.average = {
		normal: avgSeason(s, false),
		winterIsComingDone: avgSeason(s, true)
	};
	AverageSeason.normal += s.average.normal;
	AverageSeason.winterIsComingDone += s.average.winterIsComingDone;
}

AverageSeason.normal /= Seasons.length;
AverageSeason.winterIsComingDone /= Seasons.length;


var Jobs = [
	{
		name: "farmer",
		title: "Farmer",
		modifiers: {
			"catnip": 1
		}
	}
];

/* eslint-disable array-element-newline */
var names = ["Angel", "Charlie", "Mittens", "Oreo", "Lily", "Ellie", "Amber", "Molly", "Jasper",
	"Oscar", "Theo", "Maddie", "Cassie", "Timber", "Meeko", "Micha", "Tami", "Plato"];
var surnames = ["Smoke", "Dust", "Chalk", "Fur", "Clay", "Paws", "Tails", "Sand", "Scratch", "Berry", "Shadow"];
/* eslint-enable array-element-newline */

var skillMults = {
	Dabbling: 1,
	Novice: 1.05,
	Adequate: 1.10,
	Competent: 1.18,
	Skilled: 1.30,
	Proficient: 1.50,
	Master: 1.75
};

var skillSel = '<select class="workerSel">';
var setSkillBtns = "";

for (var skill in skillMults) {
	skillSel += '<option value="' + skill + '">' + skill + "</option>";
	setSkillBtns += ' <input type="button" value="' + skill + '">';
}
skillSel += "</select>";

function updateWorkers(job) {
	var setNumWorkers = job.ownedNode.parsedValue;
	if (job.workers.length > setNumWorkers) {
		var killed = job.workers.splice(setNumWorkers, job.workers.length - setNumWorkers);
		for (var i = killed.length - 1; i >= 0; i--) {
			killed[i].$node.remove();
		}
	}

	for (i = setNumWorkers - job.workers.length; i > 0; i--) {
		var $div = $('<div class="workerNode" data-job="' + job.name +
			'">[:3] <span class="workerName">' + names[rand(names.length)] + " " +
			surnames[rand(surnames.length)] + '</span> Skill: ' + skillSel +
			'&nbsp; <input class="workerMakeLeader" type="button" value="&#9734;" title="Make leader">' +
			'<span class="workerIsLeader">' +
			'<input class="workerFireLeader" type="button" value="&#9733;" title="Fire as leader"> &nbsp;' +
			'Rank: <span class="workerRankSpan"></span></span></div>').appendTo(job.$skillDivs);

		var kitten = {job: job.name, isLeader: false, "$node": $div};

		$div[0].metaObj = kitten;

		kitten.$nameNode = $div.find(".workerName");
		kitten.rankNode = createInput("workerRank", 99);
		$div.find(".workerRankSpan").replaceWith(kitten.rankNode);
		kitten.workerSel = $div.find(".workerSel")[0];
		$div.find(".workerMakeLeader")[0].metaObj = kitten;

		job.workers.push(kitten);
	}
}

function setLeader(kitten) {
	$(".isLeader").removeClass("isLeader").each(function () {
		this.metaObj.isLeader = false;
	});
	if (kitten) {
		kitten.isLeader = true;
		kitten.$node.addClass("isLeader");
	}
}


var updateWorkersHandler = function () {
	updateWorkers(this.metaObj);
};

for (i = 0; i < Jobs.length; i++) {
	var job = Jobs[i];
	job.workers = [];

	var $div = $(
		'<div class="jobBlock" data-job="' + job.name + '">' +
		'<input id="' + job.name + 'Collapse" class="collapser" type="checkbox" checked>' +
		'<label for="' + job.name + 'Collapse"><span>' + job.title + 's</span></label> &nbsp; ' +
		'Assigned: <span class="numWorkersSpan">' +
		'</span><span class="noAnarchy"> &nbsp; Set all: <span class="setWorkerSkills">' + setSkillBtns + '</span></span>' +
		'<div class="collapse skillDivs noAnarchy"></div><div class="collapse noWorkers noAnarchy">No ' + job.title + 's available</div>' +
		'</div>'
	).appendTo("#census");

	job.ownedNode = createInput("numWorkers", 9999);
	job.ownedNode.metaObj = job;
	job.ownedNode.handler = updateWorkersHandler;

	job.$skillDivs = $div.find(".skillDivs");

	$div.find(".numWorkersSpan").replaceWith(job.ownedNode);
}


var numKittens = 0;
var unemployedKittens = 0;
var numWorkers = 0;
var Happiness = 100;
var paragonBonus = 0;
var praiseBonus = 0;

function isHyperbolic(name) {
	return (name === "catnipDemandRatio" ||
		name === "fursDemandRatio" ||
		name === "ivoryDemandRatio" ||
		name === "spiceDemandRatio" ||
		name === "unhappinessRatio");
}

function cacheEffects() {
	globalEffectsCached = {};

	for (i = Programs.length - 1; i >= 0; i--) {
		var program = Programs[i];
		if (program.effects) {
			program.cachedEffects = cycleEffectsBasics(program.effects, program.name);
		}
	}

	for (var effectName in globalEffectNames) {
		var totalEffect = 0;
		var bldEffect = 0;

		for (var i = Upgrades.length - 1; i >= 0; i--) {
			var upgrade = Upgrades[i];
			if (upgrade.ownedNode.checked && upgrade.effects) {
				totalEffect += upgrade.effects[effectName] || 0;
			}
		}

		for (i = Perks.length - 1; i >= 0; i--) {
			var perk = Perks[i];
			if (perk.ownedNode.checked && perk.effects) {
				totalEffect += perk.effects[effectName] || 0;
			}
		}

		for (i = Buildings.length - 1; i >= 0; i--) {
			var bld = Buildings[i];
			if (!bld.ownedNode.parsedValue) {
				continue;
			}

			var bldEffects = bld.effects;
			if (bld.stages) {
				bldEffects = bld.stages[bld.stage].effects;
			}

			var effect = 0;
			if (bldEffects) {
				effect = bldEffects[effectName] || 0;
			}

			effect *= bld.ownedNode.parsedValue;
			bldEffect += effect;
		}

		if (isHyperbolic(effectName) && bldEffect < 0) {
			bldEffect = getHyperbolicEffect(bldEffect, 1.0);
		}
		totalEffect += bldEffect;

		/*for (i = Religion.length - 1; i >= 0; i--) {
			var r = Religion[i];
			if (r.effects) {
				totalEffect += (r.effects[effectName] || 0) * r.ownedNode.parsedValue;
			}
		}*/

		for (i = Programs.length - 1; i >= 0; i--) {
			program = Programs[i];
			if (program.cachedEffects) {
				totalEffect += (program.cachedEffects[effectName] || 0) * program.ownedNode.value;
			}
		}

		for (i = Time.length - 1; i >= 0; i--) {
			var tu = Time[i];
			if (tu.effects) {
				totalEffect += (tu.effects[effectName] || 0) * tu.ownedNode.value;
			}
		}

		globalEffectsCached[effectName] = Number(totalEffect);
	}
}

function getEffect(effectName) {
	return globalEffectsCached[effectName] || 0;
}


function getLeaderBonus(rank) {
	return rank == 0 ? 1.0 : (rank + 1) / 1.4;
}

var workerProduction = {};
var singleWorkerProduction = {};

var perWorkerSkills = ["Dabbling", "Master"];

function setWorkerProduction() {
	var productionRatio = (1 + getEffect("skillMultiplier")) / 4;

	var isAnarchy = byId("anarchy").checked;

	var res = {};
	singleWorkerProduction = {};

	for (var i = Jobs.length - 1; i >= 0; i--) {
		var job = Jobs[i];

		for (var j = job.workers.length - 1; j >= 0; j--) {
			var kitten = job.workers[j];

			for (var jobResMod in job.modifiers) {
				var mult = 1;
				if (!isAnarchy) {
					mult = skillMults[kitten.workerSel.value] || 1;
				}

				var diff = job.modifiers[jobResMod] + job.modifiers[jobResMod] * ((mult - 1) * productionRatio);

				if (diff > 0) {
					if (kitten.isLeader) {
						diff *= getLeaderBonus(kitten.rankNode.parsedValue);
					}
					diff *= Happiness; // alter positive resource production from jobs
				}

				if (!res[jobResMod]) {
					res[jobResMod] = diff;
				} else {
					res[jobResMod] += diff;
				}
			}
		}

		// set dabbling and master skill levels
		var nextKittens = numKittens;
		if (nextKittens === numWorkers) {
			nextKittens++;
		}
		var nextHappiness = calculateHappiness(nextKittens);

		for (i = perWorkerSkills.length - 1; i >= 0; i--) {
			var skill = perWorkerSkills[i];

			if (!singleWorkerProduction[skill]) {
				singleWorkerProduction[skill] = {};
			}
			mult = skillMults[skill];
			for (jobResMod in job.modifiers) {

				diff = job.modifiers[jobResMod] + job.modifiers[jobResMod] * ((mult - 1) * productionRatio);

				if (diff > 0) {
					diff *= nextHappiness;
				}

				singleWorkerProduction[skill][jobResMod] = (res[jobResMod] || 0) + diff;
			}
		}
	}

	workerProduction = res;
}

var catnipPerKitten = -0.85;
function getResConsumption() {
	return {
		"catnip": catnipPerKitten * numKittens,
	};
}

function isDarkFuture() {
	return byId("year").parsedValue - 40000 >= 0;
}

function getParagonProductionRatio() {
	var paragonRatio = 1 + getEffect("paragonRatio");

	var productionRatioParagon = (byId("paragon").parsedValue * 0.010) * paragonRatio;
	productionRatioParagon = getHyperbolicEffect(productionRatioParagon, 2 * paragonRatio);

	var ratio = isDarkFuture() ? 4 : 1;
	var productionRatioBurnedParagon = byId("burnedParagon").parsedValue * 0.010 * paragonRatio;
	productionRatioBurnedParagon = getHyperbolicEffect(productionRatioBurnedParagon, ratio * paragonRatio);

	return productionRatioParagon + productionRatioBurnedParagon;
}

function getCMBRBonus() {
	if (!byId("disableCMBR").checked) {
		return getHyperbolicEffect(1.0, 0.2);
	}
	return 0;
}


function calcResourcePerTick(resName, weatherMod, workerOverride) {
	// var res = getMeta(Resources, resName) || {};

	// BUILDING PerTickBase
	var perTick = getEffect(resName + "PerTickBase");

	// SPACE RATIO CALCULATION
	/*var spaceRatio = 1 + getEffect("spaceRatio");
	if (getMeta(Upgrades, "spaceManufacturing").owned() && resName !== "uranium") {
		var factory = getMeta(Buildings, "factory");
		spaceRatio *= (1 + factory.getOn() * factory.effects["craftRatio"] * 0.75);
	}

	// +SPACE PerTickBase
	if (!skipPerTick) {
		var perTickBaseSpace = getEffect(resName + "PerTickBaseSpace") * spaceRatio;

		perTick += perTickBaseSpace;
	}*/

	// *SEASON MODIFIERS
	/*if (!season) {
		season = calendar.getCurSeason();
	}
	var weatherMod = calendar.getWeatherMod();
	weatherMod = (season.modifiers[resName] + weatherMod);
	if (weatherMod < -0.95) {
		weatherMod = -0.95;
	}*/

	if (weatherMod && weatherMod[resName]) {
		perTick *= weatherMod[resName];
	}

	// +VILLAGE JOB PRODUCTION
	var resMapProduction = workerOverride || workerProduction;
	var resProduction = resMapProduction[resName] || 0;

	perTick += resProduction;

	// +VILLAGE JOB PRODUCTION (UPGRADE EFFECTS JOBS)
	var workshopResRatio = getEffect(resName + "JobRatio");

	perTick += resProduction * workshopResRatio;

	// +*BEFORE PRODUCTION BOOST (UPGRADE EFFECTS GLOBAL)
	perTick *= 1 + getEffect(resName + "GlobalRatio");

	// +*BUILDINGS AND SPACE PRODUCTION
	perTick *= 1 + getEffect(resName + "Ratio");

	// +*RELIGION EFFECTS
	perTick *= 1 + getEffect(resName + "RatioReligion");

	// +*AFTER PRODUCTION BOOST (UPGRADE EFFECTS SUPER)
	perTick *= 1 + getEffect(resName + "SuperRatio");

	// +*AFTER PRODUCTION REDUCTION (SPECIAL STEAMWORKS HACK FOR COAL)
	/*var steamworks = getMeta(Buildings, "steamworks");
	var steamworksOn = steamworks.getOn();
	var swEffectGlobal = steamworks.effects[resName + "RatioGlobal"];
	if (steamworksOn > 0 && swEffectGlobal) {
		perTick *= 1 + swEffectGlobal;
	}*/

	// *PARAGON BONUS
	var paragonProductionRatio = paragonBonus;
	if (resName === "catnip" && byId("winterIsComing").checked) {
		paragonProductionRatio = 0; // winter has come
	}

	perTick *= 1 + paragonProductionRatio;

	// ParagonSpaceProductionRatio definition 1/4
	var paragonSpaceProductionRatio = 1 + paragonProductionRatio * 0.05;

	// +BUILDING AUTOPROD
	var perTickAutoprod = getEffect(resName + "PerTickAutoprod");
	perTickAutoprod *= paragonSpaceProductionRatio;

	perTick += perTickAutoprod;

	// *MAGNETOS PRODUCTION BONUS
	/*if (!res.transient && getMeta(Buildings, "magneto").ownedNode.parsedValue > 0 && resName !== "catnip") {

		var swRatio = steamworksOn > 0 ? (1 + steamworks.effects["magnetoBoostRatio"] * steamworksOn) : 1;
		if (resName !== "oil") {
			perTick *= 1 + (getEffect("magnetoRatio") * swRatio);
		}

		// ParagonSpaceProductionRatio definition 2/4
		paragonSpaceProductionRatio += paragonSpaceProductionRatio * getEffect("magnetoRatio") * swRatio; // These special cases need to die in a hole
	}

	// +*REACTOR PRODUCTION BONUS
	if (!res.transient && resName !== "uranium" && resName !== "catnip") {
		perTick *= 1 + getEffect("productionRatio");

		// ParagonSpaceProductionRatio definition 3/4
		paragonSpaceProductionRatio += paragonSpaceProductionRatio * getEffect("productionRatio");
	}*/

	// +*FAITH BONUS
	var religionProductionBonus = praiseBonus;
	perTick *= 1 + (religionProductionBonus / 100);

	// +COSMIC RADIATION
	if (!byId("disableCMBR").checked) {
		perTick *= 1 + getCMBRBonus();
	}

	// ParagonSpaceProductionRatio definition 4/4
	// paragonSpaceProductionRatio += paragonSpaceProductionRatio * religionProductionBonus / 100;

	// +AUTOMATED PRODUCTION BUILDING
	perTick += getEffect(resName + "PerTickProd");

	// +AUTOMATED PRODUCTION SPACE (FULL BONUS)
	/*perTick += (getEffect(resName + "PerTickAutoprodSpace") * spaceRatio) * (1 + (paragonSpaceProductionRatio - 1) * getEffect("prodTransferBonus"));
	// +AUTOMATED PRODUCTION SPACE (NOT FULL BONUS)
	perTick += getEffect(resName + "PerTickSpace") * spaceRatio;*/

	// CYCLE EFFECTS
	// Already added because it's space building improvements.

	// CYCLE FESTIVAL EFFECTS

	var effects = {};
	effects[resName] = perTick;
	cycleEffectsFestival(effects);
	perTick = effects[resName];

	// +BUILDING AND SPACE PerTick
	perTick += getEffect(resName + "PerTick");

	// -EARTH CONSUMPTION
	var resMapConsumption = getResConsumption();
	var resConsumption = resMapConsumption[resName] || 0;
	resConsumption *= 1 + getEffect(resName + "DemandRatio");
	if (resName === "catnip" && numKittens > 0 && Happiness > 1) {
		var hapinnessConsumption = Math.max(Happiness - 1, 0);
		if (byId("anarchy").checked) {
			resConsumption += resConsumption * hapinnessConsumption * (1 + getEffect(resName + "DemandWorkerRatioGlobal"));
		} else {
			resConsumption += resConsumption * hapinnessConsumption * (1 + getEffect(resName + "DemandWorkerRatioGlobal")) * (1 - unemployedKittens / numKittens);
		}
	}

	perTick += resConsumption;

	// handled differently ingame but close enough for this
	perTick += getEffect(resName + "PerTickCon");

	if (isNaN(perTick)) {
		return 0;
	}

	return perTick;
}


function calculateHappiness(kittens) {
	var happiness = 100;

	if (kittens > 5) {
		var unhappiness = (kittens - 5) * 2;
		unhappiness = unhappiness + unhappiness * getEffect("unhappinessRatio");
		happiness -= unhappiness;
	}

	var happinessBonus = getEffect("happiness");
	happiness += happinessBonus;

	var resHappiness = 0;
	for (var i = Resources.length - 1; i >= 0; i--) {
		var res = Resources[i];
		if (res.type !== "common" && getMetaValue(res) > 0) {
			if (res.name !== "elderBox" || !getMeta(Resources, "wrappingPaper").ownedNode.checked) {
				resHappiness += 10;
			}
		}
	}

	happiness += resHappiness + byId("karma").parsedValue;

	if (byId("festival").checked) {
		happiness += 30;
	}

	var maxKittens = getEffect("maxKittens");

	if (kittens > maxKittens) {
		happiness -= 2 * (kittens - maxKittens);
	}
	happiness = Math.max(happiness, 25) / 100;

	return happiness;
}

function writePerTick(node, perTick) {
	$(node).html(getDisplayValueExt(perTick, true, true) + "<br>" + getDisplayValueExt(perTick * 10 * 100))
		.toggleClass("red", perTick < 0);
}


function calculate() {
	for (var i = Buildings.length - 1; i >= 0; i--) {
		var bld = Buildings[i];
		if (bld.calculateEffects) {
			bld.effects = bld.calculateEffects();
		}
	}

	cacheEffects();

	numKittens = byId("numKittens").parsedValue;

	unemployedKittens = byId("unemployedKittens").parsedValue;
	numWorkers = 0;
	for (i = Jobs.length - 1; i >= 0; i--) {
		numWorkers += Jobs[i].ownedNode.parsedValue;
	}

	numKittens = Math.max(numKittens, numWorkers + unemployedKittens);

	paragonBonus = getParagonProductionRatio();

	praiseBonus = getTriValue(byId("praise").parsedValue, 1000);

	var transcendenceLevel = byId("transcendenceLevel").parsedValue;
	var atheismBonus = byId("atheismComplete").checked ? transcendenceLevel * 0.1 : 0;
	var blackObeliskBonus = transcendenceLevel * getMeta(Religion, "blackObelisk").ownedNode.parsedValue * 0.005;
	praiseBonus = getHyperbolicEffect(praiseBonus, 1000) * (1 + atheismBonus + blackObeliskBonus);
	byId("praiseGain").textContent = getDisplayValueExt(praiseBonus);

	Happiness = calculateHappiness(numKittens);

	byId("maxKittensSpan").textContent = getEffect("maxKittens");
	byId("happinessSpan").textContent = Math.floor(Happiness * 100) + "%";

	var bonusText = "---";
	if (!byId("disableCMBR").checked) {
		bonusText = getDisplayValueExt(getCMBRBonus() * 100, true) + "%";
	}
	byId("CMBRBonusSpan").textContent = bonusText;

	setWorkerProduction();

	var winterHasCome = byId("winterIsComing").checked;

	$("#springRow, #summerRow").toggleClass("hidden", winterHasCome);

	byId("winterRow").children[0].innerHTML = winterHasCome ? "Winter I-IV" : "Winter";

	var weatherMods = [0, 0.15, -0.15];

	for (i = Seasons.length - 1; i >= 0; i--) {
		var season = Seasons[i];
		var row = season.row;
		if (row) {
			for (var j = 0; j < weatherMods.length; j++) {
				var perTick = calcResourcePerTick("catnip", {catnip: season.modifier + weatherMods[j]});
				writePerTick(row.children[j + 1], perTick);
			}
		}
	}

	var seasonAvg = {catnip: AverageSeason.normal};

	var winterIsComingDone = byId("winterIsComingComplete").checked;
	if (winterIsComingDone) {
		seasonAvg.catnip = AverageSeason.winterIsComingDone;
	}

	if (winterHasCome) {
		// only winter
		if (winterIsComingDone) {
			seasonAvg.catnip = Seasons[3].average.winterIsComingDone;
		} else {
			seasonAvg.catnip = Seasons[3].average.normal;
		}
	}


	var perTickAvg = calcResourcePerTick("catnip", seasonAvg);
	writePerTick("#catnipAverage", perTickAvg);

	if (unemployedKittens > 0) {
		unemployedKittens--;
		numWorkers++;
	} else if (numKittens === numWorkers) {
		numKittens++;
		numWorkers++;
	}

	Happiness = calculateHappiness(numKittens);

	var perTickDabbling = calcResourcePerTick("catnip", seasonAvg, singleWorkerProduction.Dabbling) - perTickAvg;
	byId("catnipDabbling").textContent = getDisplayValueExt(perTickDabbling, true, true);

	var perTickMaster = calcResourcePerTick("catnip", seasonAvg, singleWorkerProduction.Master) - perTickAvg;
	byId("catnipMaster").textContent = getDisplayValueExt(perTickMaster, true, true);

	$(document.body).toggleClass("anarchy", byId("anarchy").checked);
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
.on("click", ".workerMakeLeader", function () {
	setLeader(this.metaObj);
	calculate();

})
.on("click", ".workerFireLeader", function () {
	setLeader();
	calculate();

})
.on("click", '.setWorkerSkills input[type="button"]', function () {
	var mult = skillMults[this.value];
	var job = getMeta(Jobs, $(this).parents('[data-job]').attr('data-job'));
	if (mult && job && job.workers.length) {
		for (var i = job.workers.length - 1; i >= 0; i--) {
			job.workers[i].workerSel.value = this.value;
		}
		calculate();
	}

})
.on("click", 'input[type="checkbox"]:not(.collapser)', function () {
	if (this.handler) { this.handler(); }
	calculate();
});

$("#buildingsBlock").on("click", 'input[type="button"]', function (ev) {
	ev.stopPropagation();
	var bld = this.metaObj;
	var stage = bld.stage;
	if (this.value === "V") {
		stage -= 1;
	} else if (this.value === "^") {
		stage += 1;
	}
	setStagedBuilding(bld, stage);
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
			byId("festival").checked = saveData.calendar.festivalDays > 0;
			if (Cycles[saveData.calendar.cycle]) {
				byId("cycleSel").value = saveData.calendar.cycle;
			}
		}

		if (saveData.challenges) {
			if (saveData.challenges.currentChallenge === "winterIsComing") {
				byId("winterIsComing").checked = true;
			} else if (saveData.challenges.currentChallenge === "anarchy") {
				byId("anarchy").checked = true;
			}

			var saveWinter = getMeta(saveData.challenges.challenges, "winterIsComing");
			if (saveWinter) {
				byId("winterIsComingComplete").checked = saveWinter.researched;
			}

			var saveAtheism = getMeta(saveData.challenges.challenges, "atheism");
			if (saveAtheism) {
				byId("atheismComplete").checked = saveAtheism.researched;
			}
		}

		if (saveData.workshop) {
			loadMetadata(saveData.workshop.upgrades, Upgrades, "researched");
		}

		if (saveData.prestige) {
			loadMetadata(saveData.prestige.perks, Perks, "researched");
		}

		if (saveData.religion) {
			var hasSolar = false;
			loadMetadata(saveData.religion.zu, Religion, "on");
			loadMetadata(saveData.religion.ru, Religion, "on", function (saveRU) {
				if (saveRU.name === "solarRevolution") {
					hasSolar = saveRU.on > 0;
				}
			});
			loadMetadata(saveData.religion.tu, Religion, "on");

			var praise = hasSolar ? saveData.religion.faith : 0;
			setInput(byId("praise"), Math.floor(praise) || 0);

			var level = (getTriValue(saveData.religion.tcratio || 0, 0.1) * 0.1) * 100;
			level = Math.max(Math.round(Math.log(level)), 0);
			setInput(byId("transcendenceLevel"), level);
		}

		if (saveData.space) {
			for (i = saveData.space.planets.length - 1; i >= 0; i--) {
				loadMetadata(saveData.space.planets[i].buildings, Programs, "val");
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
				}
			}
		}

		if (saveData.resources) {
			loadMetadata(saveData.resources, Resources, "value");
		}

		var saveGame = saveData.game || {};
		setInput(byId("karma"), getTriValue(saveGame.karmaKittens, 5) || 0);

		if (saveGame.opts) {
			byId("usePerSecondValues").checked = saveGame.opts.usePerSecondValues;
			byId("forceHighPrecision").checked = saveGame.opts.forceHighPrecision;
		}

		var CMBREnabled = Boolean(saveGame.isCMBREnabled);

		$("#CMBRBonusRow").toggleClass("hidden", !CMBREnabled);

		if (CMBREnabled && saveGame.opts) {
			CMBREnabled = !saveGame.opts.disableCMBR;
		}
		byId("disableCMBR").checked = !CMBREnabled;

		var leader = null;
		var setWorkers = {};
		for (i = Jobs.length - 1; i >= 0; i--) {
			setWorkers[Jobs[i].name] = [];
		}

		if (saveData.village && saveData.village.kittens) {
			numKittens = saveData.village.kittens.length;
			setInput(byId("numKittens"), numKittens);
			var numEmployed = 0;

			for (i = saveData.village.kittens.length - 1; i >= 0; i--) {
				var kitten = saveData.village.kittens[i];
				if (kitten.job) {
					numEmployed++;
					if (kitten.job in setWorkers) {
						setWorkers[kitten.job].push(kitten);
					}
				}
			}

			setInput(byId("unemployedKittens"), numKittens - numEmployed);
		}

		for (i = Jobs.length - 1; i >= 0; i--) {
			var job = Jobs[i];

			var saveWorkers = setWorkers[job.name];
			setInput(job.ownedNode, saveWorkers.length, true);

			for (j = 0; j < job.workers.length; j++) {
				kitten = job.workers[j];
				var saveKitten = saveWorkers[j];

				if (saveKitten) {
					var skill = skillToText(saveKitten.skills[job.name] || 0);

					kitten.$nameNode.text(saveKitten.name + " " + saveKitten.surname);
					kitten.workerSel.value = skill;
					setInput(kitten.rankNode, saveKitten.rank || 0);
					if (saveKitten.isLeader) {
						leader = kitten;
					}
				}
			}
		}

		setLeader(leader);

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
