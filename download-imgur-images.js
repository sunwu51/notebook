const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mkdirp = require('mkdirp');
const markdownLinkExtractor = require('markdown-link-extractor');

// Function to download an image from a URL
async function downloadImage(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Function to recursively scan directories for Markdown files
function getAllMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(file));
    } else if (file.endsWith('.md')) {
      results.push(file);
    }
  });

  return results;
}

// Function to scan Markdown files for Imgur image links and download them
async function scanAndDownloadImages() {
  const imgurDir = path.join(__dirname, 'imgur');
  mkdirp.sync(imgurDir);

  const files = getAllMarkdownFiles(__dirname);
  const imgurLinks = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const links = markdownLinkExtractor(content);
    links.forEach(link => {
      if (link.startsWith('https://i.imgur.com/')) {
        imgurLinks.push(link);
        console.log(file, link);
    }
    });
  }
  console.log(imgurLinks.length)
  for (const link of imgurLinks) {
    const imageName = path.basename(link);
    const outputPath = path.join(imgurDir, imageName);
    console.log(`Downloading ${link} to ${outputPath}`);
    await downloadImage(link, outputPath);
  }
}

scanAndDownloadImages()
  .then(() => {
    console.log('All images downloaded successfully.');
  })
  .catch(err => {
    console.error('Error downloading images:', err);
    process.exit(1);
  });
