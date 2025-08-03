const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 7890;
const route = require("./routes/route");

// ✅ Allow only requests from grabshort.online
const allowedOrigin = "https://www.grabshort.online";

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Not allowed by server"));
    }
  },
  optionsSuccessStatus: 200, // for legacy browser support
};

// ✅ Apply CORS to all routes
app.use(cors(corsOptions));

app.use(express.json())
app.use("/api",route);




app.listen(PORT, () => {
    console.log("Server is running ",PORT);
})