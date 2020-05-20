const app = require('./app');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require("cors");
app.use(cors());

const server = https.createServer({
  key: fs.readFileSync(path.join(__dirname, "./server.key")),
  cert: fs.readFileSync(path.join(__dirname, "./server.cert"))
},app)

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 🎆 Shutting down ...')
    console.log(err.name, err.message);
    process.exit(1);
  });

const httpsserver = server.listen(process.env.PORT, () => {
    console.log("App running on port ", process.env.PORT);
  });

process.on('unhandledRejection', err => {
  console.log('UNHANDLER REJECTION! 🎆 Shutting down ...')
  console.log(err.name, err.message);
  httpsserver.close(() => {
    process.exit(1);
  });
});