import {Category, DeliveryMethod, Order, Product, Stock, Supplier, User} from "./models";
import { connectToDB } from "./utils";




export const fetchUsers = async (q, page) => {
  const regex = new RegExp(q, "i");

  const ITEM_PER_PAGE = 2;

  try {
    connectToDB();
    const count = await User.find({ username: { $regex: regex } }).count();
    const users = await User.find({ username: { $regex: regex } })
      .limit(ITEM_PER_PAGE)
      .skip(ITEM_PER_PAGE * (page - 1));
    return { count, users };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch users!");
  }
};

export const fetchUser = async (id) => {
  console.log(id);
  try {
    connectToDB();
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user!");
  }
};

export const fetchProducts = async (q, page, supplierName, barcode) => {
  console.log(q);
  const ITEM_PER_PAGE = 5;
  const regex = new RegExp(q, "i");
  const supplierRegex = new RegExp(supplierName, "i");

  try {
    connectToDB();

    // Build the query
    let query = { $or: [{ title: { $regex: regex } }] };
    if (supplierName) {
      query.$or.push({ 'suppliers.name': { $regex: supplierRegex } });
    }
    if (barcode) {
      query.$or.push({ barcode: barcode });
    }

    // Count total matching documents
    const count = await Product.find(query).count();

    // Fetch products with pagination
    const products = await Product.find(query)
        .populate('suppliers') // Populate suppliers if searching by supplier name
        .limit(ITEM_PER_PAGE)
        .skip(ITEM_PER_PAGE * (page - 1));

    return { count, products };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch products!");
  }
};

export const fetchProductsWithStocks = async (q, page) => {
  const ITEM_PER_PAGE = 5;
  const regex = new RegExp(q, "i");

  try {
    connectToDB();

    // Start with the Product collection
    const productsWithStocks = await Product.aggregate([
      { $match: { title: { $regex: regex } } }, // Match the query
      { $skip: ITEM_PER_PAGE * (page - 1) },    // Pagination: skip
      { $limit: ITEM_PER_PAGE },               // Pagination: limit
      {
        $lookup: { // Reverse populate with Stock information
          from: 'stocks',
          localField: '_id',
          foreignField: 'product',
          as: 'stocks'
        }
      },
      { $unwind: "$stocks" }, // Deconstruct the stocks array
      { $sort: { "stocks.expiryDate": 1 } }, // Sort by expiry date
      {
        $group: {
          _id: "$_id",
          productDoc: { $first: "$$ROOT" }, // Take the first document to preserve product fields
          stocks: { $push: "$stocks" }, // Reconstruct the stocks array
          nextExpiryDate: { $first: "$stocks.expiryDate" } // Get the nearest expiry date
        }
      },
      {
        $lookup: { // Populate with Supplier information
          from: 'suppliers',
          localField: 'productDoc.suppliers',
          foreignField: '_id',
          as: 'supplierDetails'
        }
      },
      {
        $project: { // Format the output
          _id: "$productDoc._id",
          title: "$productDoc.title",
          category: "$productDoc.category",
          img: "$productDoc.img",
          desc: "$productDoc.desc",
          measurements: "$productDoc.measurements",
          suppliers: "$productDoc.suppliers",
          supplierNames: { $map: { input: "$supplierDetails", as: "supplier", in: "$$supplier.name" } },
          totalStock: { $sum: "$stocks.stockMeasure.quantity" },
          totalPrice: { $sum: "$stocks.totalPrice" },
          nextExpiryDate: 1 // Include the nearest expiry date
        }
      }
    ]);

    // Count total matching documents (for pagination)
    const count = await Product.find({ title: { $regex: regex } }).count();

    return { count, products: productsWithStocks };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch products with stock information!");
  }
};



export const fetchProduct = async (id) => {
  try {
    connectToDB();
    const product = await Product.findById(id).populate('suppliers');
    return product;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch product!");
  }
};

