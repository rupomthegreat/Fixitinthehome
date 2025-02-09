let fuse = null; // To store the Fuse instance
let isFuseLoaded = false; // To track if Fuse.js is loaded
let isDataLoaded = false; // To track if JSON data is loaded
let jsonData = null; // To store the fetched JSON data
// Function to create and append the style element to the head
function addSearchResultsStyles() {
    // Create a <style> element
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';

    // Define the CSS rules
    const cssRules = `
        .search-results-container {
            max-height: 60vh !important;
            overflow-y: scroll;
            background: #fff7ec;
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #ddd;
        }

        .search-result-item {
            display: block;
            padding: 5px;
            color: #0073aa;
            text-decoration: none;
        }

        .search-result-item:hover {
            text-decoration: underline;
        }
    `;

    // Add the CSS rules to the <style> element
    if (styleElement.styleSheet) {
        // For IE8 and below
        styleElement.styleSheet.cssText = cssRules;
    } else {
        // For modern browsers
        styleElement.appendChild(document.createTextNode(cssRules));
    }

    // Append the <style> element to the <head>
    document.head.appendChild(styleElement);
}


// Function to load Fuse.js dynamically
function loadFuse() {
    return new Promise((resolve, reject) => {
        if (isFuseLoaded) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fuse.js/6.4.6/fuse.min.js';
        script.onload = () => {
            isFuseLoaded = true;
            resolve();
        };
        script.onerror = () => reject('Failed to load Fuse.js');
        document.body.appendChild(script);
    });
}

// Function to fetch JSON data
function fetchData() {
    return fetch('/minu/search/post-title-link.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data; // Store the JSON data
            isDataLoaded = true;
            return data;
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            throw error;
        });
}

// Function to initialize Fuse.js with the data
function initializeFuse() {
    if (!isFuseLoaded || !isDataLoaded) {
        console.error('Fuse.js or JSON data is not loaded yet.');
        return;
    }
    fuse = new Fuse(jsonData, {
        keys: ['0'], // Search in the title (index 0 of each sub-array)
        includeScore: true,
    });
    console.log('Fuse.js initialized successfully.');
}

// Function to display search results
function displayResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }

    results.forEach(result => {
        const [title, slug] = result.item;
        const resultLink = document.createElement('a');
        resultLink.href = `/${slug}/`; // Set href to the slug
        resultLink.textContent = title; // Set link text to the title
        resultLink.classList.add('search-result-item');

        const resultDiv = document.createElement('div');
        resultDiv.appendChild(resultLink);
        resultsContainer.appendChild(resultDiv);
    });
}

// Function to perform the search
function performSearch(query) {
    if (!fuse) {
        console.error('Fuse.js is not initialized.');
        return;
    }

    const results = fuse.search(query);

    // Sort results by score (most relevant first)
    results.sort((a, b) => a.score - b.score);

    // Display the results
    displayResults(results);
}

// Create a div to display search results
const resultsDiv = document.createElement('div');
resultsDiv.id = 'search-results';
resultsDiv.classList.add('search-results-container');
document.getElementById('block-2').appendChild(resultsDiv);

// Add input event listener to the search input
const searchInput = document.querySelector('#wp-block-search__input-1');
const searchButton = document.querySelector('.wp-block-search__button');

let isInitialized = false; // To track if Fuse.js and JSON are loaded

function handleSearchInteraction() {
    const query = searchInput.value.trim();

    if (!isInitialized) {
        // Load Fuse.js and fetch JSON data only once
        Promise.all([loadFuse(), fetchData()])
            .then(() => {
                initializeFuse(); // Initialize Fuse.js with the data
                isInitialized = true;
                 // Call the function to add the styles
                 addSearchResultsStyles();
                if (query) {
                    performSearch(query); // Perform the search after initialization
                }
            })
            .catch(error => console.error('Error:', error));
    } else if (query) {
        performSearch(query); // Perform the search if already initialized
    } else {
        // Clear results if the input is empty
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
    }
}

// Add event listeners for input and button click
searchInput.addEventListener('input', handleSearchInteraction);
searchButton.addEventListener('click', handleSearchInteraction);