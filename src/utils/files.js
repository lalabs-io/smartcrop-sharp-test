const fs = require('fs');
const glob = require('glob');

const makeDir = (path) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

const removeDir = (path) => {
  return new Promise((resolve, reject) => {
    fs.rmdir(path, { recursive: true }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

const readDir = (pattern) => {
  return new Promise((resolve, reject) => {
    glob(pattern, (error, files) => {
      if (error) reject(error);
      else resolve(files);
    });
  });
};

module.exports = {
  makeDir,
  removeDir,
  readDir,
};
