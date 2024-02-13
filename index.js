const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middlewere
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://job-portal-48796.web.app"],
    credentials: true,
  })
);

const uri =
  "mongodb+srv://admin:admin@cluster0.0e8wm8t.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const database = client.db("job-portal").collection("job-list");
  const companies = client.db("job-portal").collection("companyList");
  const categories = client.db("job-portal").collection("categoryList");
  const reviews = client.db("job-portal").collection("reviewList");
  try {
    app.get("/jobList", async (req, res) => {
      const query = {};
      const busList = await database.find(query).sort({ _id: 1 }).toArray();
      res.send(busList);
    });

    app.get("/categoryList", async (req, res) => {
      const query = {};
      const busList = await categories.find(query).toArray();
      res.send(busList);
    });

    app.post("/companyList", async (req, res) => {
      const data = req.body;

      const userEmail = data.email;
      const query = { email: userEmail };
      const findDuplicate = await companies.findOne(query);
      if (!findDuplicate) {
        const result = await companies.insertOne(data);

        res.send(result);
        return;
      }
    });

    app.post("/jobList", async (req, res) => {
      const data = req.body;
      const result = await database.insertOne(data);
      res.send(result);
      return;
    });

    app.post("/review", async (req, res) => {
      const data = req.body;
      const result = await database.insertOne(data);
      res.send(result);
      return;
    });

    app.get("/companyList", async (req, res) => {
      const queryParam = req.query.email;
      const queryId = req.query.id;
      let query = {};
      if (queryId) {
        const query = { _id: new ObjectId(queryId) };
        const findDuplicate = await companies.findOne(query);

        if (findDuplicate == null) {
          res.send({ message: "no user found" });
          return;
        }

        if (findDuplicate?.email) {
          res.send({ result: findDuplicate });
        }
        return;
      }
      if (queryParam) {
        const query = { email: queryParam };
        const findDuplicate = await companies.findOne(query);

        if (findDuplicate == null) {
          res.send({ message: "no user found" });
          return;
        }

        if (findDuplicate?.email) {
          res.send({ result: findDuplicate });
        }
        return;
      }

      const companyList = await companies.find(query).toArray();
      res.send(companyList);
    });

    app.get("/jobDetails", async (req, res) => {
      const queryParam = req.query.id;

      if (queryParam) {
        const query = { _id: new ObjectId(queryParam) };
        const findDuplicate = await database.findOne(query);

        if (findDuplicate?.name) {
          res.send({ result: findDuplicate });
        }
      }
    });

    app.get("/reviews", async (req, res) => {
      const email = req.query.email;

      let message = null;
      if (email) {
        let query = { email: email };
        const existingReview = await reviews.findOne(query);
        if (existingReview) {
          message = "User has already submitted a review";
        }
      }

      const result = await reviews.find({}).sort({ _id: -1 }).toArray();

      res.send({ result: result, message: message });
    });

    app.post("/reviews", async (req, res) => {
      const data = req.body;
      const email = data.email;
      const query = { email: email };
      const existingReview = await reviews.findOne(query);
      if (existingReview) {
        res.send({ message: "User has already submitted a review" });
        return;
      }

      const result = await reviews.insertOne(data);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {});
