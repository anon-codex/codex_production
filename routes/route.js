const express = require('express');
const route = express.Router();
const Insta_api = require("../controller/Instagram");
const LinkedIn_api = require("../controller/Linkedin");
const { fetchPinterestVideo, downloadPinterestVideo } = require("../controller/Printester");
const Insta_profile_api = require("../controller/Insta_profile");
const Insta_story_api = require("../controller/Insta_story");
const insta_highlight = require("../controller/Insta_highlights");


route.post("/insta",Insta_api);
route.post("/linkedin",LinkedIn_api);
route.post("/pinterest",fetchPinterestVideo);
route.get("/download", downloadPinterestVideo);
route.post("/insta_profile_api", Insta_profile_api);
route.post("/insta_story_api",Insta_story_api);
route.post("/insta_highlight_api",insta_highlight);








module.exports = route;