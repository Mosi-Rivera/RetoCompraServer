const cloudinary=require("cloudinary").v2;

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});


module.exports.cloudinaryDeleteImage = (id, folder) => {
  return cloudinary.uploader.destroy(`GraphicGroove/${folder}/${id}`, {
    invalidate: true
  });
}

module.exports.cloudinaryAddImage = async (image, productId, variantId) => {
  return (await cloudinary.uploader.upload(image, {
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
    public_id: variantId,
    folder: `GraphicGroove/${productId}`
  })).secure_url;
}

module.exports.cloudinaryDeleteManyImages = (idsDataArray) => {
  return cloudinary.api.delete_resources(
    idsDataArray.map(({id, folder}) => `GraphicGroove/${folder}/${id}`), {
    invalidate: true
  });
}

module.exports.cloudinaryDeleteFolder = (folder) => {
   return cloudinary.api.delete_folder(folder);
}

// module.exports.addImage = (image, productId, variantId) => {
//   const opts = {
//     overwrite: true,
//     invalidate: true,
//     resource_type: "auto",
//     public_id: variantId,
//   };
//
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(image, opts, (error, result) => {
//       console.log('Cloudinary error:', error);
//       console.log('Cloudinary result:', result);
//
//       if (result && result.secure_url) {
//         console.log(result.secure_url);
//         return resolve(result.secure_url);
//       }
//       console.log(error.message);
//       return reject({ message: error.message });
//     });
//   });
// }
