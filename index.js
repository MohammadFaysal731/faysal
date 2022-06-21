const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tcjah.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();
        const inventoryCollection = client.db('storage_devices').collection('inventories');
        const featuresProductsCollection = client.db('storage_devices').collection('featureProducts');

        //this api for home inventory 
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventories = await cursor.limit(6).toArray();
            res.send(inventories);
        });
        // this api for manage inventories
        app.get('/inventories', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventories = await cursor.toArray();
            res.send(inventories);
        });
        // this api for add inventory
        app.post('/inventories', async (req, res) => {
            const newProduct = req.body;
            const query = { name: newProduct.name, description: newProduct.description, price: newProduct.price, quantity: newProduct.quantity, supplierName: newProduct.supplierName, sold: newProduct.sold, image: newProduct.image }
            const addProduct = await inventoryCollection.insertOne(query);
            res.send(addProduct);
        });
        // this api for count all inventory
        app.get('/inventoryCount', async (req, res) => {
            const count = await inventoryCollection.estimatedDocumentCount();
            res.send({ count });
        });
        //this api for specific inventory 
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventoryItem = await inventoryCollection.findOne(query);
            res.send(inventoryItem)
        });
        // this api for update  inventory quantity
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const delivered = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: delivered.newQuantity
                }
            }
            const result = await inventoryCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        //this api for add new inventories  
        app.post('/inventory', async (req, res) => {
            const addItem = req.body;
            const newItem = await inventoryCollection.insertOne(addItem);
            res.send(newItem);
        });
        //this api for delete manage inventories
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const deleteItem = await inventoryCollection.deleteOne(query);
            res.send(deleteItem);
        });
        // this api for my item
        app.get('/myitems', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const myItems = await inventoryCollection.find(query).toArray();
            res.send(myItems);
        })
        //this api for features Products api 
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = featuresProductsCollection.find(query);
            let products;
            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.send(products);
        });
        // this api for count all features Products
        app.get('/productsCount', async (req, res) => {
            const count = await featuresProductsCollection.estimatedDocumentCount();
            res.send({ count })
        });


    }
    finally {

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('StorageDevicesServer')
})

app.listen(port, () => {
    console.log('storage-devices-server runing on ', port)
})