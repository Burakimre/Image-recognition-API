let mongoose = require('mongoose');
let bcrypt = require('bcrypt');

let userSchema = new mongoose.Schema({
    local: {
        email: {type: String},
        password: {type: String}
    },
    facebook: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    submissions: [{type: mongoose.Types.ObjectId, ref: 'Submission'}],
    role: {type: String, required: true},
    createdAt: {type: Date, default: new Date()},
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

userSchema.plugin(require('mongoose-role'), {
    roles: ['user', 'admin'],
    accessLevels: {
        user: ['user', 'admin'],
        admin: ['admin']
    }
});
userSchema.virtual('email').get(function () {
    if (this.local) {
        return this.local.email;
    } else if (this.facebook && this.facebook.token) {
        return this.facebook.email;
    } else if (this.google && this.google.token) {
        return this.google.email;
    }
    return '';
});
// Methods
// Generating hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Valid password check
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
}

mongoose.model('User', userSchema);
