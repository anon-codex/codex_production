const express = require('express');
const route = express.Router();
const Insta_api = require("../controller/Instagram");
const LinkedIn_api = require("../controller/Linkedin");
const fetchPinterestVideo = require("../controller/Printester");


route.post("/insta",Insta_api);
route.post("/linkedin",LinkedIn_api);
route.post("/pinterest",fetchPinterestVideo);







module.exports = route;