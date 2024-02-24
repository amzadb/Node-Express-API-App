require ('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/product');

const app = express();
const PORT = process.env.PORT || 4444;

const FRONTEND = process.env.FRONTEND;
var cors = require('cors');
var corsOptions = {
    origin: FRONTEND,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    next();
});

// Database Connection
mongoose.connect(process.env.DB_CONNECTION);
const dbConn = mongoose.connection;
dbConn.on("error", (error) => console.log(error));
dbConn.once("open", () => console.log("Connected to MongoDB successfully!"));

app.get('/', (req, resp) => {
    resp.send('Hello World!');
});

// Middleware function to return json 
app.use(express.json());

// Create new product
app.post('/product', async(req, resp) => {
    // resp.send(req.body);
    try {
        const product = await Product.create(req.body)
        resp.status(200).json(product);
    } catch (error) {
        console.log(error.message);
        resp.status(500).json({message: error.message})
    }
});

// Read products collection
app.get('/products', async(req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
});

// Read product collection by Id
app.get('/products/:id', async(req, res) =>{
    try {
        const {id} = req.params;
        const product = await Product.findById(id);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
});

// Update product
app.put('/products/:id', async(req, resp) => {
    try {
        const {id} = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body);
        if(!product){
            return resp.status(404).json({message: `cannot find any product with ID ${id}`})
        }
        const updatedProduct = await Product.findById(id);
        resp.status(200).json(updatedProduct);
    } catch (error) {
        resp.status(500).json({message: error.message})
    }
});

// Delete a product
app.delete('/products/:id', async(req, resp) =>{
    try {
        const {id} = req.params;
        const product = await Product.findByIdAndDelete(id);
        if(!product){
            return resp.status(404).json({message: `cannot find any product with ID ${id}`})
        }
        resp.status(200).json(product);
    } catch (error) {
        resp.status(500).json({message: error.message})
    }
})

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
