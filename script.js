const axios = require('axios');
const cheerio = require('cheerio');

// Step 1: Scrape disease names and details URLs
const url = "https://www.1mg.com/all-diseases";

axios.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
})
    .then(response => {
        const $ = cheerio.load(response.data);
        const diseaseList = [];
        // console.log(response.data);

        $('.style__product-name___HASYw').each((index, element) => {
            // console.log(element)
            const diseaseName = $(element).text().trim();
            const detailsUrl = $(element).attr('href');
            diseaseList.push({ name: diseaseName, detailsUrl: detailsUrl });
        });
        console.log(diseaseList)
        // Step 2: Scrape additional details from each disease's details URL
        return Promise.all(diseaseList.map(disease => axios.get(disease.detailsUrl)));
    })
    .then(detailsResponses => {
        const diseaseList = detailsResponses.map((detailsResponse, index) => {
            const detailsSoup = cheerio.load(detailsResponse.data);
            const disease = { name: diseaseList[index].name };

            // Extract additional details as needed and populate the 'disease' object

            // Example: Extracting overview
            const overview = detailsSoup('div.overview-section').text().trim();
            disease.overview = overview || null;

            // You need to repeat this process for each data point you want to scrape

            return disease;
        });

        // Print the collected data
        diseaseList.forEach(disease => {
            console.log(`Disease Name: ${disease.name}`);
            console.log(`Overview: ${disease.overview || 'N/A'}`);
            // Print other data points similarly

            console.log("\n" + "=".repeat(50) + "\n");  // Separator for better readability
        });
    })
    .catch(error => {
        console.error("Error during scraping:", error);
    });
