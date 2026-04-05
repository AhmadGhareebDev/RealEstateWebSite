const mongoose = require('mongoose');


const viewEventSchema = new mongoose.Schema({
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    targetType: {
        type: String,
        enum: ['property' , 'agent'],
        required: true,
    },

    viewerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },

    anonKeyHash: {
        type: String,
        default: null,
    },

    source: {
        type: String,
        enum: ['web'],
        default: 'web'
    },

    viewedAt: {
        type: Date,
        default: Date.now
    },
},
{
    timestamps: false
}
);

viewEventSchema.index({ targetType: 1, targetId: 1, viewedAt: -1 });
viewEventSchema.index({ viewerUserId: 1, targetType: 1, targetId: 1, viewedAt: -1 });
viewEventSchema.index({ anonKeyHash: 1, targetType: 1, targetId: 1, viewedAt: -1 });


viewEventSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('ViewEvent', viewEventSchema);