const mongoose = require("mongoose");
const ExtractionSchema = mongoose.Schema({
  idUser: {
    type: String,
    required: true
  },
  document: {
    type: Number,
    required: true
  },
  code: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: Number,
    required: true
  }, 
  isActive: {
    type: Boolean,
    default: true
  },
},
{
  timestamps: true
});

module.exports = mongoose.model('Extraction', ExtractionSchema);