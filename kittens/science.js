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

function darkFutureYears() {
	return byId("year").parsedValue - 40000;
}

function getParagonStorageRatio() {
	var paragonRatio = 1.0 + getEffect("paragonRatio");
	var storageRatio = (getMeta(Resources, "paragon").ownedNode.parsedValue / 1000) * paragonRatio;
	var burntParagon = getMeta(Resources, "burnedParagon").ownedNode.parsedValue;
	if (darkFutureYears() >= 0) {
		storageRatio += (burntParagon / 500) * paragonRatio;
	} else {
		storageRatio += (burntParagon / 2000) * paragonRatio;
	}
	return storageRatio;
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

var globalEffectsCached = {};

function registerEffectNames(effects) {
	if (effects) {
		for (var effectName in effects) {
			globalEffectsCached[effectName] = 0;
		}
	}
}

function getEffect(effectName) {
	return globalEffectsCached[effectName] || 0;
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
			// "hrHarvester-energyProduction": 1.5,
			// "planetCracker-uraniumPerTickSpace": 0.9,
			// "hydrofracturer-oilPerTickAutoprodSpace": 0.75
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
			// "sunlifter-energyProduction": 1.5,
			// "cryostation-woodMax": 0.9,
			// "cryostation-mineralsMax": 0.9,
			// "cryostation-ironMax": 0.9,
			// "cryostation-coalMax": 0.9,
			// "cryostation-uraniumMax": 0.9,
			// "cryostation-titaniumMax": 0.9,
			// "cryostation-oilMax": 0.9,
			// "cryostation-unobtainiumMax": 0.9
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
			"sattelite-observatoryRatio": 2,
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
			// "hrHarvester-energyProduction": 0.75
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
			// "sunlifter-energyProduction": 0.5
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
			"sattelite-observatoryRatio": 0.75,
			// "spaceStation-scienceRatio": 0.75
		// },
		// festivalEffects: {
		// 	"starchart": 5
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

		for (var effectName in baseEffects) {
			effects[effectName] = baseEffects[effectName];
			var effect_cycle = building_name + "-" + effectName;
			if (typeof list_effects_cycle[effect_cycle] !== "undefined") {
				effects[effectName] *= list_effects_cycle[effect_cycle];
			}
		}
	}

	return effects;
}


