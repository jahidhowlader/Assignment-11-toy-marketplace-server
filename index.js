const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const PORT = process.env.PORT || 5000

const app = express()


// Express Middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hello world')
})

// Connect MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h88b4w7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("CastleDisneyDB").collection("toysCollection")

    // Fetch All toys
    app.get("/toys", async (req, res) => {

      // const option = {
      //     projection: {
      //         seller: 1, 
      //         toy_name: 1, 
      //         available_quantity: 1, 
      //         sub_category: 1, 
      //         price: 1, 
      //     }
      // }
      const cursor = await toysCollection.find().toArray()
      res.send(cursor)
    })

    // Fetch Sub Category Toys
    app.get("/:category", async (req, res) => {
      
      const subCategory = req.params.category

      let query = {sub_category: subCategory}

      const result = await toysCollection.find(query).toArray()
      res.send(result)
      
    })

    // Fetch Specific Toy
    app.get("/toys/:_id", async (req, res) => {

      const _id = req.params._id

      const query = { _id: new ObjectId(_id) }
      const toyDetails = await toysCollection.findOne(query)
      res.send(toyDetails)
    })

    // Fetch My Toy
    app.get("/my-toys", async (req, res) => {

      let query = {}
      if (req.query?.email) {
        query = { sellerEmail: req.query.email }
      }

      const result = await toysCollection.find(query).toArray()
      res.send(result)
    })

    // Post New Toys
    app.post("/add-toys", async (req, res) => {
     
      const toyDetails = req.body

      const result = await toysCollection.insertOne(toyDetails)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
})