export const fetchStocks = async (q, page) => {
  console.log(q);
  const regex = new RegExp(q, "i");

  const ITEM_PER_PAGE = 2;

  try {
    await connectToDB();

    // Assuming 'products' is the name of your products collection
    let aggregation = [
      {
        $lookup: {
          from: 'products', // Replace with your actual products collection name
          localField: 'product', // Field in the 'stocks' collection
          foreignField: '_id', // Field in the 'products' collection
          as: 'productDetails' // Array containing the matching product
        }
      },
      {
        $unwind: '$productDetails' // Deconstructs the 'productDetails' array
      },
      {
        $match: { 'productDetails.title': { $regex: regex } } // Filter by product name
      },
      {
        $limit: ITEM_PER_PAGE
      },
      {
        $skip: ITEM_PER_PAGE * (page - 1)
      }
    ];

    const stocks = await Stock.aggregate(aggregation);

    // Count can be obtained by a separate aggregation without limit and skip
    let countAggregation = [
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $match: { 'productDetails.title': { $regex: regex } }
      },
      {
        $count: 'total'
      }
    ];

    const countResult = await Stock.aggregate(countAggregation);
    const count = countResult.length > 0 ? countResult[0].total : 0;

    return { count, stocks };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch stocks!");
  }

};

export const fetchStock = async (id) => {
  try {
    connectToDB();
    const stock = await Stock.findById(id);
    return stock;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch stock!");
  }
};

export const fetchCategories = async (q, page) => {
  console.log(q);
  const regex = new RegExp(q, "i");
  const ITEM_PER_PAGE = 2;
  try {
    connectToDB();
    const count = await Category.find({ name: { $regex: regex } }).count();
    const categories = await Category.find({ name: { $regex: regex } })
        .limit(ITEM_PER_PAGE)
        .skip(ITEM_PER_PAGE * (page - 1));
    return { count, categories };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch products!");
  }
};

export const fetchCategory = async (id) => {
  try {
    connectToDB();
    const category = await Category.findById(id);
    return category;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch product!");
  }
};

export const fetchDeliveryMethods = async (q, page) => {
  console.log(q);
  const regex = new RegExp(q, "i");
  const ITEM_PER_PAGE = 2;
  try {
    connectToDB();
    const count = await DeliveryMethod.find({ name: { $regex: regex } }).count();
    const places = await DeliveryMethod.find({ name: { $regex: regex } })
        .limit(ITEM_PER_PAGE)
        .skip(ITEM_PER_PAGE * (page - 1));

    return { count, places };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch DeliveryMethods!");
  }
};

export const fetchDeliveryMethod = async (id) => {
  try {
    connectToDB();
    const Delivery = await DeliveryMethod.findById(id);
    return Delivery;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch product!");
  }
};

export const fetchOrders = async (q, page) => {
  console.log(q);
  const regex = new RegExp(q, "i");

  const ITEM_PER_PAGE = 2;

  try {
    connectToDB();
    const count = await Order.find({ title: { $regex: regex } }).count();
    const orders = await Order.find({ title: { $regex: regex } })
        .limit(ITEM_PER_PAGE)
        .skip(ITEM_PER_PAGE * (page - 1));
    return { count, orders };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch Orders!");
  }
};

export const fetchOrder = async (id) => {
  try {
    connectToDB();
    const order = await Order.findById(id);
    return order;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch order!");
  }
};

export const fetchSuppliers = async (q, page) => {
  const regex = new RegExp(q, "i");

  const ITEM_PER_PAGE = 2;

  try {
    connectToDB();
    const count = await Supplier.find({ name: { $regex: regex } }).count();
    const suppliers = await Supplier.find({ name: { $regex: regex } })
        .limit(ITEM_PER_PAGE)
        .skip(ITEM_PER_PAGE * (page - 1));
    return { count, suppliers };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch Suppliers!");
  }
};

export const fetchSupplier = async (id) => {
  try {
    connectToDB();
    const supplier = await Supplier.findById(id);
    return supplier;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch Supplier!");
  }
};

// DUMMY DATA

export const cards = [
  {
    id: 1,
    title: "Total Users",
    number: 10.928,
    change: 12,
  },
  {
    id: 2,
    title: "Stock",
    number: 8.236,
    change: -2,
  },
  {
    id: 3,
    title: "Revenue",
    number: 6.642,
    change: 18,
  },
];