var Buildings = [
	{
		name: "library",
		stages: [
			{
				label: "Library",
				effects: {
					"scienceMax": 250,
					"scienceMaxCompendia": 0
				}
			}, {
				label: "Data Center",
				effects: {
					"scienceMax": 750,
					"scienceMaxCompendia": 1000
				}
			}
		],
		stage: 0,
		calculateEffects: function (self) {
			var effects = {
				"scienceMax": 250,
				"scienceMaxCompendia": 0
			};

			var libraryRatio = getEffect("libraryRatio");
			effects["scienceMax"] *= (1 + getMeta(Buildings, "observatory").ownedNode.parsedValue * libraryRatio);

			if (self.stage === 1) {
				effects["scienceMax"] *= 3;	// 250->750 base science boost for data centers
				effects["scienceMaxCompendia"] = 1000;

				if (getMeta(Upgrades, "uplink").ownedNode.checked) {
					var biolab = getMeta(Buildings, "biolab");
					var biolabBonus = Math.min(biolab.onNode.parsedValue, biolab.ownedNode.parsedValue) * getEffect("uplinkDCRatio");
					effects["scienceMax"] *= 1 + biolabBonus;
					effects["scienceMaxCompendia"] *= 1 + biolabBonus;
				}

				if (getMeta(Upgrades, "machineLearning").ownedNode.checked) {
					var dataCenterAIRatio = getEffect("dataCenterAIRatio");
					var cores = getMeta(Buildings, "aiCore").ownedNode.parsedValue;

					effects["scienceMax"] *= 1 + cores * dataCenterAIRatio;
					effects["scienceMaxCompendia"] *= 1 + cores * dataCenterAIRatio;
				}
			}

			return effects;
		}
	}, {
		name: "academy",
		label: "Academy",
		effects: {
			"scienceMax": 500
		}
	}, {
		name: "observatory",
		label: "Observatory",
		effects: {
			"scienceMax": 1000
		},
		calculateEffects: function () {
			var effects = {
				"scienceMax": 1000
			};

			if (getMeta(Upgrades, "astrolabe").ownedNode.checked) {
				effects["scienceMax"] = 1500;
			}

			var ratio = 1 + getEffect("observatoryRatio");
			effects["scienceMax"] *= ratio;

			return effects;
		}
	}, {
		name: "biolab",
		label: "Biolab",
		effects: {
			"scienceMax": 1500
		},
		togglable: true,
		calculateEffects: function () {
			var effects = {
				"scienceMax": 1500
			};

			var library = getMeta(Buildings, "library");
			if (library.stage === 1 && getMeta(Upgrades, "uplink").ownedNode.checked) {
				var datacenterBonus = library.ownedNode.parsedValue * getEffect("uplinkLabRatio");
				effects["scienceMax"] *= 1 + datacenterBonus;
			}
			return effects;
		}
	}, {
		name: "accelerator",
		label: "Accelerator",
		effects: {
			"scienceMax": 0
		},
		calculateEffects: function () {
			var effects = {
				"scienceMax": 0
			};

			if (getMeta(Upgrades, "lhc").ownedNode.checked) {
				effects["scienceMax"] = 2500;
			}

			return effects;
		}
	}, {
		name: "temple",
		label: "Temple",
		effects: {
			"scienceMax": 0
		},
		calculateEffects: function () {
			var effects = {
				"scienceMax": 0
			};

			var scholastics = getMeta(Religion, "scholasticism").ownedNode.parsedValue;
			if (scholastics > 0) {
				effects["scienceMax"] = 400 + 100 * scholastics;
			}

			return effects;
		}
	}, {
		name: "aiCore",
		label: "AI Core",
		effects: {}
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

var node = byId("buildingsBlock");
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

	bld.onNode = bld.ownedNode;
	if (bld.togglable) {
		bld.onNode = createInput("building onInput", 999);
		bld.onNode.metaObj = bld;
		td.appendChild(bld.onNode);
		td.appendChild(document.createTextNode(" / "));
	}
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
		name: "unicornGraveyard",
		label: "Unicorn Graveyard",
		effects: {
			"blackLibraryBonus": 0.02
		}
	}, {
		name: "scholasticism",
		label: "Scholasticism",
		effects: {}
	}, {
		name: "blackLibrary",
		label: "Black Library",
		effects: {
			"compendiaTTBoostRatio": 0.02
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

	registerEffectNames(r.effects);
}


var Upgrades = [
	{
		name: "lhc",
		label: "LHC",
		effects: {}
	}, {
		name: "uplink",
		label: "Uplink",
		effects: {
			"uplinkDCRatio":  0.01,
			"uplinkLabRatio": 0.01
		}
	}, {
		name: "starlink",
		label: "Starlink",
		effects: {
			"uplinkLabRatio": 0.01
		}
	}, {
		name: "machineLearning",
		label: "Machine Learning",
		effects: {
			"dataCenterAIRatio": 0.10
		}
	}, {
		name: "astrolabe",
		label: "Astrolabe",
		effects: {}
	}, {
		name: "titaniumMirrors",
		label: "Titanium Reflectors",
		effects: {
			"libraryRatio": 0.02
		}
	}, {
		name: "unobtainiumReflectors",
		label: "Unobtainium Reflectors",
		effects: {
			"libraryRatio": 0.02
		}
	}, {
		name: "eludiumReflectors",
		label: "Eludium Reflectors",
		effects: {
			"libraryRatio": 0.02
		}
	}, {
		name: "amReactors",
		label: "Antimatter Reactors",
		effects: {
			"spaceScienceRatio": 0.95
		}
	}, {
		name: "amReactorsMK2",
		label: "Advanced AM Reactors",
		effects: {
			"spaceScienceRatio": 1.5
		}
	}, {
		name: "voidReactors",
		label: "Void Reactors",
		effects: {
			"spaceScienceRatio": 4
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
		name: "codexLeviathanianus",
		label: "Codex Leviathanianus",
		effects: {}
	}, {
		name: "numerology",
		label: "Numerology",
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

	if (perk.isHidden) {
		$(div).addClass("hidden");
	}

	node.appendChild(div);

	registerEffectNames(perk.effects);
}


var Programs = [
	{
		name: "sattelite",
		label: "Satellite",
		effects: {
			"observatoryRatio": 0.05
		}
	}, {
		name: "researchVessel",
		label: "Reaserch Vessel",
		effects: {
			"scienceMax": 10000
		},
		calculateEffects: function () {
			return {
				"scienceMax": 10000 * (1 + getEffect("spaceScienceRatio"))
			};
		}
	}, {
		name: "spaceBeacon",
		label: "Space Beacon",
		effects: {
			"scienceMax": 25000
		},
		calculateEffects: function () {
			return {
				"scienceMax": 25000 * (1 + getEffect("spaceScienceRatio"))
			};
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


var Resources = [
	{
		name: "paragon",
		ownedNode: byId("paragon")
	}, {
		name: "burnedParagon",
		title: "burned paragon",
		ownedNode: byId("burnedParagon")
	}, {
		name: "compedium",
		title: "compendium",
		ownedNode: byId("compedium")
	}
];

function cacheMetaEffects(meta) {
	for (var i = meta.length - 1; i >= 0; i--) {
		var m = meta[i];
		var value = getMetaValue(m);
		if (m && value > 0 && m.effects) {
			cacheEffects(m.effects, value);
		}
	}
}

function cacheEffects(effects, mult) {
	if (isNaN(mult)) {
		mult = 1;
	}

	if (effects) {
		for (var effectName in effects) {
			globalEffectsCached[effectName]	+= effects[effectName] * mult;
		}
	}
}


var paragonStorageRatio = 0;
function displayMax(val) {
	return getDisplayValueExt(val * (1 + paragonStorageRatio));
}


function calculate() {
	currentCycle = byId("cycleSel").value;

	for (var effectName in globalEffectsCached) {
		globalEffectsCached[effectName] = 0;
	}

	cacheMetaEffects(Upgrades);
	cacheMetaEffects(Perks);
	cacheMetaEffects(Religion);

	paragonStorageRatio = getParagonStorageRatio();

	for (var i = Programs.length - 1; i >= 0; i--) {
		var program = Programs[i];
		var on = getMetaValue(program);
		if (on > 0 && program.effects) {
			var effects = program.effects;
			if (program.calculateEffects) {
				effects = program.calculateEffects(program);
			}
			effects = cycleEffectsBasics(effects, program.name);
			cacheEffects(effects, on);
		}
	}

	var bldScienceMax = 0;

	for (i = Buildings.length - 1; i >= 0; i--) {
		var bld = Buildings[i];
		on = getMetaValue(bld);
		if (on > 0) {
			var bldEffects = bld.effects;
			if (bld.calculateEffects) {
				bldEffects = bld.calculateEffects(bld);

			} else if (bld.stages) {
				bldEffects = bld.stages[bld.stage].effects || bldEffects;
			}
			if (bldEffects["scienceMax"] > 0) {
				bldScienceMax += bldEffects["scienceMax"] * on;
			}
			cacheEffects(bldEffects, on);
		}
	}

	var scienceMaxCompendiaCap =  getEffect("scienceMaxCompendia");
	var compendia = getMetaValue(getMeta(Resources, "compedium"));
	var compendiaScienceMax = Math.floor(compendia * 10);

	// iw compedia cap is set to 1000% instead of 100%
	var iwScienceCapRatio = byId("ironWill").checked ? 10 : 1;

	if (getMeta(Perks, "codexLeviathanianus").ownedNode.checked) {
		var blackLibrary = getMeta(Religion, "blackLibrary");
		var ttBoostRatio = (
			0.05 * (
				1 +
				blackLibrary.ownedNode.parsedValue * (
					blackLibrary.effects["compendiaTTBoostRatio"] +
					getEffect("blackLibraryBonus"))
			)
		);
		iwScienceCapRatio *= 1 + ttBoostRatio * byId("transcendenceLevel").parsedValue;
	}

	var compendiaCap = bldScienceMax * iwScienceCapRatio + scienceMaxCompendiaCap;

	if (compendiaScienceMax > compendiaCap) {
		compendiaScienceMax = compendiaCap;
	}

	var scienceMax = 250 + getEffect("scienceMax") + compendiaScienceMax;

	var compendiaForMax = compendiaCap / 10;
	var compendiaForMaxDiff = Math.max(compendiaForMax - compendia, 0);
	var compendiaCapDiff = Math.max(compendiaCap - compendiaScienceMax, 0);

	$("#scienceMax").text(displayMax(scienceMax));
	$("#scienceMaxCompendia").text(displayMax(compendiaScienceMax));
	$("#compendiaForMax").text(getDisplayValueExt(compendiaForMax) + " (+" + getDisplayValueExt(compendiaForMaxDiff) + ")");
	$("#scienceMaxCompendiaLimit").text(displayMax(compendiaCap) +
		" (+" + displayMax(compendiaCapDiff) + ")");
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
			if (Cycles[saveData.calendar.cycle]) {
				byId("cycleSel").value = saveData.calendar.cycle;
			}
		}

		if (saveData.workshop) {
			loadMetadata(saveData.workshop.upgrades, Upgrades, "researched");
		}

		if (saveData.prestige) {
			loadMetadata(saveData.prestige.perks, Perks, "researched");
		}

		if (saveData.religion) {
			loadMetadata(saveData.religion.zu, Religion, "on");
			loadMetadata(saveData.religion.ru, Religion, "on");
			loadMetadata(saveData.religion.tu, Religion, "on");

			var level = (getTriValue(saveData.religion.tcratio || 0, 0.1) * 0.1) * 100;
			level = Math.max(Math.round(Math.log(level)), 0);
			setInput(byId("transcendenceLevel"), level);
		}

		if (saveData.space) {
			for (i = saveData.space.planets.length - 1; i >= 0; i--) {
				loadMetadata(saveData.space.planets[i].buildings, Programs, "val");
			}
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
							value = saveBld.val;
						}
					} else {
						value = saveBld.val;
					}
					setInput(bld.ownedNode, value);
					if (bld.togglable) {
						setInput(bld.onNode, Math.min(saveBld.on, value));
					}
				}
			}
		}

		if (saveData.resources) {
			loadMetadata(saveData.resources, Resources, "value");
		}

		var saveGame = saveData.game || {};
		byId("ironWill").checked = saveGame.ironWill;
		if (saveGame.opts) {
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
