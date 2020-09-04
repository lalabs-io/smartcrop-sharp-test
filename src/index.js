require('dotenv').config();

const path = require('path');

const Logger = require('./utils/logger');
const { makeDir, removeDir, readDir } = require('./utils/files');
const { buildHTML } = require('./utils/html');
const {
  resizeTo,
  smartCropTo,
  faceCropTo,
} = require('./services/image-manipulation');

const DEFAULT_THUMBNAILS = 'default-thumbnails';
const SMARTCROP_THUMBNAILS = 'smartcrop-thumbnails';
const REKOGNITION_THUMBNAILS = 'rekognition-thumbnails';

const paths = {
  build: path.resolve(__dirname, '../build'),
  photoGalleries: path.resolve(__dirname, './photo-galleries'),
};

const thumbnailPaths = {
  default: `${paths.build}/${DEFAULT_THUMBNAILS}`,
  smartcrop: `${paths.build}/${SMARTCROP_THUMBNAILS}`,
  rekognition: `${paths.build}/${REKOGNITION_THUMBNAILS}`,
};

const cleanBuild = async () => {
  await removeDir(paths.build);

  const photoGalleries = await readDir(`${paths.photoGalleries}/*`);
  const buildDirs = [];

  for (let i = 0; i < photoGalleries.length; ++i) {
    const gallery = photoGalleries[i].replace(`${paths.photoGalleries}/`, '');
    const defaultThumbnailsPath = `${thumbnailPaths.default}/${gallery}`;
    const smartcropThumbnailsPath = `${thumbnailPaths.smartcrop}/${gallery}`;
    const rekognitionThumbnailsPath = `${thumbnailPaths.rekognition}/${gallery}`;

    buildDirs.push(makeDir(defaultThumbnailsPath));
    buildDirs.push(makeDir(smartcropThumbnailsPath));
    buildDirs.push(makeDir(rekognitionThumbnailsPath));
  }

  return Promise.all(buildDirs);
};

const generateThumbnails = async () => {
  const galleryImages = await readDir(`${paths.photoGalleries}/**/*.jpg`);
  const cropThumbnails = [];
  const thumbnails = [];

  for (let i = 0; i < galleryImages.length; ++i) {
    const src = galleryImages[i];
    const image = src.replace(`${paths.photoGalleries}/`, '');
    const defaultDest = `${thumbnailPaths.default}/${image}`;
    const smartcropDest = `${thumbnailPaths.smartcrop}/${image}`;
    const rekognitionDest = `${thumbnailPaths.rekognition}/${image}`;

    cropThumbnails.push(resizeTo(src, defaultDest));
    cropThumbnails.push(smartCropTo(src, smartcropDest));
    cropThumbnails.push(faceCropTo(src, rekognitionDest));
    thumbnails.push(image);
  }

  await Promise.all(cropThumbnails);

  return thumbnails;
};

const generateHTML = (thumbnails) => {
  const thumbnailPathKeys = Object.keys(thumbnailPaths);

  for (let i = 0; i < thumbnailPathKeys.length; ++i) {
    const key = thumbnailPathKeys[i];
    const title = key.toUpperCase();
    const thumbnailPath = thumbnailPaths[key];

    buildHTML(title, thumbnails, thumbnailPath);
  }
};

const handler = async () => {
  try {
    await cleanBuild();
    generateHTML(await generateThumbnails());
  } catch (error) {
    Logger.log(error);
  }
};

handler();
