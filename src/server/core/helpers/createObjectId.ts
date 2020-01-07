import mongoose from 'mongoose';

export const createObjectId = (): string => {
  return (new mongoose.Types.ObjectId()).toHexString();
};
