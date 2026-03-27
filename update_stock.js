const mongoose = require('mongoose');
const Product = require('./server/models/Product');
mongoose.connect('mongodb://127.0.0.1:27017/hustle-hub').then(async () => {
    await Product.updateMany({}, { $set: { stock: 10, trackStock: true }});
    console.log('Products updated successfully');
    process.exit(0);
}).catch(console.error);
