let mongoose = require('mongoose');

let targetsSchema = new mongoose.Schema({
    name: {type: String, required: [true, 'The name field is required']},
    description: {type: String},
    imageUrl: {type: String, required: [true, 'The image input is required']},
    tags: {type: [{confidence: Number, tag: String}], required: true},
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    submissions: [{type: mongoose.Types.ObjectId, ref: 'Submission'}],
    createdAt: {type: Date, default: new Date()}
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

mongoose.model('Target', targetsSchema);
