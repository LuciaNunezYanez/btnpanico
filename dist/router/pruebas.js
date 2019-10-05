"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var app = express_1.Router();
app.get('/user/:id', function (req, res, next) {
    console.log('ID:', req.params.id);
    next();
}, function (req, res, next) {
    res.send('User Info');
});
// handler for the /user/:id path, which prints the user ID
app.get('/user/:id', function (req, res, next) {
    res.end(req.params.id);
});
