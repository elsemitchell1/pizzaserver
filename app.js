const express = require("express");
const app = express();
const {resolve} = require("path");
const env = require("dotenv").config({path: "./.env"});
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
});

app.use(express.json());

app.use(express.static(process.env.STATIC_DIR));
app.get("/", (req, res) => {
    const path = resolve(process.env.STATIC_DIR + "/index.html");
});
app.get("/config", (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return items.reduce((total, item) => total + (item.price * item.quantity) * 100, 0);
};

app.post("/create-payment-intent", async (req, res) => {

    try {
        const items = req.body;
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "cad",
            amount: calculateOrderAmount(items),
            automatic_payment_methods: {
                enabled: true,
            },
            // You can add more parameters here as needed
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
});


app.listen(4242, () => console.log("Node server listening on port 4242!"));