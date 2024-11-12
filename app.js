"use strict";

// Express app for kitchenly-backend.

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError"); // [ ] TODO: build expressError.js

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const recipesRoutes = require("./routes/recipes");
const ingredientsRoutes = require("./routes/ingredients");
const categoriesRoutes = require("./routes/categories");
const tagsRoutes = require("./routes/tags");

const morgan = require("morgan")

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

// routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/recipes", recipesRoutes);
app.use("/ingredients", ingredientsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/tags", tagsRoutes);

// Handle 404 errors -- this matches everything.
app.use(function (req, res, next) {
    return next(new NotFoundError());
})

// generic error handler; anything unhandled goes here.
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message: message, status: status },
    });
});

module.exports = app;

