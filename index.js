import express from "express";
import cors from "cors";
import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";

/**
 * AWS CONFIG
 * Elastic Beanstalk automatically provides credentials via IAM Role
 */
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1"
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.TABLE_NAME || "Contacts";

const app = express();

/**
 * MIDDLEWARE
 */
app.use(cors());
app.use(express.json());

/**
 * HEALTH CHECK
 * EB uses this to know your app is alive
 */
app.get("/health", (_, res) => {
  res.status(200).send("ok");
});

/**
 * API ROUTER
 */
const router = express.Router();

/**
 * GET ALL CONTACTS
 * GET /api/contacts
 */
router.get("/contacts", async (_, res) => {
  try {
    const data = await dynamo
      .scan({ TableName: TABLE })
      .promise();

    res.status(200).json(data.Items || []);
  } catch (err) {
    console.error("GET contacts error:", err);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

/**
 * CREATE CONTACT
 * POST /api/contacts
 */
router.post("/contacts", async (req, res) => {
  try {
    const item = {
      id: uuid(),
      ...req.body,
      createdAt: new Date().toISOString()
    };

    await dynamo
      .put({
        TableName: TABLE,
        Item: item
      })
      .promise();

    res.status(201).json(item);
  } catch (err) {
    console.error("POST contacts error:", err);
    res.status(500).json({ message: "Failed to create contact" });
  }
});

/**
 * UPDATE CONTACT
 * PUT /api/contacts/:id
 */
router.put("/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const UpdateExpression =
      "SET " + keys.map(k => `#${k} = :${k}`).join(", ");

    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    keys.forEach(k => {
      ExpressionAttributeNames[`#${k}`] = k;
      ExpressionAttributeValues[`:${k}`] = body[k];
    });

    await dynamo
      .update({
        TableName: TABLE,
        Key: { id },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues
      })
      .promise();

    res.status(200).json({ id, ...body });
  } catch (err) {
    console.error("PUT contacts error:", err);
    res.status(500).json({ message: "Failed to update contact" });
  }
});

/**
 * DELETE CONTACT
 * DELETE /api/contacts/:id
 */
router.delete("/contacts/:id", async (req, res) => {
  try {
    await dynamo
      .delete({
        TableName: TABLE,
        Key: { id: req.params.id }
      })
      .promise();

    res.status(200).json({ message: "Contact deleted" });
  } catch (err) {
    console.error("DELETE contacts error:", err);
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

/**
 * MOUNT API PREFIX
 */
app.use("/api", router);

/**
 * START SERVER
 * Elastic Beanstalk injects PORT
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
