document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup script loaded");

    var captureButton = document.getElementById('captureButton');
    var removeAllButton = document.getElementById('removeAllButton'); 
    var recentURLsTable = document.getElementById('recentURLs').getElementsByTagName('tbody')[0];
    var capturedURLs = JSON.parse(localStorage.getItem('capturedURLs')) || [];
    
    for (var i = 0; i < 5; i++) {
        var newRow = recentURLsTable.insertRow();
        var urlCell = newRow.insertCell(0);
        var predictionCell = newRow.insertCell(1);
    }

    captureButton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTab = tabs[0];
            const url = currentTab.url;
            console.log("Current tab URL:", url);
            
            fetch('https://flaskurlanalysis-protego.onrender.com/process_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url
             })
            })

            .then(response => response.json())
            .then(data => { 
                console.log("Prediction result:", data.prediction);
                capturedURLs.push({url: url, prediction: data.prediction}); 
                localStorage.setItem('capturedURLs', JSON.stringify(capturedURLs)); 
                updateRecentURLs(url, data.prediction); 
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    removeAllButton.addEventListener('click', function() {
        localStorage.removeItem('capturedURLs');
        capturedURLs = []; 
        for (var i = 0; i < 5; i++) {
            recentURLsTable.rows[i].cells[0].textContent = '';
            recentURLsTable.rows[i].cells[1].textContent = '';
        }
    });
    
    capturedURLs.forEach(function(urlObj) {
        updateRecentURLs(urlObj.url, urlObj.prediction);
    });

    function updateRecentURLs(url, prediction) {
        var rows = recentURLsTable.getElementsByTagName('tr');
        for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].getElementsByTagName('td');
            if (cells[0].textContent === '') {
                cells[0].textContent = url;
                cells[1].textContent = prediction;

                if(prediction ==="Potentially dangerous"){  
                    cells[1].style.color="red";
                }else if(prediction ==="Safe website"){
                    cells[1].style.color="green";
                }
                return;
            }
        }
    }
});
