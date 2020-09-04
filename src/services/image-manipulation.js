const sharp = require('sharp');
const smartcrop = require('smartcrop-sharp');
const AWS = require('aws-sdk');

const AWS_OPTIONS = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: process.env.AWS_REGION,
};

const THUMBNAIL_RESIZE_OPTIONS = {
  width: 245,
  height: 138,
  fit: 'cover',
};

const getFaces = async (imageBuffer) => {
  const rekognition = new AWS.Rekognition(AWS_OPTIONS);
  const params = { Image: { Bytes: imageBuffer } };
  const { FaceDetails } = await rekognition.detectFaces(params).promise();

  return FaceDetails;
};

const getBoostArea = (boundingBox, metadata) => {
  return {
    x: Math.floor(boundingBox.Left * metadata.width),
    y: Math.floor(boundingBox.Top * metadata.height),
    width: Math.floor(boundingBox.Width * metadata.width),
    height: Math.floor(boundingBox.Height * metadata.height),
    weight: 1.0,
  };
};

const resizeTo = (src, dest) => {
  return sharp(src).resize(THUMBNAIL_RESIZE_OPTIONS).toFile(dest);
};

const smartCropTo = async (src, dest, options = {}) => {
  const { width, height } = THUMBNAIL_RESIZE_OPTIONS;
  const cropOptions = { width, height, ...options };
  const { topCrop } = await smartcrop.crop(src, cropOptions);
  const cropArea = {
    left: topCrop.x,
    top: topCrop.y,
    width: topCrop.width,
    height: topCrop.height,
  };

  return sharp(src)
    .extract(cropArea)
    .resize(THUMBNAIL_RESIZE_OPTIONS)
    .toFile(dest);
};

const faceCropTo = async (src, dest) => {
  const image = sharp(src);
  const metadata = await image.metadata();
  const imageBuffer = await image.toBuffer();
  const faces = await getFaces(imageBuffer);
  const boost = faces.map((face) => getBoostArea(face.BoundingBox, metadata));

  return smartCropTo(src, dest, { boost });
};

module.exports = {
  resizeTo,
  smartCropTo,
  faceCropTo,
};
