import mongoose, { Schema } from 'mongoose';

const WhMessageDetailSchema = new mongoose.Schema({
  entry: {type: Schema.Types.Mixed},
});

const WhMessageDetailSchemaModel = mongoose.model('WhMessageDetail', WhMessageDetailSchema);

export const webhooksRepository = {
  create: async (payload: any) => {
    const newMessageDetail = new WhMessageDetailSchemaModel({
      ...payload,
    });
    await newMessageDetail.save();
  },
};
