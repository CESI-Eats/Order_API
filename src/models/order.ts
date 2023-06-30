import mongoose from 'mongoose';

// Define schema for Payment model
const OrderSchema = new mongoose.Schema({
  _idMenus: {
    type: [String],
    required: true,
  },
  _idUser: {
    type: String,
    required: true,
  },
  _idRestorer: {
    type: String,
    required: true,
  },
  _idDeliveryman: {
    type: String,
    required: false,
  },
  _idPayment: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  withCommissionAmount: {
    type: Number,
    required: true,
  },
  deliveryAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'submitted',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

// Export model
export default mongoose.model('Order', OrderSchema);
