import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  secretKey: { type: String, required: true, unique: true, index: true },
  balance: { type: Number, default: 1000000 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 1 },
  college: { type: String, default: 'Investor' },
  completedChallenges: { type: [Number], default: [] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
