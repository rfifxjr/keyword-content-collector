const express = require('express');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const keywords = JSON.parse(fs.readFileSync('./server/keywords.json', 'utf-8'));

app.post('/get-urls', (req, res) => {
    const keyword = req.body.keyword;
    const urls = keywords[keyword];
    if (urls) {
        res.json(urls);
    } else {
        res.status(404).json({ message: 'Keyword not found' });
    }
});

app.post('/download', async (req, res) => {
    const url = req.body.url;
    try {
        const response = await axios.get(url, {
            onDownloadProgress: (progressEvent) => {
                const total = progressEvent.total;
                const current = progressEvent.loaded;
                const progress = Math.round((current / total) * 100);
                res.write(`data: ${JSON.stringify({ progress })}\n\n`);
            }
        });
        res.write(`data: ${JSON.stringify({ content: response.data })}\n\n`);
        res.end();
    } catch (error) {
        res.status(500).json({ message: 'Error downloading content' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
