const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

//middlewere
app.use(express.json());
app.use(cors());

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
  try {
    app.get("/jobList", async (req, res) => {
      const query = {};
      const busList = await database.find(query).toArray();
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
    app.get("/user", async (req, res) => {
      const endpoint = req.query.email;
      const query = { email: endpoint };
      const findDuplicate = await companies.findOne(query);
      if (findDuplicate?.email) {
        res.send({ result: findDuplicate });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {});
