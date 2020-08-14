const mongoose = require('mongoose');//import mongoose to help organize your data
const Schema = mongoose.Schema;//setting Schema to equal a mongoose schema

//We define our Schema. This is an object
const partnerSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

//Now we create a model of our schema and set it to Campsite
const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;