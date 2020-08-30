const mongoose = require('mongoose');//import mongoose to help organize your data
const Schema = mongoose.Schema;//setting Schema to equal a mongoose schema

//We define our Schema. This is an object
const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
    }]
},{
    timestamps: true
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;