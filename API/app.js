const express = require("express");
const http = require('http');
const WebSocket = require('ws');
const cors = require("cors");  // Move this line here
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { connection, createSessionConnection } = require("./db");
const fetchRouter = require("./routes/fetch");
const sendRouter = require("./routes/send");
const updateRouter = require("./routes/update");
const eraseRouter = require("./routes/erase");


const app = express();


app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
  createDatabaseTable: true,
  schema: {
    tableName: 'SessionsTable',
    columnNames: {
      session_id: 'SessionID',
      expires: 'Expires',
      data: 'Data'
    }
  }
}, createSessionConnection);


app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: "****",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "semakodb"
};


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Semako Thrifting Union",
      version: "1.0.0",
      description: "The API for Semako Thrift",
    },
  },
  apis: ["./routes/*.js"], 
};


const specs = swaggerJsdoc(options);

const authenticateSession = (req, res, next) => {
  if (!req.session.member) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next();
};


// Routes
app.use("/", fetchRouter);
app.use("/send", sendRouter);
app.use("/update", updateRouter);
app.use("/erase", eraseRouter);
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

