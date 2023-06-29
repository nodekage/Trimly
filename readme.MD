# TRIMLY

Trimly is a web application that allows you to shorten long URLs into more compact and manageable short URLs. It provides an API for creating short URLs, tracking click counts, and generating QR codes.

## Features

- Shorten long URLs into compact short URLs
- Customizable short URLs
- Tracks the number of clicks on each short URL
- Generates QR codes for short URLs
- Rate limiting to prevent abuse

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Redis (with Node Redis)
- Swagger (for API documentation)
- QRCode (for generating QR codes)
- Express Rate Limit (for rate limiting)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/nodekage/Trimly.git

2. Install the dependencies:

   ```bash
   cd trimly
   npm install

3. Set up the environment variables:

   ```bash
   cp .env.example .env

4. Start the server:

   ```bash
    npm run devStart

    The server will start running on http://localhost:8900.


# API Documentation

The API documentation is available using Swagger UI. Once the server is running, you can access the API documentation at http://localhost:8900/api-docs.

The API provides the following endpoints:

 ```bash

  GET /: Renders the home page with the list of short URLs.

  GET /:test: Redirects to the original URL corresponding to the given short URL.

  POST /shortUrls: Creates a short URL for the provided long URL. Accepts JSON payload with fullUrl and optional customUrl. 


## Usage

Access the home page (http://localhost:8900) to view the list of short URLs.

To create a short URL, send a POST request to http://localhost:8900/shortUrls with the following JSON payload:

 ```bash
 {
  "fullUrl": "https://example.com/long-url",
  "customUrl": "custom"
}

Replace the fullUrl and customUrl values with your desired URLs. If customUrl is not provided, a random short URL will be generated.

The API will respond with a redirect to the home page after successfully creating the short URL.

You can click on the short URL to be redirected to the original long URL.

Access the API documentation at http://localhost:8900/api-docs for more details on the API endpoints.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.