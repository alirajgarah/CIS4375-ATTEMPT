const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: true,
  saveUninitialized: true,
}));
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'cis4375group1.crtmtaixighf.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'cis4375group1',
  database: process.env.DB_NAME || 'items',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.message);
  } else {
    console.log('Database connected');
  }
});

app.post('/login', (req, res) => {
  const { user_name, pass_word } = req.body;
  if (!user_name || !pass_word) {
    return res.status(400).json({ message: 'Please provide both user_name and pass_word.' });
  }
  db.query(
    'SELECT * FROM users WHERE user_name = ? AND pass_word = ?',
    [user_name, pass_word],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      req.session.user = results[0];
      res.status(200).json({ message: 'Login successful' });
    }
  );
});

// Registration Endpoint
app.post('/register', (req, res) => {
  const { user_name, pass_word } = req.body;
  
  if (!user_name || !pass_word) {
    return res.status(400).json({ message: 'Please provide user_name and pass_word.' });
  }
  
  db.query('SELECT * FROM users WHERE user_name = ?', [user_name], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ message: 'Username already exists.' });
    }
    
    // Remember to hash the password before inserting it into the database in a real-world app!
    db.query('INSERT INTO users (user_name, pass_word) VALUES (?, ?)', [user_name, pass_word], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      
      res.status(200).json({ message: 'User registered successfully.' });
    });
  });
});

app.post('/upload-csv', (req, res) => {
  let uploadedFile = req.files.file;
  let rows = [];

  if (!uploadedFile || uploadedFile.mimetype !== 'text/csv') {
    return res.status(400).json({ message: 'Please upload a valid CSV file.' });
  }

  // Extract and sanitize the table name from the file name
  let tableName = uploadedFile.name.split('.').slice(0, -1).join('.');
  tableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');

  let csvData = uploadedFile.data;

  if (!csvData && uploadedFile.tempFilePath) {
    csvData = fs.createReadStream(uploadedFile.tempFilePath);
  }

  if (!csvData) {
    return res.status(400).json({ message: 'No CSV data found.' });
  }

  let csvDataStream = csvData;
  if (Buffer.isBuffer(csvData)) {
    csvDataStream = new Readable({
      read() {
        this.push(csvData);
        this.push(null);
      }
    });
  }

  csvDataStream.pipe(csvParser())
    .on('data', (row) => {
      rows.push(row);
    })
    .on('end', () => {
      try {
        if (rows.length > 0) {
          const headers = Object.keys(rows[0]);
          headers.forEach((header, idx) => {
            if (!header) {
              console.warn(`Empty header name found at index ${idx}. Replacing with generic name.`);
              headers[idx] = `column${idx}`;
            } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(header)) {
              console.error(`Invalid header name found: ${header}`);
            }
          });

          const columnsDefinition = headers.map(header => `\`${header}\` TEXT`).join(', ');

          db.query(`CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columnsDefinition})`, (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Error creating table' });
            }

            const placeholders = headers.map(() => '?').join(', ');
            const sql = `INSERT INTO \`${tableName}\` (\`${headers.join('`, `')}\`) VALUES (${placeholders})`;

            function insertRows(rowIndex) {
              if (rowIndex >= rows.length) {
                return res.status(200).json({ message: 'Data inserted successfully' });
              }

              const values = headers.map(header => rows[rowIndex][header]);

              db.query(sql, values, (err, results) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Error inserting data into database' });
                }

                /*console.log(`Row ${rowIndex + 1} inserted`);*/
                insertRows(rowIndex + 1);
              });
            }

            insertRows(0);
          });
        } else {
          res.status(400).json({ message: 'CSV file is empty' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});