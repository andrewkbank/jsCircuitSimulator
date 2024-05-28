const express = require('express');
const bodyParser = require('body-parser');
const { TextEntry } = require('./database');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle text entry
app.post('/submit', async (req, res) => {
    const textEntry = req.body.text;

    try {
        // Save text entry to the database
        const newEntry = await TextEntry.create({ text: textEntry });
        console.log('Received text entry:', newEntry.text);
        res.send('Text entry received and saved');
    } catch (error) {
        console.error('Error saving text entry:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
