const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const { get } = require("express/lib/response");
app.use(bodyParser.json());

const router = require("./src/routes/user.routes");

app.all("*", (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} has been called`);
    next();
});

app.use(router);

app.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Share A Meal API",
    });
});

//End-point not found
app.all("*", (req, res) => {
    res.status(401).json({
        status: 401,
        result: "End-point not found",
    });
});

//Error handler
app.use((err, req, res, next) => {
    res.status(err.status).json(err);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app;
