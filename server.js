//const fetch = require("node-fetch");
const express = require('express');
const mysql = require('mysql2');
//const bodyParser = require('body-parser');
//require('dotenv').config();
//const cors = require('cors');

const app = express();
const port = 3000;

//app.use(cors());
app.use(express.json());

// Create a connection to the database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'circuituser',
    password: 'CircuitSim2024',
    database: 'circuitsimulator',
    port: 3306
});

// Define an API endpoint to fetch data from correctAnswers
app.get('/api/correctAnswers', (req, res) => {
  pool.query('SELECT * FROM correctAnswers', (error, results) => {
    if (error) {
      console.error('Error querying data:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

// Define an API endpoint to insert data into correctAnswers
app.post('/api/correctAnswers', (req, res) => {
  const { name, circuit } = req.body;
  pool.query('INSERT INTO correctAnswers (name, circuit) VALUES (?, ?)', [name, circuit], (error, results) => {
    if (error) {
      console.error('Error inserting data:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(201).send('Answer added successfully');
  });
});

// Define an API endpoint to fetch data from pleasForHelp
app.get('/api/pleasForHelp', (req, res) => {
  pool.query('SELECT * FROM pleasForHelp', (error, results) => {
    if (error) {
      console.error('Error querying data:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

// Define an API endpoint to insert data into pleasForHelp
app.post('/api/pleasForHelp', (req, res) => {
  const { name, circuit, plea, analysisType } = req.body;
  pool.query('INSERT INTO pleasForHelp (name, circuit, plea, analysisType) VALUES (?, ?, ?, ?)', [name, circuit, plea, analysisType], (error, results) => {
    if (error) {
      console.error('Error inserting data:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(201).send('Plea added successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  /*
  let userName='Johnson Smith';
  let circuitText='squidgame';
  let studentQuestion='What is a circuit?';
  let analysisType='test2';

  fetch('https://sites.ecse.rpi.edu/api/pleasForHelp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: userName, circuit: circuitText, plea: studentQuestion,analysisType: analysisType })
    })
    .catch(error => console.error('Error:', error));
  //*/
});
