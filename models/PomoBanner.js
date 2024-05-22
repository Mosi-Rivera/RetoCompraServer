const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromoBannerSchema = new Schema({
	title: {type: String},
	description: {type: String},
	href: {type: String},
	image_url: {type: String},
	active: {type: Boolean, default: false}
}, {timestamps: true})

module.exports = mongoose.model('PromoBanner', PromoBannerSchema);
