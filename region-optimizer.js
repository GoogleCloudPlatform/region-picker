/*
Copyright 2021 Google LLC

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

let regions; 
let carbonData;
let priceData;
let latencyData;
let details;

const normalizedSuffix = "_nornalized";
const cfeAttr = "carbon_free_percent";
const carbonIntensityAttr = "gCO2_kWh";
const priceAttr = "gce";
const distanceAttr = "distance";

async function fetchData() {
    // TODO: fetch these in parrallel.
    await fetch("data/regions.json")
    .then(data => data.json())
    .then(json => regions = json);

    await fetch("data/carbon/data/yearly/2019.csv")
    .then(data => data.text())
    .then(text => parseCarbonCSV(text));

    await fetch("data/prices.json")
    .then(data => data.json())
    .then(json => priceData = json);

    await fetch("data/details.json")
    .then(data => data.json())
    .then(json => details = json);
}

/**
 * Parse CSV file from https://github.com/GoogleCloudPlatform/region-carbon-info/ 
 * @param {String} text : CSV file as a string. First row is title, next rows are 'region', 'name', 'CFE', 'intensity'.
 */
function parseCarbonCSV(text) {
    // First split each newlines, then split comma. 
    let rows = text.split('\r\n').map(row => row.split(','));

    carbonData = {};
    for(let r = 1; r < rows.length; r++) {
        let row = rows[r];

        let regionCarbonData = {};
        regionCarbonData[carbonIntensityAttr] = parseInt(row[3], 10)
        let cfe = parseFloat(row[2]);
        if(cfe){
            regionCarbonData[cfeAttr] = cfe;
        }

        carbonData[row[0]] = regionCarbonData;
    };
} 

function normalizeData() {
    normalizeAttributes(carbonData, cfeAttr);
    normalizeAttributes(carbonData, carbonIntensityAttr);
    normalizeAttributes(priceData, priceAttr);
}

function distance(destination, origin) {
    // Thanks https://www.movable-type.co.uk/scripts/latlong.html
    const R = 6371e3; // metres
    const φ1 = origin.latitude * Math.PI/180; // φ, λ in radians
    const φ2 = destination.latitude * Math.PI/180;
    const Δφ = (destination.latitude - origin.latitude) * Math.PI/180;
    const Δλ = (destination.longitude - origin.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return  R * c; // in metres
}

/**
 * Normalizes a certain attribute of the given region map.
 * Creates a new attribute "ATTRIBUTE_nornalized".
 * @param {Object} map: a map of <region, data>
 * @param {String} attribute: the attribute in data to normalize against
 */
function normalizeAttributes(map, attribute) {
    let min = Infinity;
    let max = -Infinity;
    for (const region in map) {
        let value = map[region][attribute];
        if(value > max) {
            max = value;
        }
        if(value < min) {
            min = value;
        }
    }
    for (const region in map) {
        if(map[region][attribute]) {
            map[region][attribute + normalizedSuffix] = (map[region][attribute] - min) / (max - min)
        }
    }
}

function rankRegions(inputs) {
    let results = [];

    // If latency is a criteria and some locations have been specified,
    // score each region based on proximity to locations.
    if(inputs.weights.latency > 0 && inputs.locations.length > 0) {
        latencyData = {};
        for(const region of regions) {
            let d = 0;
            for(const location of inputs.locations) {
                d += distance(location, details[region]);
            }
            latencyData[region] = {distance: d};
        }
        normalizeAttributes(latencyData, distanceAttr);
    }

    for(const region of regions) {
        let score = 0;
        // price: lower is better
        score += (1 - priceData[region]?.[priceAttr + normalizedSuffix]) * inputs.weights.price;
        // carbon
        if(carbonData[region]?.[cfeAttr] !== undefined) {
            // CFE: higher is better
            score+= carbonData[region]?.[cfeAttr + normalizedSuffix] * inputs.weights.carbon;
        } else {
            // Carbon Intensity: Lower is better
            score+= (1 - carbonData[region]?.[carbonIntensityAttr + normalizedSuffix]) * inputs.weights.carbon;
        }
        


        if(inputs.locations.length > 0) {
            // latency: lower is better
            score += (1 - latencyData?.[region]?.[distanceAttr + normalizedSuffix]) * inputs.weights.latency;
        }

        if(!isNaN(score))
        results.push({
            region: region,
            name: details[region].name,
            score: score,
        });
    }

    let resultSorted = results.sort(function(a, b) {
        return b.score - a.score;
    });

    return resultSorted;
}

/*
@param inputs: {
    weights: {
        latency: 0.5,
        price: 0.5
        carbon: 0.5
    },
    locations: [
        {latitude, longitude}
    ],
    currentLocationLatencies: {
        'us-central1': 0.2
    }
}
@return [{
        region: 'us-central1',
        name: '' 
        score: 0.2
    }]
*/
async function regionOptimizer(inputs) {
    if(!regions || !!carbonData || !priceData) {
        await fetchData();
        normalizeData();
        console.log('Fetched and noralized data:')
        console.log({carbonData, priceData, regions, details});
    }

	console.log('Optimizing with inputs:');
    console.log(inputs);

    return rankRegions(inputs);
}

export {regionOptimizer}