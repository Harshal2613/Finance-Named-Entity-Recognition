const express = require('express');
const multer = require('multer');
const cors = require('cors');
const natural = require('natural');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8000;

// Enable CORS
app.use(cors());

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Initialize NER
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Sample training data for NER
classifier.addDocument('John Smith works at Apple Inc.', 'PERSON');
classifier.addDocument('Microsoft Corporation reported earnings', 'ORGANIZATION');
classifier.addDocument('New York office', 'LOCATION');
classifier.addDocument('January 15, 2024', 'DATE');
classifier.addDocument('$120,000', 'MONEY');
classifier.addDocument('25%', 'PERCENT');
classifier.train();

// Generate mock data for visualizations
function generateMockData() {
    const income = Math.random() * 50000 + 50000;
    const expenses = Math.random() * 30000 + 30000;
    const net = income - expenses;

    const total = 100;
    const low = Math.floor(Math.random() * 20 + 60);
    const medium = Math.floor(Math.random() * 15 + 15);
    const high = total - low - medium;

    const orgs = Math.floor(Math.random() * 30 + 20);
    const people = Math.floor(Math.random() * 25 + 15);
    const locations = Math.floor(Math.random() * 20 + 10);
    const dates = Math.floor(Math.random() * 15 + 5);

    const trends = Array.from({ length: 6 }, () => Math.random() * 100 + 100);
    const riskDist = Array.from({ length: 5 }, () => Math.floor(Math.random() * 15 + 5));

    const recentDocs = Array.from({ length: 5 }, (_, i) => ({
        name: `Document_${i + 1}.pdf`,
        date: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    }));

    const history = Array.from({ length: 5 }, (_, i) => ({
        date: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        documentName: `Document_${i + 1}.pdf`,
        analysisType: ['NER Analysis', 'Fraud Detection', 'Transaction Analysis'][Math.floor(Math.random() * 3)]
    }));

    return {
        transactionSummary: {
            income: Number(income.toFixed(2)),
            expenses: Number(expenses.toFixed(2)),
            net: Number(net.toFixed(2))
        },
        fraudRisk: {
            low,
            medium,
            high
        },
        entityDistribution: {
            organizations: orgs,
            people,
            locations,
            dates
        },
        transactionTrends: trends.map(x => Number(x.toFixed(2))),
        riskDistribution: riskDist,
        recentDocuments: recentDocs,
        analysisHistory: history
    };
}

// Extract entities from text
function extractEntities(text) {
    const tokens = tokenizer.tokenize(text);
    const entities = {
        ORGANIZATION: [],
        PERSON: [],
        LOCATION: [],
        DATE: [],
        MONEY: [],
        PERCENT: []
    };

    tokens.forEach(token => {
        const classification = classifier.classify(token);
        if (entities[classification]) {
            entities[classification].push(token);
        }
    });

    return entities;
}

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        // Read file content
        const content = fs.readFileSync(req.file.path, 'utf8');

        // Sample text for demo (in production, process the actual file content)
        const sampleText = `
            John Smith works at Apple Inc. in Cupertino, California.
            He received a salary of $120,000 on January 15, 2024.
            The company's revenue increased by 25% in Q1 2024.
            Microsoft Corporation reported earnings of $50 billion.
            Sarah Johnson from Goldman Sachs visited the New York office.
        `;

        // Extract entities
        const entities = extractEntities(sampleText);

        // Generate mock data
        const mockData = generateMockData();

        // Combine data
        const response = {
            entities,
            ...mockData
        };

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json(response);
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
