// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.querySelector('.progress');
const progressText = document.querySelector('.progress-text');
const namedEntities = document.getElementById('namedEntities');
const transactionSummary = document.getElementById('transactionSummary');
const fraudAnalysis = document.getElementById('fraudAnalysis');
const recentDocuments = document.getElementById('recentDocuments');
const analysisHistory = document.getElementById('analysisHistory');
const navbar = document.querySelector('.navbar');

// Chart.js Configuration
let fraudChart;

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Event Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#1e40af';
    dropZone.style.transform = 'scale(1.02)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#2563eb';
    dropZone.style.transform = 'scale(1)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#2563eb';
    dropZone.style.transform = 'scale(1)';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// File Handling
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            uploadFile(file);
        } else {
            showNotification('Please upload a PDF or DOCX file', 'error');
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// File Upload
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    uploadProgress.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = 'Uploading: 0%';

    try {
        // Simulate upload progress
        simulateProgress();

        const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        showNotification('File uploaded successfully!', 'success');
        updateUI(data);
        
        // Scroll to analysis section
        document.getElementById('analysis').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error uploading file. Please try again.', 'error');
    } finally {
        uploadProgress.style.display = 'none';
    }
}

// UI Updates with Animations
function updateUI(data) {
    // Update Named Entities with fade-in animation
    updateNamedEntities(data.entities);

    // Update Transaction Summary with slide-in animation
    updateTransactionSummary(data.transactions);

    // Update Fraud Analysis Chart with fade-in animation
    updateFraudChart(data.fraudAnalysis);

    // Update Recent Documents with staggered animation
    updateRecentDocuments(data.recentDocuments);

    // Update Analysis History with staggered animation
    updateAnalysisHistory(data.analysisHistory);
}

function updateNamedEntities(entities) {
    if (!entities) return;

    const html = Object.entries(entities)
        .map(([type, items]) => `
            <div class="entity-group" style="opacity: 0; transform: translateY(20px);">
                <h4>${type}</h4>
                <ul>
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');

    namedEntities.innerHTML = html;

    // Animate each entity group
    const entityGroups = namedEntities.querySelectorAll('.entity-group');
    entityGroups.forEach((group, index) => {
        setTimeout(() => {
            group.style.transition = 'all 0.5s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function updateTransactionSummary(transactions) {
    if (!transactions) return;

    const html = `
        <div class="transaction-stats" style="opacity: 0; transform: translateX(-20px);">
            <div class="stat">
                <span class="label">Total Transactions:</span>
                <span class="value">${transactions.total}</span>
            </div>
            <div class="stat">
                <span class="label">Total Amount:</span>
                <span class="value">$${transactions.totalAmount.toLocaleString()}</span>
            </div>
            <div class="stat">
                <span class="label">Average Amount:</span>
                <span class="value">$${transactions.averageAmount.toLocaleString()}</span>
            </div>
        </div>
    `;

    transactionSummary.innerHTML = html;

    // Animate transaction stats
    setTimeout(() => {
        const stats = transactionSummary.querySelector('.transaction-stats');
        stats.style.transition = 'all 0.5s ease';
        stats.style.opacity = '1';
        stats.style.transform = 'translateX(0)';
    }, 300);
}

function updateFraudChart(fraudData) {
    if (!fraudData) return;

    const ctx = document.getElementById('fraudChart').getContext('2d');
    
    if (fraudChart) {
        fraudChart.destroy();
    }

    fraudChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Legitimate', 'Suspicious', 'Fraudulent'],
            datasets: [{
                data: [
                    fraudData.legitimate,
                    fraudData.suspicious,
                    fraudData.fraudulent
                ],
                backgroundColor: [
                    '#10B981',
                    '#F59E0B',
                    '#EF4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateRecentDocuments(documents) {
    if (!documents) return;

    const html = documents
        .map((doc, index) => `
            <div class="document-item" style="opacity: 0; transform: translateX(-20px);">
                <i class="fas fa-file-alt"></i>
                <div class="document-info">
                    <span class="document-name">${doc.name}</span>
                    <span class="document-date">${new Date(doc.date).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

    recentDocuments.innerHTML = html;

    // Animate each document item with stagger effect
    const documentItems = recentDocuments.querySelectorAll('.document-item');
    documentItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

function updateAnalysisHistory(history) {
    if (!history) return;

    const html = history
        .map((item, index) => `
            <div class="history-item" style="opacity: 0; transform: translateX(-20px);">
                <div class="history-date">${new Date(item.date).toLocaleDateString()}</div>
                <div class="history-details">
                    <span class="document-name">${item.documentName}</span>
                    <span class="analysis-type">${item.analysisType}</span>
                </div>
            </div>
        `).join('');

    analysisHistory.innerHTML = html;

    // Animate each history item with stagger effect
    const historyItems = analysisHistory.querySelectorAll('.history-item');
    historyItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// Utility Functions
function scrollToUpload() {
    document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
}

// Simulate upload progress
function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Uploading: ${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 500);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add initial animations
    const heroContent = document.querySelector('.hero-content');
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        heroContent.style.transition = 'all 1s ease';
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
    }, 300);
}); 