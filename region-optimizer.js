/*
Copyright 2020 Google LLC
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

let carbonData;
let priceData;

async function fetchData() {
    await fetch("data/carbon.json")
    .then(data => data.json())
    .then(json => carbonData = json);

    await fetch("data/prices.json")
    .then(data => priceData = data.json())
    .then(json => priceData = json);
}

/*
@param inputs: {
    weights: {
        latency: 0.5,
        price: 0,5
        carbon: 0.5
    },
    locations: [
        {lat, long}
    ],
    currentLocationLatencies: {
        'us-central1': 0.2
    }
}
@return [{
        region: 'us-central1'
    }]
*/
async function regionOptimizer(inputs) {
    if(!carbonData || !priceData) {
        await fetchData();
    }
    console.log({carbonData, priceData});

	console.log('Optimizing...');
	return [];
}

export {regionOptimizer}