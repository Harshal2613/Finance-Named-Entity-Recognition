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

// Chart instances
let fraudChart;
let transactionChart;
let entityPieChart;
let trendLineChart;
let riskBarChart;

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

// Add animation classes to elements when they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with animation classes
document.querySelectorAll('.fade-in, .slide-in, .scale-in, .rotate-in').forEach(el => {
    observer.observe(el);
});

// Enhanced drag and drop handling
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
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

// Enhanced notification system with animations
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Trigger reflow
    notification.offsetHeight;

    // Add show class for animation
    notification.classList.add('show');

    // Handle close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Enhanced file upload with progress animation
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
        return data;
    } catch (error) {
        console.error('Error:', error);
        showNotification('Upload failed. Please try again.', 'error');
        throw error;
    } finally {
        uploadProgress.style.display = 'none';
    }
}

// Initialize all charts
function initializeCharts() {
    // Fraud Risk Chart (Doughnut)
    const fraudCtx = document.getElementById('fraudChart').getContext('2d');
    fraudChart = new Chart(fraudCtx, {
        type: 'doughnut',
        data: {
            labels: ['Low Risk', 'Medium Risk', 'High Risk'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Transaction Summary Chart (Bar)
    const transactionCtx = document.getElementById('transactionChart').getContext('2d');
    transactionChart = new Chart(transactionCtx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses', 'Net'],
            datasets: [{
                label: 'Amount ($)',
                data: [0, 0, 0],
                backgroundColor: ['#4CAF50', '#F44336', '#2196F3']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Entity Distribution Chart (Pie)
    const entityCtx = document.getElementById('entityPieChart').getContext('2d');
    entityPieChart = new Chart(entityCtx, {
        type: 'pie',
        data: {
            labels: ['Organizations', 'People', 'Locations', 'Dates'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#FF5722', '#2196F3', '#4CAF50', '#9C27B0']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Transaction Trends Chart (Line)
    const trendCtx = document.getElementById('trendLineChart').getContext('2d');
    trendLineChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Transaction Volume',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#2196F3',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Risk Score Distribution Chart (Bar)
    const riskCtx = document.getElementById('riskBarChart').getContext('2d');
    riskBarChart = new Chart(riskCtx, {
        type: 'bar',
        data: {
            labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
            datasets: [{
                label: 'Number of Transactions',
                data: [0, 0, 0, 0, 0],
                backgroundColor: '#FF5722'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Enhanced chart animations
function updateCharts(data) {
    // Add animation delay to each chart
    const charts = [fraudChart, transactionChart, entityPieChart, trendLineChart, riskBarChart];
    
    charts.forEach((chart, index) => {
        setTimeout(() => {
            if (chart) {
                // Update chart data
                if (chart === fraudChart) {
                    chart.data.datasets[0].data = [
                        data.fraudRisk.low || 0,
                        data.fraudRisk.medium || 0,
                        data.fraudRisk.high || 0
                    ];
                } else if (chart === transactionChart) {
                    chart.data.datasets[0].data = [
                        data.transactionSummary.income || 0,
                        data.transactionSummary.expenses || 0,
                        data.transactionSummary.net || 0
                    ];
                } else if (chart === entityPieChart) {
                    chart.data.datasets[0].data = [
                        data.entityDistribution.organizations || 0,
                        data.entityDistribution.people || 0,
                        data.entityDistribution.locations || 0,
                        data.entityDistribution.dates || 0
                    ];
                } else if (chart === trendLineChart) {
                    chart.data.datasets[0].data = data.transactionTrends || [0, 0, 0, 0, 0, 0];
                } else if (chart === riskBarChart) {
                    chart.data.datasets[0].data = data.riskDistribution || [0, 0, 0, 0, 0];
                }
                
                // Add animation options
                chart.options.animation = {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                };
                
                chart.update();
            }
        }, index * 200); // Stagger the animations
    });
}

// Enhanced UI updates with animations
function updateUI(data) {
    // Update Named Entities with fade-in animation
    const namedEntitiesContent = document.getElementById('namedEntities');
    namedEntitiesContent.innerHTML = '';
    
    Object.entries(data.entities).forEach(([type, entities], index) => {
        if (entities.length > 0) {
            const entityGroup = document.createElement('div');
            entityGroup.className = 'entity-group fade-in';
            entityGroup.style.animationDelay = `${index * 100}ms`;
            
            entityGroup.innerHTML = `
                <h4>${type}</h4>
                <ul>
                    ${entities.map(entity => `<li class="list-item">${entity}</li>`).join('')}
                </ul>
            `;
            
            namedEntitiesContent.appendChild(entityGroup);
        }
    });

    // Update charts with animations
    updateCharts(data);

    // Update Recent Documents with staggered animation
    const recentDocumentsContent = document.getElementById('recentDocuments');
    recentDocumentsContent.innerHTML = '';
    
    data.recentDocuments.forEach((doc, index) => {
        const docElement = document.createElement('div');
        docElement.className = 'document-item fade-in';
        docElement.style.animationDelay = `${index * 100}ms`;
        
        docElement.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <div class="document-info">
                <h4>${doc.name}</h4>
                <p>${new Date(doc.date).toLocaleDateString()}</p>
            </div>
        `;
        
        recentDocumentsContent.appendChild(docElement);
    });

    // Update Analysis History with staggered animation
    const analysisHistoryContent = document.getElementById('analysisHistory');
    analysisHistoryContent.innerHTML = '';
    
    data.analysisHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item fade-in';
        historyItem.style.animationDelay = `${index * 100}ms`;
        
        historyItem.innerHTML = `
            <div class="history-info">
                <h4>${item.analysisType}</h4>
                <p>${item.documentName}</p>
            </div>
            <span class="history-date">${new Date(item.date).toLocaleDateString()}</span>
        `;
        
        analysisHistoryContent.appendChild(historyItem);
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

    // Initialize all charts
    initializeCharts();
}); 