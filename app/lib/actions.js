"use server";

import { revalidatePath } from "next/cache";
import { Product, User } from "./models";
import {connectToDB, logError} from "./utils";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { signIn } from "../auth";
import sha1 from 'crypto-js/sha1';


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

export const addProduct = async (formData) => {
  try {
    connectToDB();

    // Handle the image upload first and get the URL/path
    // The logic here depends on how you implement image storage
    let imgPath = ''

    if (formData.get('productImage')) {
      try {
        const imageUrl = await uploadImageDirectly(formData.get('productImage'));
        // Now you have the image URL, proceed with the rest of your form processing
        console.log('Uploaded image URL:', imageUrl);
        imgPath = imageUrl
        // console.log("deleting the image...")
        // let idTodelete = extractPublicId(imageUrl)
        // console.log(idTodelete)
        // console.log("sleep for 5 sec")
        // await sleep(5000)
        // console.log(await deleteImageDirectly(idTodelete))
        // Additional logic to handle the product creation with imageUrl
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    // Parse measurements and suppliers
    const measurements = extractMeasurements(formData);
    const suppliers = formData.getAll('suppliers');

    const newProduct = new Product({
      title: formData.get('title'),
      category: formData.get('cat'),
      img: imgPath,
      desc: formData.get('desc'),
      measurements,
      suppliers
    });

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
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await Product.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete product!");
  }

  revalidatePath("/dashboard/products");
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
  const cloudName = process.env.CLOUD_NAME; // Replace with your Cloudinary cloud name
  const uploadPreset = process.env.CLOUD_UPLOAD_PRESET; // Your unsigned upload preset

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
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
