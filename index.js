require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@programmershakib.sm4uc.mongodb.net/?retryWrites=true&w=majority&appName=programmershakib`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    const userCollection = client.db("usersDB").collection("users");
    const visaCollection = client.db("visasDB").collection("visas");
    const appliedVisaCollection = client
      .db("visasDB")
      .collection("appliedVisas");
    const questionCollection = client.db("visasDB").collection("questions");

    // visa
    app.get("/visas", async (req, res) => {
      const { visa_type } = req.query;
      let query = {};
      if (visa_type && visa_type !== "All") {
        query = { visa_type };
      }
      const cursor = visaCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/latestVisas", async (req, res) => {
      const result = await visaCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/visas/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.findOne(query);
      res.send(result);
    });

    app.get("/my_visas/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await visaCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/visas", async (req, res) => {
      const newVisa = req.body;
      const result = await visaCollection.insertOne(newVisa);
      res.send(result);
    });

    app.patch("/visas/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedVisa = {
        $set: {
          photo: req.body.photo,
          name: req.body.name,
          visa_type: req.body.visa_type,
          processing_time: req.body.processing_time,
          description: req.body.description,
          age_restriction: req.body.age_restriction,
          fee: req.body.fee,
          validity: req.body.validity,
          application_method: req.body.application_method,
          required_documents: req.body.required_documents,
        },
      };
      const result = await visaCollection.updateOne(filter, updatedVisa);
      res.send(result);
    });

    app.delete("/visas/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.deleteOne(query);
      res.send(result);
    });

    // applied visa
    app.get("/appliedVisas/:email", async (req, res) => {
      const email = req.params.email;
      const searchQuery = req.query.search || "";
      const filter = { email: email };
      if (searchQuery) {
        filter.name = { $regex: searchQuery, $options: "i" };
      }
      const result = await appliedVisaCollection.find(filter).toArray();
      res.send(result);
    });

    app.post("/appliedVisas", async (req, res) => {
      const newAppliedVisa = req.body;
      const result = await appliedVisaCollection.insertOne(newAppliedVisa);
      res.send(result);
    });

    app.delete("/appliedVisas/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appliedVisaCollection.deleteOne(query);
      res.send(result);
    });

    // users
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    app.patch("/users/login", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedUser = {
        $set: {
          lastSignInTime: req.body.lastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedUser = {
        $set: {
          name: req.body.name,
          photo: req.body.photo,
        },
      };
      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result);
    });

    app.delete("/users", async (req, res) => {
      const { email } = req.body;
      const result = await userCollection.deleteOne({ email });
      res.send(result);
    });

    // question
    app.post("/users/question", async (req, res) => {
      const question = req.body;
      const result = await questionCollection.insertOne(question);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assignment 10 is Running");
});

app.listen(port, () => {
  console.log(`Server is running On: ${port}`);
});
