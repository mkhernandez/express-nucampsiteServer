const mongoose = require('mongoose');//import mongoose to help organize your data
const Schema = mongoose.Schema;//setting Schema to equal a mongoose schema

require('mongoose-currency').loadType(mongoose);//import mongoose currency then load the new currency type into mongoose

const Currency = mongoose.Types.Currency;

//We define our Schema. This is an object
const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

//Now we create a model of our schema and set it to Campsite
const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;