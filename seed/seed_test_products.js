require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const {USD} = require('../constants/currency').obj;
const sections = require('../constants/section').arr;
const sizes = require('../constants/size').arr;
const brands = ["NIKE", "H&M", "GC", "ADIDAS"];
const colors = ["RED", "BLUE", "YELLOW", "GREEN"];
const maleImages = [
    'https://imgs.search.brave.com/mbYwiUtddz9mHn6BNwsRIGbjRtuJPB8-3N8TP2ii_30/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFSUlo2NkF1dUwu/anBn',//red
    'https://imgs.search.brave.com/WDl---3CdkdvFbglUAGaf7H0YY2UD9TrjMcpvswdqkc/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFhKzBQRXNIQ0wu/anBn',//blue
    'https://imgs.search.brave.com/VT_kq4KEtQOzVyv9pq6lM1qHuXVNGrxTJdcmYWEXycQ/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFmeG5lV2wrRUwu/anBn',//yellow
    'https://imgs.search.brave.com/wb6ZXs93SiHADN1QRi6-wDqBZwEBJo5wzZSnLbCKXIc/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjE5emN2SzFwZFMu/anBn'//green
];
const femaleImages = [
    'https://imgs.search.brave.com/nQXKCq67jLP2qYbZuk5XtQNuuqs8cmoyPq_djQmbB9A/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFQd3VJbFdCK0wu/anBn',//red
    'https://imgs.search.brave.com/8sUSR4hTXQVFLFjbc1GUG7GN6IhNskUUt8qaVYjZ99M/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTEwdHpFcTdpd0wu/anBn',//blue
    'https://imgs.search.brave.com/HMyI7mXg6ET4WX1VZMPmaICewYTrt4myCpF9TA8fQ0M/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjE2RmtRU0h3dEwu/anBn',//yellow
    'https://imgs.search.brave.com/xYNBsXj7a4Y1LJc9NtrMy8TN_g5Na17b_CSyOndAM6s/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjFTNnpHUlpKeUwu/anBn',//green
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
                const img = (section == 'men' ? maleImages : femaleImages)[colorIndex];
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
