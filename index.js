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
    // await client.connect();

    const toysCollection = client.db("CastleDisneyDB").collection("ToyCollection")

    // Fetch All toys
    app.get("/toys", async (req, res) => {

      const cursor = await toysCollection.find().toArray()
      res.send(cursor)
    })

    // Get sorting data
    app.get("/toys/sort/:_order", async (req, res) => {

      if (req.params._order === 'ascending') {
        const cursor = await toysCollection.find().sort({ price: 1 }).toArray()
        return res.send(cursor)
      } else if (req.params._order === 'descending') {
        const cursor = await toysCollection.find().sort({ price: -1 }).toArray()
        return res.send(cursor)
      }
    })

    // Search Specific toy
    await toysCollection.createIndex({ title: 1 })

    app.get("/toys/:search", async (req, res) => {

      const searchText = req.params.search

      const result = await toysCollection.find({
        toy_name: { $regex: searchText, $options: "i" }
      }).toArray()

      res.send(result)
    })

    // Fetch My Toy
    app.get("/my-toys", async (req, res) => {

      let query = {}
      if (req.query?.email) {
        query = { seller_email: req.query.email }
      }

      const result = await toysCollection.find(query).toArray()
      res.send(result)
    })

    // Fetch Sub Category Toys
    app.get("/:category", async (req, res) => {

      const subCategory = req.params.category

      let query = { sub_category: subCategory }

      const result = await toysCollection.find(query).toArray()
      res.send(result)

    })

    // Fetch Specific Toy
    app.get("/toy/:_id", async (req, res) => {

      const _id = req.params._id

      const query = { _id: new ObjectId(_id) }
      const toyDetails = await toysCollection.findOne(query)
      res.send(toyDetails)
    })

    // Fetch My Toy
    app.get("/my-toys", async (req, res) => {

      const result = await toysCollection.find().toArray()
      res.send(result)
    })

    // Post New Toys
    app.post("/add-toys", async (req, res) => {

      const toyDetails = req.body

      const result = await toysCollection.insertOne(toyDetails)
      res.send(result)
    })

    // Toy updated details
    app.put("/my-toys/:_id", async (req, res) => {

      const _id = req.params._id

      const filter = {
        _id: new ObjectId(_id)
      }

      const updateToy = {
        $set: {
          price: req.body.price,
          available_quantity: req.body.available_quantity,
          description: req.body.description,
        }
      }

      const result = await toysCollection.updateOne(filter, updateToy)
      res.send(result)
    })

    // delete my toy 
    app.delete("/my-toys:_id", async (req, res) => {

      const _id = req.params._id

      const query = {
        _id: new ObjectId(_id)
      }

      const result = await toysCollection.deleteOne(query)
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