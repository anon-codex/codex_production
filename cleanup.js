const fs = require('fs');
const path = require('path');
const downloadsFolderPath = path.join(__dirname, 'downloads');

function deleteOldFilesFromDownloads() {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  fs.readdir(downloadsFolderPath, (err, files) => {
    if (err) return;
    files.forEach(file => {
      const filePath = path.join(downloadsFolderPath, file);
      fs.stat(filePath, (err, stats) => {
        if (!err && now - stats.mtime.getTime() > fiveMinutes) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
}

module.exports = deleteOldFilesFromDownloads;
