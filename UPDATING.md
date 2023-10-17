# Updating data 

## Adding new regions

1. Open the file [`data/regions.json`](data/regions.json)
2. Add the new regions:
 * Use Google Search to find the coordinates
 * Look for the flag on wikipedia, copy the URL of the SVG image, it must star with `https://upload.wikimedia.org/` and end with `.svg`

## Region carbon footprint 

The carbon data comes from the officially published GCP carbon data [on GitHub](https://github.com/GoogleCloudPlatform/region-carbon-info)

To update to the latest yearly data:

1. Make sure the new yearly data is present in a new `.csv` file [in the official repo](https://github.com/GoogleCloudPlatform/region-carbon-info/tree/main/data/yearly)
2. Update [`index.js`](index.js#L56) to point at this new CSV file.

## Prices

Prices are currently based on the SKUs for Google Compute Engine E2 Instance Core.

To update to the latest pricing data:

1. Open the Cloud Console
2. Click Billing > Pricing
3. Select "View all SKUs"
4. Filter the table with: 
  * `Service ID:6F81-5844-456A` 
  * `Product taxonomy:GCP > Compute > GCE > VMs On Demand > Cores: Per Core`
  * `SKU Description:E2 Instance Core`
5. Display the column `Geo taxonomy regions`.
6. Select the table using your mouse, copy the selection. (Do not try to use the Download icon, it doesn't download the currently displayed data)
7. Create a new Google Sheet, and paste the selection.
6. Manually copy all prices into [`data/prices.json`](data/prices.json)  

*TODO: instead of manually copying prices, export the sheet as CSV and parse the CSV ([issue](https://github.com/GoogleCloudPlatform/region-picker/issues/17))*

Alternatively, get the Google Compute Engine E2 Core prices [from the documentation](https://cloud.google.com/compute/all-pricing#e2_machine-types).

## Countries

The list of countries and their coordinates is taken from [this page](https://developers.google.com/public-data/docs/canonical/countries_csv), converted to JSON using [this online tool](https://www.convertcsv.com/csv-to-json.htm).

## Products

* Open https://cloud.google.com/about/locations
* Open the browser console
* Copy the code from [`parsers/locations/about-locations-parser.js`](parsers/locations/about-locations-parser.js) 
* Hit Enter
* Copy the output and paste it into [`data/products.json`](data/products.json)
