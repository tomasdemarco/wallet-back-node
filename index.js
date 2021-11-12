const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const walletsRouter = require('./routes/wallets');
const extractionsRouter = require('./routes/extractions');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

//Basic middlewares
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next();
});

//Authentication middleware:
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    
    if (err) { return res.sendStatus(403); }
    
    next();
  })
}

//Routes middleware:
app.use('/wallet', authenticateToken, walletsRouter)
app.use('/extraction', extractionsRouter)

//DB connection:
mongoose.connect(
  process.env.MONGO_URI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  () => console.log("Conectado a mongo atlas")
);

app.listen(PORT, () =>
  console.log(`Server running on http://www.localhost:${PORT}`)
);