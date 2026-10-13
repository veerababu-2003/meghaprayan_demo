const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    avatar: {
      type: String,
      default: ''
    },
    preferredMode: {
      type: String,
      enum: ['car', 'bike', 'walking'],
      default: 'car'
    },
    preferences: {
      distanceUnit: {
        type: String,
        enum: ['km', 'mi'],
        default: 'km'
      },
      tempUnit: {
        type: String,
        enum: ['c', 'f'],
        default: 'c'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      allowLiveLocationHistory: {
        type: Boolean,
        default: false
      }
    },
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: '30d'
        }
      }
    ],
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
