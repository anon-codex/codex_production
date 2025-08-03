const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 7890;
const route = require("./routes/route");

app.use(cors());
app.use(express.json())
app.use("/api",route);




app.listen(PORT, () => {
    console.log("Server is running ",PORT);
})