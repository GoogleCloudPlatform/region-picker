# Updating data 

## Region carbon footprint 

See official GCP carbon data [on GitHub](https://github.com/GoogleCloudPlatform/region-carbon-info). 

TODO: Automate creation of `carbon.json` by fetching and parsing official `.csv`.

## Prices

`prices.json` is a manual copy of [Google Compute Engine E2 CPU prices](https://cloud.google.com/compute/all-pricing#e2_machine-types) 

TODO: Automate creation of `prices.json` by calling the GCP Billing API. See how to do so using [API Explorer](https://cloud.google.com/billing/docs/reference/rest/v1/services.skus/list?authuser=0&apix_params=%7B%22parent%22%3A%22services%2F6F81-5844-456A%22%7D#try-it) (GCE: `services/6F81-5844-456A`)

## Countries

The list of countries and their coordinates is taken from [this page](https://developers.google.com/public-data/docs/canonical/countries_csv), converted to JSON using [this online tool](https://www.convertcsv.com/csv-to-json.htm).
