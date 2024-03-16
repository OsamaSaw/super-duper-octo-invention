import mongoose from "mongoose";
import {logChange} from "@/app/lib/utils";
const Schema = mongoose.Schema;


const measurementSchema = new mongoose.Schema({
    type: String,
    quantity: Number
}, { _id: false }); // Disable auto-generation of `_id` for each measurement

// const productSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     category: {
//         type: String,
//         required: true,
//     },
//     img: {
//         type: String, // URL or path to the image
//     },
//     desc: {
//         type: String,
//     },
//     measurements: [measurementSchema],
//     suppliers: [{
//         type: Schema.Types.ObjectId, // Assuming suppliers are referenced by their ObjectId
//         ref: 'Supplier',
//         required: false // Making it optional
//     }],
// }, { timestamps: true });

const productSchema = new mongoose.Schema({
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
    },
    measurements: [{
        type: {
            type: String, // 'type' is a field of the measurement object
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        barCode: {
            type: String, // 'type' is a field of the measurement object
            required: false,
            unique: true
        },
    }],
    price: {
        type: Number,
        required: true
    },
    suppliers: [{
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: false
    }],
}, { timestamps: true });


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


const stockSchema = new Schema({
        supplier: {
            type: Schema.Types.ObjectId,
            ref: 'Supplier',
            required: true
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        stockMeasure: {
            type: {
                type: String, // 'type' is a field of the measurement object
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }, // Use the existing measurement schema
        totalPrice: {
            type: Number,
            required: true
        },
        expiryDate: {
            type: Date,
            required: true
        },
        desc: {
            type: String,
        }
    },
    { timestamps: true }
);

const supplierSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
    },
    productsDelivered: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    desc: {
        type: String,
    }
});

const deliveryMethodSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
    }
});

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
    }
});

const stockItemSchema = new Schema({
    stockId: {
        type: Schema.Types.ObjectId,
        ref: 'Stock',
        required: true
    },
    quantityRemoved: {
        type: Number,
        required: true
    }
}, { _id: false });

const orderSchema = new Schema({
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        stocks: [stockItemSchema],
        totalQuantity: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        deliveryMethod: {
            type: Schema.Types.ObjectId,
            ref: 'DeliveryMethod',
            required: true
        }
    },
    { timestamps: true }
);


stockSchema.pre('save', function(next) {
    if (this.isNew) {
        this._action = 'create';
    } else {
        this._action = 'update';
        this._original = this.toObject(); // Capture original document before update
    }
    next();
});
stockSchema.post('save', function(doc) {
    logChange(this._action, doc);
});
stockSchema.post('remove', function(doc) {
    logChange('delete', doc);
});


orderSchema.pre('save', function(next) {
    if (this.isNew) {
        this._action = 'create';
    } else {
        this._action = 'update';
        this._original = this.toObject(); // Capture original document before update
    }
    next();
});
orderSchema.post('save', function(doc) {
    logChange(this._action, doc);
});
orderSchema.post('remove', function(doc) {
    logChange('delete', doc);
});


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
productSchema.post('remove', function (doc) {
    logChange('delete', doc);
});


// if (mongoose.models.Product) {
//     delete mongoose.models.Product;
// }
const refreshModels = true
export const User = (refreshModels && delete mongoose.connection.models.User, mongoose.models.User || mongoose.model('User', userSchema));
export const Product = (refreshModels && delete mongoose.connection.models.Product, mongoose.models.Product || mongoose.model('Product', productSchema));
export const Log = (refreshModels && delete mongoose.connection.models.Log, mongoose.models.Log || mongoose.model('Log', logSchema));
export const ErrorLog = (refreshModels && delete mongoose.connection.models.ErrorLog, mongoose.models.ErrorLog || mongoose.model('ErrorLog', errorLogSchema));
export const Stock = (refreshModels && delete mongoose.connection.models.Stock, mongoose.models.Stock || mongoose.model('Stock', stockSchema));
export const Supplier = (refreshModels && delete mongoose.connection.models.Supplier, mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema));
export const DeliveryMethod = (refreshModels && delete mongoose.connection.models.DeliveryMethod, mongoose.models.DeliveryMethod || mongoose.model('DeliveryMethod', deliveryMethodSchema));
export const Category = (refreshModels && delete mongoose.connection.models.Category, mongoose.models.Category || mongoose.model('Category', categorySchema));
export const Order = (refreshModels && delete mongoose.connection.models.Order, mongoose.models.Order || mongoose.model('Order', orderSchema));
