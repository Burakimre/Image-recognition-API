let mongoose = require('mongoose');

let submissionSchema = new mongoose.Schema({
    user: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    imageUrl: {type: String, required: [true, 'No image url given.']},
    tags: {type: [{confidence: Number, tag: String}], required: true},
    createdAt: {type: Date, default: new Date()},
    target: {type: mongoose.Types.ObjectId, required: true, ref: 'Target'},
    score: {type: Number, required: true}
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

mongoose.model('Submission', submissionSchema);
