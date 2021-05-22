import mongoose, { Schema, Document, Model, HookNextFunction } from "mongoose";
import getRandomColor from "../utils/randomColor";

interface UserAttrs {
  username: string;
  color: string;
}

interface UserDoc extends Document, UserAttrs {}

interface UserModel extends Model<UserDoc> {
  build: (attrs: UserAttrs) => UserDoc;
}

const usersSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "A username must be provided"],
    },
    color: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        (ret.id = ret._id), Reflect.deleteProperty(ret, "_id");
      },
    },
  }
);

usersSchema.pre("save", function (done: HookNextFunction) {
  if (this.isModified("username")) {
    const randomColor = getRandomColor();
    this.set("color", randomColor);
  }

  done();
});

usersSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", usersSchema);

export { User };
