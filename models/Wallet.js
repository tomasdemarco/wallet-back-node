const mongoose = require("mongoose")
const WalletSchema = mongoose.Schema({
  idUser: {
    type: String,
    required: true
  },
  balancePesos: {
    type: Number,
    default: 0
  },
  balanceDolares: {
    type: Number,
    default: 0
  },
  numberCard: {
    type: Number,
    default: 0
  },
  nameCard: {
    type: String,
    default: ''
  },
  expCard: {
    type: String,
    default: ''
  },
  cvvCard: {
    type: Number,
    default: 0
  },
},
{
  timestamps: true
})

module.exports = mongoose.model('Wallet', WalletSchema)