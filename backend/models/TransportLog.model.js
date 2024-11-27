const { Schema, model } = require('mongoose');

const transportLogSchema = new Schema(
  {
    name: {
      type: String,
    },
    co2: {
      type: String,
    },
    points: {
      type: Number,
    },
    user: {
      // This references the User model
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const TransportLog = model('TransportLog', transportLogSchema);

module.exports = TransportLog;
