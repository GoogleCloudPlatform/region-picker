# Updating data 

## Adding a new region

1. Open the file [`data/regions.js`](data/regions.js)
2. Add the new region

## Region carbon footprint 

The carbon data is copied from the official GCP carbon data [on GitHub](https://github.com/GoogleCloudPlatform/region-carbon-info)

To update to the latest yearly data:

1. Make sure the new yearly data is present in a new `.csv` file [in the official repo](https://github.com/GoogleCloudPlatform/region-carbon-info/tree/main/data/yearly)
2. Update [`index.js`](index.js#L56) to point at this new CSV file.

## Prices

Prices are currently based on the SKUs for Google Compute Engine E2 Instance Core.

To update to the latest pricing data:

1. Open the Cloud Console
2. Click Billing > Pricing
3. Select "View all SKUs"
4. Filter the table with "SKU Description:E2 Instance Core"
5. Manually copy all prices into [`data/prices.json`](data/prices.json)  

Alternatively, get the Google Compute Engine E2 Core prices [from the documentation](https://cloud.google.com/compute/all-pricing#e2_machine-types).

## Countries

The list of countries and their coordinates is taken from [this page](https://developers.google.com/public-data/docs/canonical/countries_csv), converted to JSON using [this online tool](https://www.convertcsv.com/csv-to-json.htm).
