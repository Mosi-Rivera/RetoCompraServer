require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const {USD} = require('../constants/currency').obj;
const sections = require('../constants/section').arr;
const sizes = require('../constants/size').arr;
const brands = ["NIKE", "H&M", "GC", "ADIDAS"];
const colors = ["RED", "BLUE", "YELLOW", "GREEN", "PURPLE", "PINK", "BROWN", "BLACK", "WHITE", "MULTI"];
const images = [
    'https://imgs.search.brave.com/t4IfTANR1iwFLt8G1PRuwKOpNz4uQfZpJnDsvLs8RlY/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFrWlJ0bVY4Ukwu/anBn',//red
    'https://cdn.pixabay.com/photo/2017/02/15/11/42/t-shirt-2068353_640.png',//blue
    'https://media.istockphoto.com/id/831591150/photo/yellow-t-shirts-front-and-back-used-as-design-template.jpg?b=1&s=170667a&w=0&k=20&c=4Wm0BXRriJONblmVKGx5aTiJLeJy0oS-f22zB6zL8us=',//yellow
    'https://cdn.pixabay.com/photo/2016/11/23/06/57/isolated-t-shirt-1852114_640.png',//green
    'https://media.istockphoto.com/id/1354823135/photo/violet-t-shirt-template-men-isolated-on-white-tee-shirt-blank-as-design-mockup-front-view.jpg?s=1024x1024&w=is&k=20&c=42T1swRTZxbYZJTXgB5Sd_BH3acg88Xg3Ws4zHB3UHw=', //purple
    'https://cdn.pixabay.com/photo/2017/10/22/19/10/shirt-2878907_960_720.jpg',//pink
    'https://media.istockphoto.com/id/1295521820/photo/mens-brown-dark-chocolate-blank-t-shirt-template-from-two-sides-natural-shape-on-invisible.jpg?s=1024x1024&w=is&k=20&c=rNSJ1PE_vUadGU7ObCJn2fTp9UNmh2aRumGjnl-p_WU=',//brown
    'https://cdn.pixabay.com/photo/2016/12/06/09/30/blank-1886001_640.png',//black
    'https://imgs.search.brave.com/lGmDn-pHilmKXPsq49Kdx9mqXdbo6upsCNDQ42c1Cag/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzEtWExsMUl3eUwu/anBn', //white
    'https://media.istockphoto.com/id/859807234/photo/tie-dye-shirt.jpg?s=1024x1024&w=is&k=20&c=uvY2j0OLFOPSzAh2WhBnsBdr-aMg1oAbZ8-0oCkmBOo=',//multi
];

const atoi = (str, def = 10) => {
    let result = parseInt(str);
    return isNaN(result) ? def : result;
}

(async () => {
    try
    {
        mongoose.connect(process.env.DB_URI);
        if (await Product.estimatedDocumentCount() !== 0 || await Variant.estimatedDocumentCount() !== 0)
        {
            return console.log(`Err: Collection is not empty!
            This script can only seed an empty collection.
            Please drop the collection and try again.
            `);
        }
        const products = [];
        const variants = [];
        let productCount = atoi(process.argv[2], 10);
        let variantCount = atoi(process.argv[3], 5);
        for (let i = productCount; i--;)
            products.push({
                name: "Product name: " + i,
                description: 'This is a description for product: ' + i,
                section: sections[i % sections.length],
                brand: brands[i % brands.length]
            });
        const productDocuments = await Product.insertMany(products);
        for (let i = productDocuments.length; i--;)
        {
            const {_id, name, brand, section} = productDocuments[i];
            for (let j = variantCount; j--;)
            {
                const colorIndex = j % colors.length;
                const color = colors[colorIndex];
                const img = images[colorIndex];
                const price = Math.floor((5 + Math.random() * 40) * 100) / 100;
                const stock = {
                    XS: {
                        size: "XS",
                        stock: Math.floor(Math.random() * 30)
                    },
                    S: {
                        size: "S",
                        stock: Math.floor(Math.random() * 30)
                    },
                    M: {
                        size: "M",
                        stock: Math.floor(Math.random() * 30)
                    },
                    L: {
                        size: "L",
                        stock: Math.floor(Math.random() * 30)
                    },
                    XL: {
                        size: "XL",
                        stock: Math.floor(Math.random() * 30)
                    },
                };
                variants.push({
                    product: _id,
                    name,
                    brand,
                    section,
                    color,
                    assets: {
                        thumbnail: img,
                        images: [img]
                    },
                    price: {
                        currency: USD,
                        value: price
                    },
                    stock: stock
                });
            }
        }
        await Variant.insertMany(variants);
        console.log('PRODUCTS SEEDED!');
    }
    catch(err)
    {
        console.log(err);
    }
    finally
    {
        mongoose.disconnect();
    }
})();
