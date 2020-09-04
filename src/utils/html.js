const fs = require('fs');

const buildImgs = (sources) => {
  let imgElements = '';

  for (let i = 0; i < sources.length; ++i) {
    imgElements += `<img src="${sources[i]}" alt="${sources[i]}" />`;
  }

  return imgElements;
};

const buildHTML = (title, images, path) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${title}</title>
      <style> 
        body {
          font-family: sans-serif;
          margin: 8px 16px;
        }
        img {
          width: 151px;
          height: auto;
          margin: 4px;
        }
      </style>
    </head>
    <body>
      ${buildImgs(images)}
    </body>
  </html>
  `;

  fs.writeFileSync(`${path}/index.html`, html.trim());
};

module.exports = {
  buildHTML,
};
