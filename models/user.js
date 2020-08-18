const express = require('express');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  admin: {
    type: Boolean,
    default: false
  }
});

//hashing and salting the password
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);


