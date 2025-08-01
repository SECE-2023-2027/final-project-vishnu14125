import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.provider; // Password required only for email/password auth
    },
  },
  provider: {
    type: String,
    enum: ['credentials', 'github'],
    default: 'credentials',
  },
  providerId: {
    type: String,
    sparse: true, // Allows multiple null values
  },
  image: {
    type: String,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  favorites: [{
    type: String, // Store date strings (YYYY-MM-DD)
    match: /^\d{4}-\d{2}-\d{2}$/,
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    fontFamily: {
      type: String,
      enum: ['serif', 'sans-serif', 'monospace'],
      default: 'serif',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ provider: 1, providerId: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
