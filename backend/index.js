const express = require('express');
const app = express();
const cors = require('cors');
const route = require('./routes/route');
const dotenv = require('dotenv');
const path = require('path');
const blockBadRequests = require("./middlerware/blockBadRequests");
dotenv.config();



const PORT = process.env.PORT || 4444;
// const PORT = 8080;

const corsOptions = {
  origin:"https://codex-production-1.onrender.com",
  credentials:true
}

// console.log(downloadsPath);
// app.use('/download', express.static(downloadsPath));
app.use('/downloads', express.static(path.join(__dirname, 'controller', 'downloads')));

const _dirname = path.resolve();


app.use(blockBadRequests);



app.use(cors(corsOptions));
app.use(express.json());
app.use("/api",route);

app.use(express.static(path.join(_dirname,"/frontend/dist")))


app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});


app.listen(PORT,()=>console.log("Server is running ",PORT));