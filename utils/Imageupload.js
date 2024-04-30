const cloudinary=require("cloudinary").v2;

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});


module.exports = (image, productId, variantId) => {
  //imgage = > base64
  // console.log('Image data:', image);
  const opts = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
    public_id: variantId,
    folder: `GraphicGroove/${productId}`
  };

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, opts, (error, result) => {
      console.log('Cloudinary error:', error);
      console.log('Cloudinary result:', result);

      if (result && result.secure_url) {
        console.log(result.secure_url);
        return resolve(result.secure_url);
      }
      console.log(error.message);
      return reject({ message: error.message });
    });
  });
};
