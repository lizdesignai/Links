const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Middleware for parsing JSON body
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the API submit
app.post('/api/submit', async (req, res) => {
    // Mock Vercel req/res
    const submitHandler = require('./api/submit.js');
    try {
        await submitHandler(req, res);
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).send(err.message);
        }
    }
});

app.listen(port, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 Servidor de teste rodando localmente!`);
    console.log(`🔗 Acesse: http://localhost:${port}/form-brand-discovery.html`);
    console.log(`=========================================\n`);
    console.log(`Pressione Ctrl+C para encerrar.`);
    setInterval(() => {}, 60000); // keep alive
});
