# Updating data 

## Region carbon footprint 

TODO: Automate creation of `carbon.json` by parsing official carbon data from GCP.

## Prices
Use [API Exploer](https://cloud.google.com/billing/docs/reference/rest/v1/services.skus/list?authuser=0&apix_params=%7B%22parent%22%3A%22services%2F6F81-5844-456A%22%7D#try-it) to download new GCE prices (GCE: `services/6F81-5844-456A`)

TODO: Automate creation of `prices.json` by calling the GCP Billing API.