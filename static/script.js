// Navigation
const welcomeScreen = document.getElementById('welcome-screen');
const mainMenu = document.getElementById('main-menu');
const getStartedBtn = document.getElementById('get-started-btn');
const scanFoodBtn = document.getElementById('scan-food-btn');
const askAnythingBtn = document.getElementById('ask-anything-btn');
const scanPopup = document.getElementById('scan-popup');
const chatPopup = document.getElementById('chat-popup');
const cancelScanBtn = document.getElementById('cancel-scan');
const takePhotoBtn = document.getElementById('take-photo');
const closeChatBtn = document.getElementById('close-chat');

// Show main menu on Get Started
getStartedBtn.onclick = () => {
    welcomeScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
};

// Show scan popup
scanFoodBtn.onclick = () => {
    scanPopup.classList.remove('hidden');
};

// Hide scan popup
cancelScanBtn.onclick = () => {
    scanPopup.classList.add('hidden');
};

// (Optional) Take photo action
takePhotoBtn.onclick = () => {
    alert('Camera functionality not implemented in this demo.');
};

// Show chat popup
askAnythingBtn.onclick = () => {
    chatPopup.classList.remove('hidden');
};

// Hide chat popup
closeChatBtn.onclick = () => {
    chatPopup.classList.add('hidden');
};

// Chat functionality
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBody = document.getElementById('chat-body');

chatForm.onsubmit = async function(e) {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;

    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.textContent = userMsg;
    chatBody.appendChild(userDiv);

    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Show loading bot message
    const botDiv = document.createElement('div');
    botDiv.className = 'bot-message';
    botDiv.textContent = '...';
    chatBody.appendChild(botDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg })
        });
        const data = await res.json();
        botDiv.textContent = data.reply || 'Sorry, no response.';
    } catch (err) {
        botDiv.textContent = 'Error: Could not reach server.';
    }
    chatBody.scrollTop = chatBody.scrollHeight;
};

// File upload drag & drop
const fileUpload = document.getElementById('file-upload');
const uploadLabel = document.querySelector('.upload-label');

uploadLabel.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadLabel.style.borderColor = '#2bb6a8';
});
uploadLabel.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadLabel.style.borderColor = '#b2e2dd';
});
uploadLabel.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUpload.files = e.dataTransfer.files;
    handleFileUpload(fileUpload.files[0]);
});
fileUpload.addEventListener('change', (e) => {
    if (fileUpload.files.length > 0) {
        handleFileUpload(fileUpload.files[0]);
    }
});

async function handleFileUpload(file) {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await fetch('/api/ocr', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.text) {
            alert('Extracted Text:\n' + data.text);
        } else {
            alert('No text found or error: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        alert('Error: Could not reach OCR server.');
    }
    scanPopup.classList.add('hidden');
}

// Dark mode toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

function setDarkMode(enabled) {
    if (enabled) {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.textContent = '🌙';
    }
    localStorage.setItem('darkMode', enabled ? '1' : '0');
}

darkModeToggle.onclick = () => {
    setDarkMode(!body.classList.contains('dark-mode'));
};

// Load preference on page load
window.addEventListener('DOMContentLoaded', () => {
    const darkPref = localStorage.getItem('darkMode') === '1';
    setDarkMode(darkPref);
});
