import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  shares: { type: Number, required: true, min: 0 },
  avgPrice: { type: Number, required: true },
  sector: { type: String, required: true }
}, { timestamps: true });

const Holding = mongoose.model('Holding', holdingSchema);
export default Holding;
