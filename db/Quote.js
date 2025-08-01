import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
  },
  category: {
    type: String,
    default: 'general',
    trim: true,
  },
  isQuoteOfTheWeek: {
    type: Boolean,
    default: false,
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

// Index for efficient queries
QuoteSchema.index({ date: 1 });
QuoteSchema.index({ isQuoteOfTheWeek: 1 });

export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
