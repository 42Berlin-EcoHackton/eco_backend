const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    transport_log: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TransportLog',
      },
    ],
    food_log: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FoodLog',
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model('User', userSchema);

module.exports = User;
