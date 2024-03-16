"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import {getDeliveryMethods, getProductByBarcode} from "@/app/lib/actions";
import Select from "react-select";
import { selectStyle, selectTheme } from "@/utils/selectStyles";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DatePicker from "react-datepicker";

const AddMultipleItemsPage = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliersListNew, setSuppliersListNew] = useState([]);

  const [items, setItems] = useState([
    {
      productName: "",
      measurement: "",
      quantity: "",
      // price: "",
      // expiryDate: "",
      barcode: "",
    },
  ]);
  const lastBarcodeRef = useRef(null);

  useEffect(() => {
    const fetchAndSetSuppliers = async () => {
      const DeliveryMethodsFetchList = await getDeliveryMethods();
      setSuppliersListNew(DeliveryMethodsFetchList);
    };

    fetchAndSetSuppliers();
  }, []);

  useEffect(() => {
    lastBarcodeRef.current?.focus();
  }, [items.length]);

  const handleBarcodeKeyPress = async (event, index) => {
    if (event.key === "Enter") {
      console.log("Enter is pressed");
      event.preventDefault();
      const checkBarcode = await handleBarcodeScanned(index); // Ensure this is awaited
      if (index === items.length - 1 && checkBarcode) {
        addNewItem();
      }
    }
  };
  const handleSupplierChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedSupplier(selectedOptions || []);
  };
  const handleInputChange = (index, event) => {
    const newItems = [...items];
    console.log(newItems[index][event.target.name]);
    newItems[index][event.target.name] = event.target.value;
    setItems(newItems);
  };

  const addNewItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        productName: "",
        measurement: "",
        quantity: "",
        // price: "",
        // expiryDate: "",
        barcode: "",
      },
    ]);
  };

  const handleBarcodeScanned = async (index) => {
    const barcode = items[index].barcode;
    // Check if barcode already exists in the list
    let duplicateIndex = -1;

    items.forEach((item, i) => {
      if (i !== index && item.barcode === barcode) {
        duplicateIndex = i;
      }
    });

    if (duplicateIndex !== -1) {
      // Found a duplicate item, update its quantity
      items[index].barcode = ''
      const newItems = [...items];
      let unitPrice = (Number(newItems[duplicateIndex].price) !== 0 && newItems[duplicateIndex].price !== "")
          ? newItems[duplicateIndex].price / newItems[duplicateIndex].quantity
          : 0;
      newItems[duplicateIndex] = {
        ...newItems[duplicateIndex],
        price: unitPrice * (newItems[duplicateIndex].quantity + 1),
        quantity: Number(newItems[duplicateIndex].quantity) + 1,

      };
      setItems(newItems);
      toast("This product is already added, quantity increased.");
      return false;
    }
    // Fetch product details by barcode
    try {
      const productDetails = await getProductByBarcode(barcode);
      console.log(productDetails);
      const matchingMeasurement = productDetails.measurements.find(
        (measurement) => measurement.barCode === barcode
      );
      const productDetailsParsed = {
        productId: productDetails._id,
        productName: productDetails.title,
        measurement: matchingMeasurement ? matchingMeasurement.type : "",
        quantity: 1,
        // price: productDetails.price ?? 0, // Assuming this needs to be filled in separately
        // expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]

      };
      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...productDetailsParsed };
      setItems(newItems);
      return true;
    } catch (err) {
      console.error("cant fetch: ", err);
    }
  };

  const handleSubmit = async (event) => {
    console.log("Submit was clicked");
  };
  const deleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  const inputTheme = "h-10 bg-[#2E374A] rounded-md placeholder:text-white px-4";

  return (
    <div className={`${styles.container} flex justify-center`}>
      <form className="w-1/2" onSubmit={handleSubmit}>
        {items.map((item, index) => (
          <div
            className="border-solid border-[2px] border-gray-500 rounded-lg space-y-5 p-2 my-3"
            key={index}
          >
            {/* First line with barcode and product name */}
            <div className="flex space-x-2">
              <input
                className={`w-1/2  ${inputTheme}`}
                type="text"
                placeholder="Barcode"
                name="barcode"
                value={item.barcode}
                onChange={(e) => handleInputChange(index, e)}
                onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
                ref={index === items.length - 1 ? lastBarcodeRef : null}
              />
              <input
                className={`w-1/2 ${inputTheme}`}
                type="text"
                placeholder="Product Name"
                name="productName"
                value={item.productName}
                onChange={(e) => handleInputChange(index, e)}
                readOnly
                // ... other necessary attributes
              />

            </div>

            {/* Second line with measurement, quantity, and price */}
            <div className="flex space-x-2 flex-row items-center">
              <input
                name="measurement"
                className={`w-1/2 ${inputTheme}`}
                value={item.measurement}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="Measurement Type"
                readOnly
              />
              <input
                className={`w-1/2 ${inputTheme}`}
                type="number"
                value={item.quantity}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="Quantity"
                name="quantity"
              />

              {/* Delete Button (not for the first item) */}
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => deleteItem(index)}
                  className={`${styles.deleteButton} ml-5 `}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    {/* SVG path for an X icon */}
                    <path d="M18.3,5.71,12,12l6.3,6.29a1,1,0,0,1,0,1.41,1,1,0,0,1-1.41,0L12,14.41l-6.29,6.3a1,1,0,0,1-1.41-1.41L10.59,12,4.3,5.71A1,1,0,0,1,5.71,4.3L12,10.59l6.29-6.3a1,1,0,0,1,1.41,1.41Z" />
                  </svg>{" "}
                  {/* ... */}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Button to add new item */}
        <button
          type="button"
          onClick={addNewItem}
          className={`${styles.formButton}`}
        >
          Add New Item
        </button>

        <Select
          theme={selectTheme}
          styles={selectStyle}
          name="supplier"
          id="supplier"
          className={`${styles.formElement}`} // Apply your styling
          options={suppliersListNew}
          onChange={handleSupplierChange}
          value={selectedSupplier}
          placeholder="Select Destination"
          required
        />

        <textarea
          className={`w-full rounded-md h-24 ${inputTheme}`}
          name="desc"
          id="desc"
          rows="4"
          placeholder="Notes"
        ></textarea>

        <button className={`${styles.formButton} w-full`} type="submit">
          Submit
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddMultipleItemsPage;
