const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Object,
        required: true
    }
},
//pass object
//when a new version of row is added to database
//automatically add timestamp to that row
//to use with createdAt and updatedAt
{timestamps: true}
);

module.exports = mongoose.model('Post',postSchema);