"use server";

import { revalidatePath } from "next/cache";
import {Category, DeliveryMethod, Order, Product, Stock, Supplier, User} from "./models";
import {connectToDB, logError} from "./utils";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { signIn } from "../auth";
import sha1 from 'crypto-js/sha1';
import mongoose from "mongoose";


export const getProduct = async (id) => {
  try {
    connectToDB();
    const product = await Product.findById(id);
    return product;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch product!");
  }
};
export const getProductByBarcode = async (barcode) => {
  try {
    connectToDB();
    const product = await Product.findOne({ 'measurements.barCode': barcode });
    return JSON.parse(JSON.stringify(product));
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch product by barcode!");
  }
};
export const getProductMeasures = async (id) => {
  try {
    await connectToDB(); // Make sure to await the connection
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return JSON.parse(JSON.stringify(product.measurements)); // Return only the measurements field
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch product!");
  }
};
export const addUser = async (formData) => {
  const { username, email, password, phone, address, isAdmin, isActive } =
    Object.fromEntries(formData);

  try {
    connectToDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      isAdmin,
      isActive,
    });

    await newUser.save();
  } catch (err) {
    console.log(err);
    throw new Error("Failed to create user!");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};
export const updateUser = async (formData) => {
  const { id, username, email, password, phone, address, isAdmin, isActive } =
    Object.fromEntries(formData);

  try {
    connectToDB();

    const updateFields = {
      username,
      email,
      password,
      phone,
      address,
      isAdmin,
      isActive,
    };

    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || undefined) && delete updateFields[key]
    );

    await User.findByIdAndUpdate(id, updateFields);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update user!");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};
