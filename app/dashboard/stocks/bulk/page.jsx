"use client"
import React, {useEffect, useRef, useState} from 'react';
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import {getProductByBarcode} from "@/app/lib/actions";
import Select from "react-select";
import {selectStyle, selectTheme} from "@/utils/selectStyles";
import DatePicker from "react-datepicker";
// ... other necessary imports

const AddMultipleItemsPage = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliersListNew, setSuppliersListNew] = useState([]);

  const [items, setItems] = useState([
    { productName: '', measurement: '', quantity: '', price: '', expiryDate: '', barcode: '' }
  ]);
  const lastBarcodeRef = useRef(null);

  useEffect(() => {
    lastBarcodeRef.current?.focus();
  }, [items.length]);

  const handleBarcodeKeyPress = async (event, index) => {
    if (event.key === 'Enter') {
      console.log("Enter is pressed")
      event.preventDefault();
      await handleBarcodeScanned(index); // Ensure this is awaited
      if (index === items.length - 1) {
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
    newItems[index][event.target.name] = event.target.value;
    setItems(newItems);
  };

  const addNewItem = () => {
    setItems([...items, { productId:'', productName: '', measurement: '', quantity: '', price: '', expiryDate: '', barcode: '' }]);
  };

  const handleBarcodeScanned = async (index) => {
    const barcode = items[index].barcode;
    // Check if barcode already exists in the list
    if (items.some((item, i) => i !== index && item.barcode === barcode)) {
      alert("This product is already added.");
      return;
    }
    // Fetch product details by barcode
    try {
      const productDetails = await getProductByBarcode(barcode);
      console.log(productDetails)
      const matchingMeasurement = productDetails.measurements.find(measurement => measurement.barCode === barcode);
      const productDetailsParsed = {
        productId: productDetails._id,
        productName: productDetails.title,
        measurement: matchingMeasurement ? matchingMeasurement.type : '',
        quantity: '',
        price: '', // Assuming this needs to be filled in separately
        expiryDate: '', // Assuming this needs to be filled in separately
      };
      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...productDetailsParsed };
      setItems(newItems);
    }catch (err){
      console.error("cant fetch: ", err)
    }
  };

  const handleSubmit = async (event) => {
    console.log("Submit was clicked")
  }
  const deleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  const inputTheme = "h-10 bg-[#2E374A] rounded-md placeholder:text-white";

  return (
      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          {items.map((item, index) => (
              <div key={index}>
                {/* First line with barcode and product name */}
                <div className="flex space-x-2 mt-5">
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
                <div className="flex space-x-2 mt-5 mb-10">
                  <input
                      name="measurement"
                      className={`w-1/3 ${inputTheme}`}
                      value={item.measurement}
                      onChange={(e) => handleInputChange(index, e)}
                      placeholder="Measurement Type"
                      readOnly
                  />
                  <input
                      className={`w-1/3 ${inputTheme}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(index, e)}
                      placeholder="Quantity"
                      name="quantity"
                  />
                  <input
                      className={`w-1/3 ${inputTheme}`}
                      type="number"
                      placeholder="Price"
                      name="price"
                      value={item.price}
                      onChange={(e) => handleInputChange(index, e)}
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
                        </svg>                        {/* ... */}
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
            Add New Item</button>

          <Select
              theme={selectTheme}
              styles={selectStyle}
              name="supplier"
              id="supplier"
              className={`${styles.formElement}`} // Apply your styling
              options={suppliersListNew}
              onChange={handleSupplierChange}
              value={selectedSupplier}
              placeholder="Select Supplier"
              required
          />

          <textarea
              className={`w-full rounded-md h-24 ${inputTheme}`}
              name="desc"
              id="desc"
              rows="4"
              placeholder=" Description"
          ></textarea>

          {/* Submit button */}
          <button className={`${styles.formButton} w-full`} type="submit">
            Submit
          </button>
        </form>
      </div>
  );
};

export default AddMultipleItemsPage;
