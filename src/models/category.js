const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    cat: {
      type: String,
      required: [true, "Name of category is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description of category is required"],
      trim: true,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

schema.methods.toJSON = function () {
  const Obj = this.toObject();
  delete Obj.createdAt;
  delete Obj.updatedAt;
  delete Obj.__v;
  return Obj;
};

const Cat = mongoose.model("Category", schema);

module.exports = Cat;