// Assuming connectToDB, revalidatePath, and redirect are defined elsewhere
export const fetchProductsList = async () => {
  try {
    connectToDB();
    const products = await Product.find({});
    return products.map(product => ({
      label: product.title, // Assuming each product has a 'title' field
      value: product._id.toString(), // Convert ObjectId to string
      // measurements: JSON.parse(JSON.stringify(product.measurements))
    }));
    // return products
  } catch (err) {
    console.error("Failed to fetch products: ", err);
    throw err;
  }
};
export const addProduct = async (formData) => {
  try {
    connectToDB();
    // Handle the image upload first and get the URL/path
    // The logic here depends on how you implement image storage
    let imgPath = ''

    if (formData.get('image')) {
      try {
        imgPath = await uploadImageDirectly(formData.get('image'));
        // Now you have the image URL, proceed with the rest of your form processing
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    console.log(JSON.parse(formData.get('measurements')))
    console.log(formData.get('measurements'))
    const newProduct = new Product({
      title: formData.get('title'),
      category: formData.get('category'),
      img: imgPath,
      desc: formData.get('desc'),
      measurements: JSON.parse(formData.get('measurements')),
      suppliers: JSON.parse(formData.get('suppliers')),
      price:formData.get('price'),
    });
    console.log(newProduct)
    await newProduct.save();
    return {status:true, msg:"success"}
  } catch (err) {
    await logError(err);
    return {status:false, msg:err}
    // throw new Error("Failed to create product!");
  }
};
export const updateProduct = async (formData) => {
  const { id, title, desc, price, stock, color, size } =
    Object.fromEntries(formData);

  try {
    connectToDB();

    const updateFields = {
      title,
      desc,
      price,
      stock,
      color,
      size,
    };

    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || undefined) && delete updateFields[key]
    );

    await Product.findByIdAndUpdate(id, updateFields);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update product!");
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
};
export const deleteUser = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await User.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete user!");
  }

  revalidatePath("/dashboard/products");
};
export const deleteProduct = async (formData) => {
  const { id, img} = Object.fromEntries(formData);
  try{
    deleteImageDirectly(extractPublicId(img))
  }catch (err){
    console.log("no image was found")
  }

  try {
    connectToDB();
    await Product.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete product!");
  }

  revalidatePath("/dashboard/products");
};
export const fetchSuppliersList = async () => {
  try {
    connectToDB();
    const suppliers = await Supplier.find({});
    return suppliers.map(supplier => ({
      label: supplier.name, // Assuming each product has a 'title' field
      value: supplier._id.toString() // Convert ObjectId to string
    }));
  } catch (err) {
    console.error("Failed to fetch products: ", err);
    throw err;
  }
};
export const addSupplier = async (formData) => {
  try {
    connectToDB();

    const productsDelivered = formData.getAll('productsDelivered');

    const newCategory = new Supplier({
      name: formData.get('name'),
      phoneNumber: formData.get('phoneNumber'),
      desc: formData.get('desc'),
      productsDelivered: productsDelivered
    });
    await newCategory.save();

    return {status:true, msg:"success"}
  } catch (err) {
    await logError(err);
    return {status:false, msg:err}
    // throw new Error("Failed to create product!");
  }
};
export const deleteSupplier = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await Supplier.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete Supplier!");
  }

  revalidatePath("/dashboard/suppliers");
};
export const addStock = async (formData) => {
  try {
    connectToDB();
    const stockMeasure = JSON.parse(formData.get('stockMeasure'));
    console.log(stockMeasure)

    const newCategory = new Stock({
      supplier: formData.get('supplier'),
      product: formData.get('product'),
      stockMeasure: stockMeasure,
      totalPrice: formData.get('totalPrice'),
      expiryDate:formData.get('expiryDate'),
      desc: formData.get('desc'),

    });
    console.log(newCategory)
    await newCategory.save();

    return {status:true, msg:"success"}
  } catch (err) {
    await logError(err);
    return {status:false, msg:err}
    // throw new Error("Failed to create product!");
  }
};
export const deleteStock = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await Stock.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete stock!");
  }

  revalidatePath("/dashboard/stocks");
};
export const addCategory = async (formData) => {
  try {
    connectToDB();

    const newCategory = new Category({
      name: formData.get('name'),
      desc: formData.get('desc'),
    });

    await newCategory.save();

    return {status:true, msg:"success"}
  } catch (err) {
    await logError(err);
    return {status:false, msg:err}
    // throw new Error("Failed to create product!");
  }
};
export const updateCategory = async (formData) => {
  const { id, name, desc } =
      Object.fromEntries(formData);
  try {
    connectToDB();
    const updateFields = {
      name,
      desc,
    };

    Object.keys(updateFields).forEach(
        (key) =>
            (updateFields[key] === "" || undefined) && delete updateFields[key]
    );

    await Category.findByIdAndUpdate(id, updateFields);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update product!");
  }

  revalidatePath("/dashboard/categories");
  redirect("/dashboard/categories");
};
export const deleteCategory = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await Category.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete product!");
  }

  revalidatePath("/dashboard/categories");
};
export const addDeliveryMethod = async (formData) => {
  try {
    connectToDB();

    const newDeliveryMethod = new DeliveryMethod({
      name: formData.get('name'),
      desc: formData.get('desc'),
    });

    await newDeliveryMethod.save();
    revalidatePath("/dashboard/categories");
    return {status:true, msg:"success"}

  } catch (err) {
    await logError(err);
    return {status:false, msg:err}
    // throw new Error("Failed to create product!");
  }
};
export const updateDeliveryMethod = async (formData) => {
  const { id, name, desc } =
      Object.fromEntries(formData);
  try {
    connectToDB();
    const updateFields = {
      name,
      desc,
    };

    Object.keys(updateFields).forEach(
        (key) =>
            (updateFields[key] === "" || undefined) && delete updateFields[key]
    );

    await DeliveryMethod.findByIdAndUpdate(id, updateFields);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update DeliveryMethod!");
  }

  revalidatePath("/dashboard/deliverymethods");
  redirect("/dashboard/deliverymethods");
};
export const deleteDeliveryMethod = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await DeliveryMethod.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete DeliveryMethod!");
  }

  revalidatePath("/dashboard/DeliveryMethods");
};
export const getDeliveryMethods = async () =>{
  try {
    connectToDB();
    const deliveryMethods = await DeliveryMethod.find({});
    return deliveryMethods.map(branch => ({
      label: branch.name, // Assuming each product has a 'title' field
      value: branch._id.toString() // Convert ObjectId to string
    }));
  } catch (err) {
    console.error("Failed to fetch products: ", err);
    throw err;
  }
}
export const deleteOrder = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await Order.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete Order!");
  }

  revalidatePath("/dashboard/orders");
};
export const authenticate = async (prevState, formData) => {
  const { username, password } = Object.fromEntries(formData);

  try {
    await signIn("credentials", { username, password, redirect: false });  // add redirect false
  } catch (err) {
    return 'Wrong Credentials!';
  }
  redirect('/dashboard'); //manually redirect
};
async function uploadImageDirectly(file) {
  const cloudName = process.env.CLOUD_NAME;
  const uploadPreset = process.env.CLOUD_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      console.error('Error uploading image. Response status:', response.status);
      const errorResponse = await response.json();
      console.error('Error response from Cloudinary:', errorResponse);
      throw new Error('Network response was not ok.');
    }

    const data = await response.json();
    return data.secure_url; // URL of the uploaded image
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
function extractPublicId(url) {
  // const baseUrl = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/`;
  // let publicId = url.replace(baseUrl, '');
  // publicId = publicId.substring(0, publicId.lastIndexOf('.')); // Remove file extension
  //
  // // Remove version number if present
  // const versionIndex = publicId.indexOf('/v');
  // if (versionIndex !== -1) {
  //   publicId = publicId.substring(versionIndex + 1);
  // }
  //
  // return publicId;
  let publicId = url.substring(url.lastIndexOf('/') + 1);
  publicId = publicId.substring(0, publicId.lastIndexOf('.')); // Remove file extension
  return publicId;
}
async function deleteImageDirectly(publicId) {
  const cloudName = process.env.CLOUD_NAME; // Replace with your Cloudinary cloud name
  const apiKey = process.env.CLOUD_API_KEY; // Replace with your Cloudinary API key
  const apiSecret = process.env.CLOUD_API_SECRET; // Replace with your Cloudinary API secret
  const timestamp = Math.round((new Date()).getTime() / 1000);
  const signature = sha1(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);
  const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp);
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to delete the image');
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
// Helper function to extract measurements from formData
function extractMeasurements(formData) {
  const measurements = [];
  for (const [key, value] of formData.entries()) {
    const regex = /measurements\[(\d+)]\[(type|quantity)]/;
    const match = key.match(regex);
    if (match) {
      const index = parseInt(match[1], 10);
      const property = match[2];
      measurements[index] = measurements[index] || {};
      measurements[index][property] = property === 'quantity' ? Number(value) : value;
    }
  }
  return measurements.filter(Boolean); // Remove any undefined entries

}

// Use this function to get the measurements
