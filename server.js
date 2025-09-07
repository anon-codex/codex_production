const express = require('express'); 
const app = express();
require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 7890;
const route = require("./routes/route");
const fs = require('fs');
const path = require('path');
const blockSuspicious = require('./middlewares/blockSuspicious');



const deleteOldFilesFromDownloads = require('./cleanup');
setInterval(deleteOldFilesFromDownloads, 60 * 1000);

app.use('/downloads', express.static(path.join(__dirname, 'downloads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Disposition', 'attachment');
  }
}));

app.use(cors());

// yhaa se ----------

// // ✅ Allow only requests from grabshort.online
// const allowedOrigin = "https://www.grabshort.online";

// // ✅ CORS options
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || origin === allowedOrigin) {
//       callback(null, true);
//     } else {
//       callback(new Error("CORS policy: Not allowed by server"));
//     }
//   },
//   optionsSuccessStatus: 200, // for legacy browser support
// };

// // ✅ Apply CORS with options
// app.use(cors(corsOptions));

// // ✅ Block suspicious requests
// app.use(blockSuspicious({
//   blockDurationMs: 10 * 60 * 1000,      // 10 min block
//   maxRequestsPerMinute: 100,
//   allowedOrigins: ['https://www.grabshort.online', 'https://grabshort.online'],
//   allowedIPs: [],                       // agar koi IP whitelist karni ho to yahan add karo
//   allowedUserAgentsSubstr: [
//     'mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera', 'android', 'iphone'
//   ]
// }));

// yhaa tak ----------

app.use(express.json())
app.use("/api", route);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});







// const express = require('express');
// const app = express();
// require('dotenv').config();
// const cors = require('cors');
// const PORT = process.env.PORT || 7890;
// const route = require("./routes/route");
// const fs = require('fs');
// const path = require('path');
// const blockSuspicious = require('./middlewares/blockSuspicious');



// // ✅ Allow only requests from grabshort.online
// const allowedOrigin = "https://www.grabshort.online";

// const deleteOldFilesFromDownloads = require('./cleanup');
// setInterval(deleteOldFilesFromDownloads, 60 * 1000);



// app.use('/downloads', express.static(path.join(__dirname, 'downloads'), {
//   setHeaders: (res, filePath) => {
//     res.setHeader('Content-Disposition', 'attachment');
//   }
// }));

// //Note :-  these are the most Important code.... 

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || origin === allowedOrigin) {
//       callback(null, true);
//     } else {
//       callback(new Error("CORS policy: Not allowed by server"));
//     }
//   },
//   optionsSuccessStatus: 200, // for legacy browser support
// };

// // ✅ Apply CORS to all routes
// app.use(cors(corsOptions));
// // Use before all routes

// app.use(blockSuspicious({
//   blockDurationMs: 10 * 60 * 1000,      // 10 min block
//   maxRequestsPerMinute: 100,
//   allowedOrigins: ['https://www.grabshort.online', 'https://grabshort.online'],
//   allowedIPs: [],                       // agar koi IP whitelist karni ho to yahan add karo
//   allowedUserAgentsSubstr: [
//     'mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera', 'android', 'iphone'
//   ]
// }));

// app.use(express.json())
// app.use("/api",route);




// app.listen(PORT, () => {
//     console.log("Server is running ",PORT);
// })