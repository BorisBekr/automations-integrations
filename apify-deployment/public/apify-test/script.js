// Configuration
const N8N_WEBHOOK_URL = 'https://n8n.lukasbekr.com/webhook/google-maps-leads'; // Update this with your N8n webhook URL
const MAX_RESULTS = 50;
const MAX_RUNS = 3;

// DOM Elements
const form = document.getElementById('leadForm');
const successMessage = document.getElementById('successMessage');
const downloadSection = document.getElementById('downloadSection');
const downloadLink = document.getElementById('downloadLink');
const errorMessage = document.getElementById('errorMessage');
const ctaSection = document.getElementById('ctaSection');
const submitButton = form.querySelector('.submit-button');
const numberOfResultsInput = document.getElementById('numberOfResults');
const resultsWarning = document.getElementById('resultsWarning');
const usageCounter = document.getElementById('usageCounter');
const remainingRunsSpan = document.getElementById('remainingRuns');
const usageLimitWarning = document.getElementById('usageLimitWarning');

// Usage tracking
let remainingRuns = parseInt(localStorage.getItem('remainingRuns')) || MAX_RUNS;

// Initialize usage counter
function updateUsageCounter() {
    remainingRunsSpan.textContent = remainingRuns;
    
    if (remainingRuns <= 0) {
        form.style.display = 'none';
        usageCounter.style.display = 'none';
        usageLimitWarning.classList.remove('hidden');
        return false;
    }
    
    // Update counter color based on remaining runs
    if (remainingRuns === 1) {
        usageCounter.style.background = 'linear-gradient(135deg, #fef2f2 0%, #fff3cd 100%)';
        usageCounter.style.borderColor = '#ffeaa7';
        usageCounter.style.color = '#856404';
    }
    
    return true;
}

// Validate number of results input
function validateResultsInput() {
    const value = parseInt(numberOfResultsInput.value);
    
    if (value > MAX_RESULTS) {
        numberOfResultsInput.value = MAX_RESULTS;
        resultsWarning.classList.remove('hidden');
        setTimeout(() => {
            resultsWarning.classList.add('hidden');
        }, 3000);
    } else {
        resultsWarning.classList.add('hidden');
    }
}

// Add input validation listeners
numberOfResultsInput.addEventListener('input', validateResultsInput);
numberOfResultsInput.addEventListener('blur', validateResultsInput);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUsageCounter();
});

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check if user has remaining runs
    if (remainingRuns <= 0) {
        showErrorMessage('You have reached the maximum number of free searches');
        return;
    }
    
    // Validate results input
    validateResultsInput();
    
    // Get form data
    const formData = {
        searchQuery: document.getElementById('searchQuery').value,
        location: document.getElementById('location').value,
        numberOfResults: parseInt(numberOfResultsInput.value)
    };
    
    // Validate form data
    if (!formData.searchQuery || !formData.location || !formData.numberOfResults) {
        showErrorMessage('Please fill in all required fields');
        return;
    }
    
    if (formData.numberOfResults > MAX_RESULTS) {
        showErrorMessage(`Maximum ${MAX_RESULTS} results allowed`);
        return;
    }
    
    try {
        // Reset UI states
        hideAllStates();
        disableForm(true);
        
        // Show loading state
        showSuccessMessage('Processing your request...');
        
        // Decrement remaining runs and save to localStorage
        remainingRuns--;
        localStorage.setItem('remainingRuns', remainingRuns.toString());
        updateUsageCounter();
        
        // Make API call to N8n webhook
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response is CSV (binary)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/csv')) {
            // Get the CSV blob directly
            const csvBlob = await response.blob();
            
            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `google-maps-leads-${new Date().toISOString().split('T')[0]}.csv`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // Convert blob to text for our showDownloadSection function
            const csvText = await csvBlob.text();
            showDownloadSection(csvText, filename);
            
        } else {
            // Fallback: try to parse as JSON (for other response formats)
            try {
                const result = await response.json();
                
                if (result.success && result.csvData) {
                    const filename = `google-maps-leads-${new Date().toISOString().split('T')[0]}.csv`;
                    showDownloadSection(result.csvData, filename);
                } else if (result.downloadUrl) {
                    downloadLink.href = result.downloadUrl;
                    downloadLink.download = `google-maps-leads-${new Date().toISOString().split('T')[0]}.csv`;
                    showDownloadSection();
                } else {
                    throw new Error('Unexpected response format');
                }
            } catch (jsonError) {
                throw new Error('Unable to process response data');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(error.message || 'Failed to process request');
        
        // Restore the run count if there was an error
        remainingRuns++;
        localStorage.setItem('remainingRuns', remainingRuns.toString());
        updateUsageCounter();
    } finally {
        disableForm(false);
    }
});

// UI Helper Functions
function hideAllStates() {
    successMessage.classList.add('hidden');
    downloadSection.classList.add('hidden');
    ctaSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function showSuccessMessage() {
    successMessage.classList.remove('hidden');
}

function showDownloadSection(csvData, filename = 'google-maps-leads.csv') {
    // Hide loading state
    hideAllStates();
    
    // Create blob and download URL
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Set up download link
    downloadLink.href = url;
    downloadLink.download = filename;
    
    // Show download section and CTA
    downloadSection.classList.remove('hidden');
    ctaSection.classList.remove('hidden');
}

function showErrorMessage(message) {
    hideAllStates();
    errorMessage.querySelector('p').textContent = `Error: ${message}. Please try again.`;
    errorMessage.classList.remove('hidden');
}

function disableForm(disabled) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => input.disabled = disabled);
    submitButton.disabled = disabled;
    
    if (disabled) {
        submitButton.innerHTML = '<div class="button-loading"></div>';
    } else {
        submitButton.innerHTML = '<span class="button-text">SUBMIT</span>';
    }
}

// Add loading spinner styles for button
const style = document.createElement('style');
style.textContent = `
    .button-loading {
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top-color: transparent;
        border-radius: 50%;
        animation: button-spin 0.8s linear infinite;
    }
    
    @keyframes button-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Auto-cleanup download URLs to prevent memory leaks
downloadLink.addEventListener('click', () => {
    setTimeout(() => {
        if (downloadLink.href.startsWith('blob:')) {
            window.URL.revokeObjectURL(downloadLink.href);
        }
    }, 1000);
}); 