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
        const featuresProductsCollection = client.db('Features').collection('products');
        const inventoryCollection = client.db('Delivered').collection('products')

        // inventory items
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventories = await cursor.toArray();
            res.send(inventories);
        })
        // count inventory
        app.get('/inventoryCount', async (req, res) => {
            const count = await inventoryCollection.estimatedDocumentCount();
            res.send({ count });
        })
        // // inventory items by id
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventoryItem = await inventoryCollection.findOne(query);
            res.send(inventoryItem)
        })
        // add inventories item 
        app.post('/inventory', async (req, res) => {
            const addItem = req.body;
            const newItem = await inventoryCollection.insertOne(addItem);
            res.send(newItem);
        })
        // delete manage inventories
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const deleteItem = await inventoryCollection.deleteOne(query);
            res.send(deleteItem);
        })

        // features Products api 
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
        })

        // features Products Count api 
        app.get('/productsCount', async (req, res) => {
            const count = await featuresProductsCollection.estimatedDocumentCount();
            res.send({ count })
        })


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