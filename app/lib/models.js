import mongoose from "mongoose";
import {logChange} from "@/app/lib/utils";

const measurementSchema = new mongoose.Schema({
    type: String,
    quantity: Number
}, { _id: false }); // Disable auto-generation of `_id` for each measurement

const logSchema = new mongoose.Schema({
    user: String, // User who made the change
    action: String, // Type of action (e.g., 'create', 'update', 'delete')
    date: { type: Date, default: Date.now },
    documentId: mongoose.Schema.Types.ObjectId, // ID of the document that was changed
    modelName: String, // Model of the document
    changes: mongoose.Schema.Types.Mixed, // Details of the changes
});

const errorLogSchema = new mongoose.Schema({
    timestamp: Date,
    message: String,
    stack: String,
    // You can add more fields as needed
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        category: {
            type: String,
            required: true,
        },
        img: {
            type: String, // URL or path to the image
        },
        desc: {
            type: String,
            required: true,
        },
        measurements: [measurementSchema],
        suppliers: [String], // Array of supplier IDs or names
    },
    { timestamps: true }
);


productSchema.pre('save', function (next) {
    if (this.isNew) {
        this._action = 'create';
    } else {
        this._action = 'update';
        this._original = this.toObject(); // Capture original document
    }
    next();
});

productSchema.post('save', function (doc) {
    logChange(doc._action, doc);
});

// Middleware for remove
productSchema.post('remove', function (doc) {
    logChange('delete', doc);
});

// if (mongoose.models.Product) {
//     delete mongoose.models.Product;
// }
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Log = mongoose.models.Log || mongoose.model('Log', logSchema);
export const ErrorLog = mongoose.models.ErrorLog || mongoose.model('ErrorLog', errorLogSchema);


