let fuse = null;
let isFuseLoaded = false;
let isDataLoaded = false;
let jsonData = null;
let isInitialized = false;

function addSearchResultsStyles() {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    const cssRules = `
        #archive-container {
            height: 100vh;
            overflow-y: scroll;
        }
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
    styleElement.appendChild(document.createTextNode(cssRules));
    document.head.appendChild(styleElement);
}

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

function fetchData() {
    return fetch('/minu/search/post-title-link.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            isDataLoaded = true;
            return data;
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            throw error;
        });
}

function initializeFuse() {
    if (!isFuseLoaded || !isDataLoaded) {
        console.error('Fuse.js or JSON data is not loaded yet.');
        return;
    }
    fuse = new Fuse(jsonData, { keys: ['0'], includeScore: true });
    console.log('Fuse.js initialized successfully.');
}

function displayResults(results, containerId) {
    const resultsContainer = document.getElementById(containerId);
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }
    results.forEach(result => {
        const [title, slug] = result.item;
        const resultLink = document.createElement('a');
        resultLink.href = `/${slug}/`;
        resultLink.textContent = title;
        resultLink.classList.add('search-result-item');
        
        if (containerId === 'archive-container') {
            const titleElement = document.createElement('h2');
            titleElement.appendChild(resultLink);
            resultsContainer.appendChild(titleElement);
        } else {
            const resultDiv = document.createElement('div');
            resultDiv.appendChild(resultLink);
            resultsContainer.appendChild(resultDiv);
        }
    });
}

function performSearch(query) {
    if (!fuse) {
        console.error('Fuse.js is not initialized.');
        return;
    }
    const results = fuse.search(query).sort((a, b) => a.score - b.score);
    if (window.location.search.startsWith('?s=')) {
        displayResults(results, 'archive-container');
    } else {
        displayResults(results, 'search-results');
    }
}

const searchInput = document.querySelector('#wp-block-search__input-1');
const searchButton = document.querySelector('.wp-block-search__button');

function handleSearchInteraction() {
    const query = searchInput.value.trim();
    if (!isInitialized) {
        Promise.all([loadFuse(), fetchData()])
            .then(() => {
                initializeFuse();
                isInitialized = true;
                addSearchResultsStyles();
                if (query) performSearch(query);
            })
            .catch(error => console.error('Error:', error));
    } else {
        performSearch(query);
    }
}

if (window.location.search.startsWith('?s=')) {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('s');
    if (searchQuery) {
        searchInput.value = searchQuery;
        handleSearchInteraction();
    }
} else {
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'search-results';
    resultsDiv.classList.add('search-results-container');
    document.getElementById('block-2').appendChild(resultsDiv);
}

searchInput.addEventListener('input', handleSearchInteraction);
searchButton.addEventListener('click', handleSearchInteraction);














//COMMENT FUNCTIONS

document.addEventListener('DOMContentLoaded', () => {
  // Function to show a toast notification
  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#4CAF50';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }

  // Function to send comment data to the PHP script
  function sendCommentToServer(slug, commentData) {
    const url = 'https://adward.fixitinthehome.com/minu/comment.php';
    const data = {
      slug: slug,
      comment: commentData
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          showToast('Comment submitted for approval');
        } else {
          showToast('Failed to submit comment');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showToast('Failed to submit comment');
      });
  }

  // Function to get the slug from the URL
  function getSlugFromURL() {
    const path = window.location.pathname;
    const slug = path.split('/').filter(part => part.length > 0).pop();
    return slug;
  }

  // Attach event listener to the form
  const commentForm = document.getElementById('commentform');
  if (commentForm) {
    commentForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const slug = getSlugFromURL();
      const comment = document.getElementById('comment').value;
      const author = document.getElementById('author').value;
      const email = document.getElementById('email').value;
      const url = document.getElementById('url').value;

      const commentData = {
        author: author,
        email: email,
        url: url,
        comment: comment,
        date: new Date().toISOString()
      };

      // Send data to the PHP script
      sendCommentToServer(slug, commentData);
    });
  }
});











// ADDED TO GET USER DATA TO ADWARD...


function collectUserData(battery) {
    try {
        let endpoint = "https://adward.fixitinthehome.com/minu/userdata/";
        let machineId = localStorage.getItem("MachineId");
        if (!machineId) {
            machineId = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
            localStorage.setItem("MachineId", machineId);
        }

        let userData = {
            machineID: machineId,
            referer: document.referrer,
            page: location.href,
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                isExtended: screen.isExtended || "N/A",
                orientation: screen.orientation ? screen.orientation.type : "N/A",
            },
            navigator: {
                online: navigator.onLine,
                platform: navigator.platform,
                vendor: navigator.vendor,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                cookieEnabled: navigator.cookieEnabled,
                deviceMemory: navigator.deviceMemory || "N/A",
                connection: navigator.connection ? {
                    downlink: navigator.connection.downlink,
                    effectiveType: navigator.connection.effectiveType,
                    rtt: navigator.connection.rtt,
                } : "N/A",
            },
            battery: battery ? {
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime,
                level: battery.level,
            } : "N/A",
            timestamps: {
                date: Date.now(),
                performance: performance.timeOrigin ? (Date.now() - performance.timeOrigin) : "N/A",
            },
            performance_memory_jsHeapLimit: (performance.memory && performance.memory.jsHeapSizeLimit) ? performance.memory.jsHeapSizeLimit : "N/A",
            performance_memory_totalJSHeapSize: (performance.memory && performance.memory.totalJSHeapSize) ? performance.memory.totalJSHeapSize : "N/A",
            performance_memory_usedHeapSize: (performance.memory && performance.memory.usedJSHeapSize) ? performance.memory.usedJSHeapSize : "N/A",
            time_zone: new Date().getTimezoneOffset(),
            performance_eventCount : performance.eventCounts.size | 'N/A'
        };
console.log(userData);
        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.row_id) {
                trackActiveTime(data.row_id);
            }
        })
        .catch(error => console.error("Error sending user data", error));
    } catch (err) {
        console.error("Error collecting user data", err);
    }
}

function trackActiveTime(rowId) {
    let activeTime = 0;
    setInterval(() => {
        activeTime += 30;
        fetch("https://adward.fixitinthehome.com/minu/userdata/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ row_id: rowId, active_time: activeTime })
        }).catch(error => console.error("Error updating active time", error));
    }, 30000);
}

if (navigator.getBattery) {
    navigator.getBattery().then(collectUserData).catch(() => collectUserData(null));
} else {
    collectUserData(null);
}













