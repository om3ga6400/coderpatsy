// @ts-check;

(function (window, document, $, LZString) {
"use strict";

document.forms[0].reset();


function parseInput(ele) {
	var value = ele.classList.contains("deci") ? parseFloat(ele.value) : parseInt(ele.value, 10);
	return Math.max(value, ele.min || 0) || 0;
}

// initialize input caches
$('input:not([type]), input[type="number"]').each(function () {
	this.type = "number";
	this.min = 0;
	this.parsedValue = parseInput(this);
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

// getHyperbolicEffect
function getLimitedDR(effect, limit) {
	var absEffect = Math.abs(effect);
	var maxUndiminished = 0.75 * limit; // first 75% is free from diminishing returns
	if (absEffect <= maxUndiminished) {
		// Not high enough for diminishing returns to apply
		return effect < 0 ? -absEffect : absEffect;
	}

	var diminishedPortion = absEffect - maxUndiminished;
	var delta = 0.25 * limit; // Lower values will approach 1 more quickly.

	// The last 25% will approach .25 but cannot actually reach it
	var diminishedEffect = (1 - (delta / (diminishedPortion + delta))) * 0.25 * limit;
	var totalEffect = maxUndiminished + diminishedEffect;

	return effect < 0 ? -totalEffect : totalEffect;
}

function isFiniteTime(t) {
	return isFinite(t) && t < Number.MAX_VALUE;
}


// Kittens Game methods
// getTriValue
function getUnlimitedDR(value, stripe) {
	return (Math.sqrt(1 + 8 * value / stripe) - 1) / 2;
}

function toDisplaySeconds(secondsRaw) {
	if (!isFiniteTime(secondsRaw)) {
		return "---";
	}
	var sec_num = Math.floor(secondsRaw);

	var year_secs = 86400 * 365;

	var years   = Math.floor(sec_num / year_secs);
	var days    = Math.floor((sec_num - (years * year_secs)) / 86400);
	var hours   = Math.floor((sec_num - (years * year_secs) - (days * 86400)) / 3600);
	var minutes = Math.floor((sec_num - (years * year_secs) - (days * 86400 + hours * 3600)) / 60);
	var seconds = sec_num - (years * year_secs) - (days * 86400) - (hours * 3600) - (minutes * 60);

	if (years > 0) {
		years = getDisplayValueExt(years);
	}

	var timeFormated = "";
	if (years) { timeFormated = years + "y "; }
	if (days) { timeFormated += days + "d "; }
	if (!years) {
		if (hours) {  timeFormated += hours + "h "; }
		if (minutes) { timeFormated += minutes + "m "; }
		if (seconds) { timeFormated += seconds + "s "; }
	}

	return timeFormated;
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

function getDisplayValueExt(value, prefix, precision) {
	if (!value) { return "0"; }
	if (!isFinite(value)) {
		return getDisplayValue(value, prefix, precision);
	}

	var postfix = "";
	var absValue = Math.abs(value);
	for (var i = 0; i < postfixes.length; i++) {
		var p = postfixes[i];
		while (absValue >= p.limit) {
			value = value / p.divisor;
			absValue = Math.abs(value);
			postfix += p.postfix[0];
		}
	}

	return getDisplayValue(value, prefix, precision) + postfix;
}

function getDisplayValue(floatVal, plusPrefix, precision) {
	var plusSign = "+";
	if (floatVal <= 0 || !plusPrefix) {
		plusSign = "";
	}

	precision = Math.max(precision, 3) || 3;

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
// end KG methods

var inputCounter = 0;
function createCheckbox(text, className) {
	var id = inputCounter++;
	var label = $('<label><input id="checkbox-' + id + '" type="checkbox"> ' + text + "</label>")[0];
	var cbox = label.children[0];
	if (className) {
		cbox.className = className;
	}
	return {label: label, cbox: cbox};
}

function createInput(className, max) {
	var id = inputCounter++;
	var input = $('<input id="input-' + id + '" type="number" value="0" placeholder="0">')[0];
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

var globalEffectsCached = {};
var globalEffectNames = {};

function registerEffectNames(effects) {
	if (effects) {
		for (var effectName in effects) {
			globalEffectNames[effectName] = true;
		}
	}
}


var unicornBuildings = [];


var Cycles = [
	{
		name: "charon",
		title: "Charon",
		glyph: "&#9049;",
		effects: {
			// "moonOutpost-unobtainiumPerTickSpace": 0.9
		},
		festivalEffects: {
			// "catnip": 1.5,
			// "wood": 1.5,
			// "minerals": 1.5
		}
	}, {
		name: "umbra",
		title: "Umbra",
		glyph: "&#9062;",
		effects: {
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
		effects: {
			// "researchVessel-starchartPerTickBaseSpace": 0.5
		},
		festivalEffects: {
			// "culture": 2
		}
	}, {
		name: "helios",
		title: "Helios",
		glyph: "&#8978;",
		effects: {
			// "sunlifter-energyProduction": 1.5
		},
		festivalEffects: {
			// "faith": 2,
			"unicorns": 1.25
		}
	}, {
		name: "cath",
		title: "Cath",
		glyph: "&#9022;",
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
		effects: {
			// "moonOutpost-unobtainiumPerTickSpace": 1.2
		},
		festivalEffects: {
			// "unobtainium": 2
		}
	}, {
		name: "dune",
		title: "Dune",
		glyph: "&#9067;",
		effects: {
			// "planetCracker-uraniumPerTickSpace": 1.1,
			// "hydrofracturer-oilPerTickAutoprodSpace": 1.5
		},
		festivalEffects: {
			// "uranium": 2
		}
	}, {
		name: "piscine",
		title: "Piscine",
		glyph: "&#9096;",
		effects: {
			// "researchVessel-starchartPerTickBaseSpace": 1.5
		},
		festivalEffects: {
			// "science": 2
		}
	}, {
		name: "terminus",
		title: "Terminus",
		glyph: "&#9053;",
		effects: {
			// "sunlifter-energyProduction": 0.5
		},
		festivalEffects: {
			// "oil": 2
		}
	}, {
		name: "kairo",
		title: "Kairo",
		glyph: "&#8483;",
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

var cycleOptions = "";
for (var i = 0; i < Cycles.length; i++) {
	var cycle = Cycles[i];
	cycleOptions += '<option value="' + i + '">' + cycle.glyph + " " + cycle.title + "</option>";
}
byId("cycleSel").innerHTML = cycleOptions;

function cycleEffectsFestival(effects) {
	if (getMeta(Perks, "numeromancy").ownedNode.checked && byId("festival").checked) {
		var list_festivalEffects_cycle = Cycles[byId("cycleSel").value].festivalEffects;

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
		name: "paragon",
		ownedNode: byId("paragon")
	}, {
		name: "burnedParagon",
		ownedNode: byId("burnedParagon")
	}, {
		name: "sorrow",
		ownedNode: byId("sorrow")
	}
];


var Buildings = [
	{
	// 	name: "mint",
	// 	label: "Mint",
	// 	prices: [],
	// 	effects: {
	// 		"ivoryPerTickProd": 0.0021
	// 	},
	// 	calculateEffects: function () {

	// 	}
	// }, {
		name: "unicornPasture",
		label: "Unic. Pasture",
		prices: [
			{name: "unicorns", val: 2}
		],
		priceRatio: 1.75,
		effects: {
			// "catnipDemandRatio": -0.0015,
			"unicornsPerTickBase": 0.001
		},
		isUnicornBuilding: true
	}, {
		name: "ziggurat",
		label: "Ziggurat",
		prices: [],
		effects: {}
	}
];

node = byId("buildingsBlock");
var tr;
for (i = 0; i < Buildings.length; i++) {
	var bld = Buildings[i];

	if (bld.isUnicornBuilding) {
		unicornBuildings.push(bld);

	} else {
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
	}

	registerEffectNames(bld.effects);
}


var Religion = {
	zu: [
		{
			name: "unicornTomb",
			label: "Unicorn Tomb",
			prices: [
				{name: "ivory", val: 500},
				{name: "tears", val: 5}
			],
			effects: {
				"unicornsRatioReligion": 0.05
			}
		}, {
			name: "ivoryTower",
			label: "Ivory Tower",
			prices: [
				{name: "ivory", val: 25000},
				{name: "tears", val: 25}
			],
			effects: {
				"unicornsRatioReligion": 0.1,
				"riftChance":            5
			}
		}, {
			name: "ivoryCitadel",
			label: "Ivory Citadel",
			prices: [
				{name: "ivory", val: 50000},
				{name: "tears", val: 50}
			],
			effects: {
				"unicornsRatioReligion": 0.25,
				"ivoryMeteorChance":     5
			}
		}, {
			name: "skyPalace",
			label: "Sky Palace",
			prices: [
				{name: "ivory",    val: 125000},
				{name: "tears",    val: 500},
				{name: "megalith", val: 5}
			],
			effects: {
				// "goldMaxRatio":          0.01,
				"unicornsRatioReligion": 0.5,
				"alicornChance":         10,
				"alicornPerTick":        0.00002,
				"ivoryMeteorRatio":      0.05
			}
		}, {
			name: "unicornUtopia",
			label: "Unicorn Utopia",
			prices: [
				{name: "gold",  val: 500},
				{name: "ivory", val: 1000000},
				{name: "tears", val: 5000}
			],
			effects: {
				"unicornsRatioReligion": 2.5,
				"alicornChance":         15,
				"alicornPerTick":        0.000025,
				"tcRefineRatio":         0.05,
				"ivoryMeteorRatio":      0.15
			}
		}, {
			name: "sunspire",
			label: "Sunspire",
			prices: [
				{name: "gold",  val: 1250},
				{name: "ivory", val: 750000},
				{name: "tears", val: 25000}
			],
			effects: {
				"unicornsRatioReligion": 5,
				"alicornChance":         30,
				"alicornPerTick":        0.00005,
				"tcRefineRatio":         0.1,
				"ivoryMeteorRatio":      0.5
			}
		}
	],

	tu: [
		{
			name: "blackObelisk",
			label: "Black Obelisk",
			effects: {}
		}, {
			name: "blazar",
			label: "Blazar",
			effects: {
				"timeRatio": 0.10
				// "rrRatio":   0.02
			}
		}
	]
};

for (i = 0; i < Religion.zu.length; i++) {
	var zu = Religion.zu[i];
	zu.priceRatio = 1.15;

	zu.isZigguratBuilding = true;

	if (i > 0) {
		zu.requires = Religion.zu[i - 1];
	}

	registerEffectNames(zu.effects);

	unicornBuildings.push(zu);
}

var node = byId("res");
for (i = 0; i < Religion.tu.length; i++) {
	var tu = Religion.tu[i];

	tr = document.createElement("tr");
	node.appendChild(tr);

	tu.nameNode = document.createElement("td");
	tu.nameNode.textContent = tu.label || tu.name;
	tr.appendChild(tu.nameNode);

	td = document.createElement("td");
	tr.appendChild(td);

	tu.ownedNode = createInput("tu", 999);
	tu.ownedNode.metaObj = tu;
	td.appendChild(tu.ownedNode);

	registerEffectNames(tu.effects);
}


var Upgrades = [
	{
		name: "unicornSelection",
		label: "Unicorn Selection",
		effects: {
			"unicornsGlobalRatio": 0.25
		}
	}
];

node = byId("workshopBlock");
for (i = 0; i < Upgrades.length; i++) {
	var upgrade = Upgrades[i];

	var div = document.createElement("div");
	var obj = createCheckbox(upgrade.label || upgrade.name, "upgrade");
	upgrade.ownedNode = obj.cbox;
	div.appendChild(obj.label);

	node.appendChild(div);

	registerEffectNames(upgrade.effects);
}


var Perks = [
	{
		name: "engeneering",
		label: "Engineering",
		effects: {
			"priceRatio": -0.01
		}
	}, {
		name: "goldenRatio",
		label: "Golden Ratio",
		effects: {
			"priceRatio": -(1 + Math.sqrt(5)) / 200 // Calculates the Golden Ratio
		}
	}, {
		name: "divineProportion",
		label: "Divine Proportion",
		effects: {
			"priceRatio": -16 / 900
		}
	}, {
		name: "vitruvianFeline",
		label: "Vitruvian Feline",
		effects: {
			"priceRatio": -0.02
		}
	}, {
		name: "renaissance",
		label: "Renaissance",
		effects: {
			"priceRatio": -0.0225
		}
	}, {
		name: "unicornmancy",
		label: "Unicornmancy",
		effects: {}
	}, {
		name: "numerology",
		label: "Numerology",
		effects: {},
		isHidden: true // meh
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
	obj = createCheckbox(perk.label || perk.name, "perk");
	perk.ownedNode = obj.cbox;
	div.appendChild(obj.label);

	if (perk.isHidden) {
		$(div).addClass("hidden");
	}

	node.appendChild(div);

	registerEffectNames(perk.effects);
}


var Time = {
	cfu: [
		{
			name: "temporalAccelerator",
			label: "Temporal Accelerator",
			effects: {
				"timeRatio": 0.05
			}
		}
	]
};

node = byId("calendar");
for (i = 0; i < Time.cfu.length; i++) {
	var cfu = Time.cfu[i];

	tr = document.createElement("tr");
	node.appendChild(tr);

	cfu.nameNode = document.createElement("td");
	cfu.nameNode.textContent = cfu.label || cfu.name;
	tr.appendChild(cfu.nameNode);

	td = document.createElement("td");
	tr.appendChild(td);

	cfu.ownedNode = createInput("cfu", 999);
	cfu.ownedNode.metaObj = cfu;
	td.appendChild(cfu.ownedNode);

	registerEffectNames(cfu.effects);
}

var lastBonfireUnicornBuilding;
var unicornBuildingsSorted = [];
for (i = 0; i < unicornBuildings.length; i++) {
	bld = unicornBuildings[i];
	unicornBuildingsSorted.push(bld);
	bld.order = i;

	if (bld.isUnicornBuilding) {
		lastBonfireUnicornBuilding = bld;
	}

	bld.$domNode = $(
		'<tr class="unicornBulding">' +
			'<td class="name"></td><td class="owned"></td>' +
			'<td class="priceUnicorns priorityCell unicorns">0</td>' +
			'<td class="priceTears priorityCell unicorns">0</td>' +
			'<td class="priceSacrifices priorityCell unicorns">0</td>' +
			'<td class="priceIvory priorityCell ivory">0</td>' +
			'<td class="timeAverage priorityCell unicorns">---</td>' +
			'<td class="timeMax priorityCell unicorns">---</td>' +
			'<td class="effGain">+0</td>' +
			'<td class="amort">---</td>' +
			'<td class="order"></td>' +
		"</tr>"
	).appendTo("#gains");
	bld.domNode = bld.$domNode[0];
	bld.childNodes = {};

	for (var j = bld.domNode.children.length - 1; j >= 0; j--) {
		var child = bld.domNode.children[j];
		var key = child.className.split(" ", 1);
		if (key) {
			bld.childNodes[key] = child;
		}
	}

	obj = createCheckbox(bld.label, "enableUnicornBuilding noReset");
	obj.label.title = "Recommend this building";
	obj.cbox.tabIndex = 2;
	obj.cbox.checked = true;

	bld.recommendNode = obj.cbox;
	bld.childNodes.name.appendChild(obj.label);

	bld.ownedNode = createInput(null, 999);
	bld.ownedNode.tabIndex = 3;
	bld.ownedNode.metaObj = bld;
	bld.childNodes.owned.appendChild(bld.ownedNode);
}

$('<tr class="bldSeperator"><td colspan="10"></td></tr>').insertAfter(lastBonfireUnicornBuilding.$domNode);

var enableAllUnicornBuildings = byId("enableAllUnicornBuildings");
enableAllUnicornBuildings.handler = function () {
	for (var i = unicornBuildings.length - 1; i >= 0; i--) {
		unicornBuildings[i].recommendNode.checked = enableAllUnicornBuildings.checked;
	}
};

$("input, select, textarea").filter(":not([tabindex])").attr("tabindex", 4);


/* function isHyperbolic(name) {
	return (name === "catnipDemandRatio" ||
		name === "fursDemandRatio" ||
		name === "ivoryDemandRatio" ||
		name === "spiceDemandRatio" ||
		name === "unhappinessRatio");
} */

function cacheEffects() {
	globalEffectsCached = {};

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
			if (bld.effects) {
				bldEffect += (bld.effects[effectName] || 0) * bld.ownedNode.parsedValue;
			}
		}

		/* if (isHyperbolic(effectName) && bldEffect < 0) {
			bldEffect = getHyperbolicEffect(bldEffect, 1.0);
		} */
		totalEffect += bldEffect;

		for (i = Religion.zu.length - 1; i >= 0; i--) {
			var zu = Religion.zu[i];
			if (zu.effects) {
				totalEffect += (zu.effects[effectName] || 0) * zu.ownedNode.parsedValue;
			}
		}

		for (i = Religion.tu.length - 1; i >= 0; i--) {
			var tu = Religion.tu[i];
			if (tu.effects) {
				totalEffect += (tu.effects[effectName] || 0) * tu.ownedNode.parsedValue;
			}
		}

		for (i = Time.cfu.length - 1; i >= 0; i--) {
			var cfu = Time.cfu[i];
			if (cfu.effects) {
				totalEffect += (cfu.effects[effectName] || 0) * cfu.ownedNode.parsedValue;
			}
		}

		/*for (i = Time.vsu.length - 1; i >= 0; i--) {
			var vsu = Time.vsu[i];
			if (vsu.effects) {
				totalEffect += (vsu.effects[effectName] || 0) * vsu.ownedNode.parsedValue;
			}
		}*/

		globalEffectsCached[effectName] = Number(totalEffect);
	}
}

var gainEffects = null;
var recommendPriority = "unicorns";

function getEffect(effectName) {
	var effect = globalEffectsCached[effectName] || 0;
	if (gainEffects) {
		effect += gainEffects[effectName] || 0;
	}
	return effect;
}

var paragonBonus = 0;
var praiseBonus = 0;

function isDarkFuture() {
	return byId("year").parsedValue - 40000 >= 0;
}

function getParagonProductionRatio() {
	var paragonRatio = 1 + getEffect("paragonRatio");

	var productionRatioParagon = (byId("paragon").parsedValue * 0.010) * paragonRatio;
	productionRatioParagon = getLimitedDR(productionRatioParagon, 2 * paragonRatio);

	var ratio = isDarkFuture() ? 4 : 1;
	var productionRatioBurnedParagon = byId("burnedParagon").parsedValue * 0.010 * paragonRatio;
	productionRatioBurnedParagon = getLimitedDR(productionRatioBurnedParagon, ratio * paragonRatio);

	return productionRatioParagon + productionRatioBurnedParagon;
}

function getPraiseProductionBonus() {
	var uncappedBonus = getUnlimitedDR(byId("praise").parsedValue, 1000) / 100;
	var transcendenceTier = byId("transcendenceTier").parsedValue;
	var solarRevolutionLimit = transcendenceTier * getMeta(Religion.tu, "blackObelisk").ownedNode.parsedValue * 0.05;
	var atheismCompletions = byId("atheismCompetions").parsedValue;

	return (getLimitedDR(uncappedBonus, 10 + solarRevolutionLimit + (atheismCompletions > 0 ? transcendenceTier : 0)) *
		(1 + getLimitedDR(atheismCompletions * 0.1, 4)));
}

function getCMBRBonus() {
	if (!byId("disableCMBR").checked) {
		return getLimitedDR(1.0, 0.2);
	}
	return 0;
}


function calcResourcePerTick(resName) {
	// BUILDING PerTickBase
	var perTick = getEffect(resName + "PerTickBase");

	// +*BEFORE PRODUCTION BOOST (UPGRADE EFFECTS GLOBAL)
	perTick *= 1 + getEffect(resName + "GlobalRatio");

	// +*BUILDINGS AND SPACE PRODUCTION
	perTick *= 1 + getEffect(resName + "Ratio");

	// +*RELIGION EFFECTS
	perTick *= 1 + getEffect(resName + "RatioReligion");

	// +*AFTER PRODUCTION BOOST (UPGRADE EFFECTS SUPER)
	perTick *= 1 + getEffect(resName + "SuperRatio");

	// *PARAGON BONUS
	perTick *= 1 + paragonBonus;

	// ParagonSpaceProductionRatio definition 1/4
	var paragonSpaceProductionRatio = 1 + paragonBonus * 0.05;

	// +BUILDING AUTOPROD
	var perTickAutoprod = getEffect(resName + "PerTickAutoprod");
		perTickAutoprod *= paragonSpaceProductionRatio;

	perTick += perTickAutoprod;

	// +*FAITH BONUS
	perTick *= 1 + praiseBonus;

	// +COSMIC RADIATION
	if (!byId("disableCMBR").checked) {
		perTick *= 1 + getCMBRBonus();
	}

	// CYCLE FESTIVAL EFFECTS

	var effects = {};
	effects[resName] = perTick;
	cycleEffectsFestival(effects);
	perTick = effects[resName];

	// +BUILDING AND SPACE PerTick
	perTick += getEffect(resName + "PerTick");

	if (byId("necrocracy").checked) {
		perTick *= (1 + (byId("sorrow").parsedValue * 0.001));
	}

	if (isNaN(perTick)) {
		return 0;
	}

	return perTick;
}

function getUnicornChanceRatio() {
	var ratio = getMeta(Perks, "unicornmancy").ownedNode.checked ? 1.1 : 1;
	ratio *= 1 + getEffect("timeRatio") * 0.25;
	return ratio;
}

function calcGains(meta) {
	if (meta) {
		gainEffects = meta.effects;
	} else {
		gainEffects = null;
	}

	var unicornsPerTick = calcResourcePerTick("unicorns");

	var unicornsPerRift = 500 * (1 + getEffect("unicornsRatioReligion") * 0.1);

	var unicornChanceRatio = getUnicornChanceRatio();
	var unicornsPerTickRifts = (getEffect("riftChance") * unicornChanceRatio) / (10000 * ticksPerDay) * unicornsPerRift;

	var effectiveUps = unicornsPerTick + unicornsPerTickRifts;

	var ivoryMeteorChance = getEffect("ivoryMeteorChance") * unicornChanceRatio;
	var averageIvoryPerMeteor = 0;
	var averageIvoryPerSecond = 0;
	if (ivoryMeteorChance > 0) {
		averageIvoryPerMeteor = (1499 * (1 + getEffect("ivoryMeteorRatio"))) / 2 + 250; // game.rand(1500) -> in in range [0, 1500) -> average 1499 and 0
		averageIvoryPerSecond = (averageIvoryPerMeteor * (ivoryMeteorChance / 10000)) / secondsPerDay;
	}

	gainEffects = null;

	return ({
		unicornsPerTick: unicornsPerTick,
		unicornsPerTickRifts: unicornsPerTickRifts,
		unicornsPerTickEffective: effectiveUps,
		unicornsPerRift: unicornsPerRift,
		averageIvoryPerMeteor: averageIvoryPerMeteor,
		averageIvoryPerSecond: averageIvoryPerSecond
	});
}


var ticksPerSecond = 5;
var ticksPerDay = 10;
var secondsPerDay = 2;
var unicornsPerSacrifice = 2500;
var tearsPerSacrifice = 1;

function calculate() {
	gainEffects = null;
	cacheEffects();

	recommendPriority = $('[name="prioritySelect"]:checked').val() || "unicorns";

	byId("effGainHeader").textContent = recommendPriority === "ivory" ? "+Eff. iPS" : "+Eff. uPS";

	var bonusText = "---";
	if (!byId("disableCMBR").checked) {
		bonusText = getDisplayValueExt(getCMBRBonus() * 100, true) + "%";
	}
	byId("CMBRBonusSpan").textContent = bonusText;

	paragonBonus = getParagonProductionRatio();

	praiseBonus = getPraiseProductionBonus();
	byId("praiseGain").textContent = getDisplayValueExt(100 * praiseBonus);

	var ziggurats = getMeta(Buildings, "ziggurat").ownedNode.parsedValue;
	tearsPerSacrifice = Math.max(ziggurats, 1);

	var currentUps = calcGains();

	var perTickBase = getEffect("unicornsPerTickBase");
	perTickBase *= 1 + getEffect("unicornsGlobalRatio");

	byId("upsBase").textContent = getDisplayValueExt(perTickBase * ticksPerSecond);
	byId("upsBuildBonus").textContent = getDisplayValueExt((getEffect("unicornsRatioReligion") * 100).toFixed()) + "%";
	byId("upsDisplay").textContent = getDisplayValueExt(currentUps.unicornsPerTick * ticksPerSecond);
	byId("upsPerRift").textContent = getDisplayValueExt(currentUps.unicornsPerRift);
	byId("upsTower").textContent = getDisplayValueExt(currentUps.unicornsPerTickRifts * ticksPerSecond);
	byId("upsEffective").textContent = getDisplayValueExt(currentUps.unicornsPerTickEffective * ticksPerSecond);

	var unicornChanceRatio = getUnicornChanceRatio();

	var avgRiftTime = "---";
	if (currentUps.unicornsPerTickRifts > 0) {
		avgRiftTime = secondsPerDay / ((getEffect("riftChance") * unicornChanceRatio) / 10000);
		avgRiftTime = toDisplaySeconds(Math.max(Math.ceil(avgRiftTime), secondsPerDay));
	}

	var ivoryMeteorChance = getEffect("ivoryMeteorChance") * unicornChanceRatio;
	var avgIvoryTime = "---";
	if (ivoryMeteorChance > 0) {
		avgIvoryTime = secondsPerDay / (ivoryMeteorChance / 10000);
		avgIvoryTime = toDisplaySeconds(Math.max(Math.ceil(avgIvoryTime), secondsPerDay));
	}

	var alicornChance = getEffect("alicornChance");
	var avgAlicornTime = "---";
	if (alicornChance > 0) {
		avgAlicornTime = secondsPerDay / (alicornChance / 100000);
		avgAlicornTime = toDisplaySeconds(Math.max(Math.ceil(avgAlicornTime), secondsPerDay));
	}

	byId("avgRiftTime").textContent = avgRiftTime;
	byId("avgIvoryTime").textContent = avgIvoryTime;
	byId("avgAlicornTime").textContent = avgAlicornTime;

	byId("ivoryMeteorAmt").textContent = currentUps.averageIvoryPerMeteor > 0 ? getDisplayValueExt(currentUps.averageIvoryPerMeteor) : "---";
	byId("ivoryPS").textContent = getDisplayValueExt(currentUps.averageIvoryPerSecond);

	var alicornPerSecond = calcResourcePerTick("alicorn") * ticksPerSecond;
	var alicornRifts = (alicornChance / 100000) / secondsPerDay;

	byId("alicornPS").textContent = getDisplayValueExt(alicornPerSecond, false, 5);
	byId("alicornEffect").textContent = getDisplayValueExt(alicornRifts, false, 5);
	byId("alicornPSEffective").textContent = getDisplayValueExt(alicornPerSecond + alicornRifts, false, 5);
	byId("alicornTCRefine").textContent = getDisplayValueExt(1 + getEffect("tcRefineRatio"));

	var recommendCount = 0;

	for (var i = unicornBuildings.length - 1; i >= 0; i--) {
		var bld = unicornBuildings[i];

		if (bld.recommendNode.checked) {
			recommendCount++;
		}
		bld.enabled = bld.recommendNode.checked && (!bld.requires || bld.requires.ownedNode.parsedValue > 0);
		// if (bld.isZigguratBuilding && ziggurats < 1) {
		// 	bld.enabled = false;
		// }

		bld.$domNode.removeClass("highlight");

		var val = bld.ownedNode.parsedValue;

		var priceRatio = bld.priceRatio;
		if (bld.name === "unicornPasture") {
			var ratioBase = priceRatio - 1;

			var ratioDiff = getEffect(bld.name + "PriceRatio") || 0;
			ratioDiff += getEffect("priceRatio") || 0;

			ratioDiff = getLimitedDR(ratioDiff, ratioBase);

			priceRatio += ratioDiff;
		}

		bld.nextPrice = {};
		for (var j = bld.prices.length - 1; j >= 0; j--) {
			var price = bld.prices[j];
			bld.nextPrice[price.name] = price.val * Math.pow(priceRatio, val);
		}

		bld.priceUnicorns = (bld.nextPrice.unicorns || 0) +
			((bld.nextPrice.tears || 0) / tearsPerSacrifice * unicornsPerSacrifice);
		bld.priceTears = (bld.nextPrice.tears || 0) +
			((bld.nextPrice.unicorns || 0) / unicornsPerSacrifice * tearsPerSacrifice);
		bld.priceSacrifices = bld.priceTears / tearsPerSacrifice;

		bld.childNodes.priceUnicorns.textContent = getDisplayValueExt(bld.priceUnicorns);
		bld.childNodes.priceSacrifices.textContent = getDisplayValueExt(bld.priceSacrifices);
		bld.childNodes.priceTears.textContent = getDisplayValueExt(bld.priceTears);
		bld.childNodes.priceIvory.textContent = bld.nextPrice.ivory ? getDisplayValueExt(bld.nextPrice.ivory) : "---";

		var timeForAvg = "---";
		var timeForMax = "---";
		if (currentUps.unicornsPerTickEffective > 0) {
			timeForAvg = toDisplaySeconds(Math.ceil(Math.max(bld.priceUnicorns / (currentUps.unicornsPerTickEffective * ticksPerSecond), 1)));
		}
		if (currentUps.unicornsPerTick > 0) {
			timeForMax = toDisplaySeconds(Math.ceil(Math.max(bld.priceUnicorns / (currentUps.unicornsPerTick * ticksPerSecond), 1)));
		}

		bld.childNodes.timeAverage.textContent = timeForAvg;
		bld.childNodes.timeMax.textContent = timeForMax;

		bld.ups = calcGains(bld);

		var amortStr = "---";
		var psGain = (bld.ups.unicornsPerTickEffective - currentUps.unicornsPerTickEffective) * ticksPerSecond;
		bld.pricePriority = bld.priceUnicorns;
		if (recommendPriority === "ivory") {
			psGain = bld.ups.averageIvoryPerSecond - currentUps.averageIvoryPerSecond;
			bld.pricePriority = bld.nextPrice.ivory || 0;
		}

		bld.childNodes.effGain.textContent = psGain > 0 ? getDisplayValueExt(psGain, true) : "---";

		bld.amortTime = Number.MAX_VALUE;
		if (psGain > 0) {
			bld.amortTime = Math.ceil(Math.max(bld.pricePriority / psGain, 1));
			amortStr = toDisplaySeconds(bld.amortTime);
		}

		bld.childNodes.amort.textContent = amortStr;
	}

	enableAllUnicornBuildings.checked = recommendCount > 0 && recommendCount === unicornBuildings.length;
	enableAllUnicornBuildings.indeterminate = recommendCount > 0 && recommendCount < unicornBuildings.length;

	$("#buyRecommendedBtn").attr("disabled", !recommendCount);

	unicornBuildingsSorted.sort(function (a, b) {
		return (b.enabled - a.enabled) || (a.amortTime - b.amortTime) || (a.pricePriority - b.pricePriority) || (a.order - b.order);
	});

	for (i = unicornBuildingsSorted.length - 1; i >= 0; i--) {
		bld = unicornBuildingsSorted[i];
		var text = bld.enabled && isFiniteTime(bld.amortTime) ? i + 1 : "---";
		bld.childNodes.order.textContent = text;
	}

	unicornBuildingsSorted[0].$domNode.toggleClass("highlight", unicornBuildingsSorted[0].enabled);

	document.body.className = document.body.className.replace(/\bpriority-\w*\b/, "priority-" + recommendPriority);
}


// event management
$(document).on("input", 'input[type="number"]', function () {
	var value = parseInput(this);
	if (this.parsedValue !== value) {
		this.parsedValue = value;
		if (this.handler) { this.handler(); }
		calculate();
	}
})
.on("change", 'select, input[type="radio"]', function () {
	calculate();
})
.on("click", 'input[type="checkbox"]:not(.collapser)', function () {
	if (this.handler) { this.handler(); }
	calculate();
});

var importDiv = byId("importDiv");

$("#showImport").click(function () {
	importDiv.classList.remove("hidden");
	$("#importError").addClass("hidden");
	byId("importSaveFile").value = "";
	byId("importData").value = "";
	byId("importData").focus();
});

$("#importCancel").click(function () {
	importDiv.classList.add("hidden");
});

$("#buyRecommendedBtn").click(function () {
	var bld = unicornBuildingsSorted[0];
	if (bld.enabled) {
		setInput(bld.ownedNode, bld.ownedNode.parsedValue + 1);
		calculate();
	}
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
	var prevStates = {};
	var noResetEles = $(".noReset").each(function () { prevStates[this.id] = this.checked; });

	document.forms[0].reset();
	noResetEles.each(function () { this.checked = prevStates[this.id]; });
	$('input[type="number"]').each(function () {
		this.parsedValue = 0;
	});
}

function importData(data) {
	if (!data || !(/\S/.test(data)) || !window.confirm("Are you sure you want to import?")) {
		return;
	}

	var resetOnError = false;
	var success = false;

	try {
		data = data.replace(/\s/g, "");
		var json = LZString.decompressFromBase64(data) || atob(data);
		if (!json) {
			throw new Error("Save data not found");
		}
		var saveData = JSON.parse(json);
		if (!saveData) {
			throw new Error("Save data not found");
		}

		resetForm();
		resetOnError = true;

		if (saveData.calendar) {
			setInput(byId("year"), saveData.calendar.year);
			byId("festival").checked = saveData.calendar.festivalDays > 0;
			if (Cycles[saveData.calendar.cycle]) {
				byId("cycleSel").value = saveData.calendar.cycle;
			}
		}

		if (saveData.challenges) {
			var saveAtheism = getMeta(saveData.challenges.challenges, "atheism");
			if (saveAtheism) {
				setInput(byId("atheismCompetions"), Math.max(Number(saveAtheism.on) || 0, saveAtheism.researched ? 1 : 0));
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
			loadMetadata(saveData.religion.zu, Religion.zu, "on");
			loadMetadata(saveData.religion.ru, Religion, "on", function (saveRU) {
				if (saveRU.name === "solarRevolution") {
					hasSolar = saveRU.on > 0;
				}
			});
			loadMetadata(saveData.religion.tu, Religion.tu, "on");

			var praise = hasSolar ? saveData.religion.faith : 0;
			setInput(byId("praise"), praise || 0);

			var transcendenceTier = saveData.religion.transcendenceTier || 0;
			if (transcendenceTier == 0 && saveData.religion.tcratio > 0) {
				transcendenceTier = Math.max(0, Math.round(Math.log(10 * getUnlimitedDR(saveData.religion.tcratio, 0.1))));
			}
			setInput(byId("transcendenceTier"), transcendenceTier);
		}

		loadMetadata(saveData.buildings, Buildings, "on");

		if (saveData.science) {
			var necrocracy = getMeta(saveData.science.policies, "necrocracy");
			if (necrocracy) {
				setInput(byId("necrocracy"), necrocracy.researched);
			}
		}

		if (saveData.time) {
			loadMetadata(saveData.time.cfu, Time.cfu, "on");
			// loadMetadata(saveData.time.vsu, Time.vsu, "on");
		}

		var saveGame = saveData.game || {};
		var CMBREnabled = Boolean(saveGame.isCMBREnabled);

		$("#CMBRBonusRow").toggleClass("hidden", !CMBREnabled);

		if (CMBREnabled && saveGame.opts) {
			CMBREnabled = !saveGame.opts.disableCMBR;
		}
		byId("disableCMBR").checked = !CMBREnabled;

		loadMetadata(saveData.resources, Resources, "value");

		importDiv.classList.add("hidden");
		success = true;

	} catch (err) {
		$("#importError").removeClass("hidden");
		if (resetOnError) {
			resetForm();
		}
		console.error(err);
		return "ERROR";

	} finally {
		calculate();
	}

	return success;
}

$("#importSaveFile").on("change", function () {
	var file = this.files[0];
	if (!file || file.type !== "text/plain") {
		return;
	}

	var reader = new FileReader();
	reader.onload = function (ev) {
		var data = ev.target.result;
		var success = importData(data);
		if (!success || success === "ERROR") {
			byId("importSaveFile").value = "";
		}
	};
	reader.readAsText(file, "utf-8");
});

$("#importSaveFileSubmit").on("click", function () {
	byId("importSaveFile").click();
});

// import save data
$("#importOK").click(function () {
	var data = byId("importData").value;
	importData(data);
});

calculate();

document.forms[0].classList.remove("hidden");
document.body.removeChild(document.getElementById("load"));

})(this, this.document, this.jQuery, this.LZString);
