/*
Copyright 2023 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function extractLocations(headerRow) {
	const headerCells = headerRow.querySelectorAll("th");
	const locations = [];
	for (const cell of headerCells) {
		const text = cell.textContent.trim();
		if(text != "Products") {
			// extract "europe-west1" from "Belgium (europe-west1)    Low CO2"
			const match = text.match(/\((.*)\)/);
			if(match) {
				const region = match[1];
				locations.push(region);
			} else {
				console.error(`Cannot extract region for ${text}`);
			}
		}
	}
	return locations;
}

function extractProductAvailability(row) {

	const tHeader = row.querySelector("th");
	if (!tHeader) {
		console.error('Cannot extract product name');
		return;
	}

	let	product = tHeader.textContent.trim();

	// if product ends with a digit, remove it. (These are footnotes)
	while(product.match(/.*\d/) || product.match(/.*,/)) {
		product = product.slice(0, -1).trim();
	}

	const availability = [];
	const cells = row.querySelectorAll("td");
	if(cells.length === 0) {
		return;
	}
	for (const cell of cells) {
		// check if cell contains a <span> with aria-label="available"
		const available = cell.querySelector("span[aria-label='available']");
		if (available) {
			availability.push(true);
		} else {
			availability.push(false);
		}
	}
	return {product, availability};
}

function extractDataForContinent(continentDOM, data) {
	const rows = continentDOM.querySelectorAll("tr");

	const locations = extractLocations(rows[0]);
	
	for (let i = 1; i < rows.length; i++) {
		const productAvailability = extractProductAvailability(rows[i]);
		if(productAvailability) {
			let {product, availability} = productAvailability;
			if(!data[product]) {
				data[product] = {};
			}
			for (let l = 0; l < locations.length; l++) {
				data[product][locations[l]] = availability[l];
			}
		}
	}
}

/* 
	return:
	{
		"product1": {
			"region1": true,
			"region2": false,
			...
		},
		...
	}
*/

function parseAboutLocations(document) {
	const data = {};

	const continents = document.querySelectorAll(".cloud-table");

	// The last tab is "multi region"
	for (let c = 0; c < continents.length - 1; c++) {
		extractDataForContinent(continents[c], data);
	}

	return data;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function getLocationsJSONFile() {
	const parsed = parseAboutLocations(document);
	console.log(parsed);
	const json = JSON.stringify(parsed, null, 2);
	//console.log(json);

	download("products.json", json);
}

getLocationsJSONFile();

