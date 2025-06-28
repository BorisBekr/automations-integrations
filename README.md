# automations-integrations
Personal hub for all things AI automation & integration

# Google Maps Lead Scraper - Apify UI

A clean, minimalistic frontend interface for scraping business leads from Google Maps using Apify and N8n automation.

## Features

- **Apify-styled UI**: Beautiful interface matching Apify's visual design language
- **Simple Form**: Three required fields for easy lead generation
- **N8n Integration**: Connects to N8n webhook workflow for processing
- **CSV Export**: Automatically generates and downloads CSV files with lead data
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Setup Instructions

### 1. Frontend Setup

1. Host the three files (`index.html`, `styles.css`, `script.js`) on your web server
2. Update the webhook URL in `script.js`:
   ```javascript
   const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/google-maps-leads';
   ```

### 2. N8n Workflow Setup

1. Import the `n8n-webhook-workflow.json` into your N8n instance
2. Update the Apify API token in two nodes:
   - "Start Google Maps Scraping" node
   - "Get Scraping Results" node
   
   Replace `YOUR_APIFY_TOKEN` with your actual Apify API token

3. Activate the workflow in N8n
4. Copy the webhook URL from the "Webhook Trigger" node

### 3. Apify Setup

1. Create an Apify account at https://apify.com
2. Get your API token from Account Settings
3. Ensure you have sufficient credits for the Google Maps scraper

## How It Works

1. User fills out the form with:
   - Search query (e.g., "coffee shop", "dentist")
   - Location (e.g., "New York, USA")
   - Number of results (1-1000)

2. Form submission triggers the N8n webhook

3. N8n workflow:
   - Calls Apify's Google Maps scraper
   - Waits for scraping to complete
   - Formats the results
   - Converts to CSV
   - Returns the file

4. User receives a downloadable CSV with:
   - Business Name
   - Address
   - Phone
   - Email
   - Website
   - Review Score & Count
   - Categories
   - Google Maps URL
   - And more...

## Customization

### Styling
- Colors and styles are defined in `styles.css`
- Main brand color: `#FF4A00` (Apify orange)
- Modify spacing, fonts, and colors as needed

### Form Fields
- Add or modify form fields in `index.html`
- Update the corresponding data handling in `script.js`
- Ensure N8n workflow handles new fields

### Webhook Response
- The workflow returns a CSV file by default
- Can be modified to return JSON or other formats
- Update the response handling in `script.js` accordingly

## Troubleshooting

### CORS Issues
The N8n webhook is configured with CORS headers. If you still face issues:
1. Check N8n webhook node settings
2. Ensure `Access-Control-Allow-Origin` is set to `*` or your specific domain

### Timeout Errors
Google Maps scraping can take 30-60 seconds. If timeouts occur:
1. Increase timeout in N8n HTTP Request nodes
2. Adjust the wait time in the "Wait for Scraping" node

### No Results
If the CSV is empty:
1. Check Apify API token is valid
2. Verify search query and location format
3. Check Apify account has sufficient credits

## License

This project is created for demonstration purposes. Please ensure you comply with Google Maps' terms of service and Apify's usage policies when scraping data.
