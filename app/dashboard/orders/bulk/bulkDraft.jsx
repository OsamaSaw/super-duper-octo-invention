"use client"
import React, { useState } from 'react';
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import {getProductByBarcode} from "@/app/lib/actions";
// ... other necessary imports

const AddMultipleItemsPage = () => {
    const [items, setItems] = useState([
        { productName: '', measurement: '', quantity: '', price: '', expiryDate: '', barcode: '' }
    ]);

    const handleInputChange = (index, event) => {
        const newItems = [...items];
        newItems[index][event.target.name] = event.target.value;
        setItems(newItems);
    };

    const addNewItem = () => {
        setItems([...items, { productName: '', measurement: '', quantity: '', price: '', expiryDate: '', barcode: '' }]);
    };

    const handleBarcodeScanned = async (index) => {
        // Assuming you have a function to fetch product details by barcode
        const productDetails = await getProductByBarcode(items[index].barcode);
        // Auto-fill the item details
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...productDetails };
        setItems(newItems);
    };

    // ... any other necessary functions

    return (
        <div className={styles.container}>
            <form>
                {items.map((item, index) => (
                    <div key={index} className={styles.itemForm}>
                        {/* Replicate your single item form structure here */}
                        {/* Example for barcode input */}
                        <input
                            type="text"
                            name="barcode"
                            value={item.barcode}
                            onChange={(e) => handleInputChange(index, e)}
                            onBlur={() => handleBarcodeScanned(index)} // or onKeyDown for "Enter" key
                            className={styles.input}
                        />
                        {/* Inputs for productName, measurement, quantity, price, expiryDate */}
                        {/* ... */}
                    </div>
                ))}
                <button type="button" onClick={addNewItem} className={styles.addButton}>Add Another Item</button>
                {/* Submit button and other form elements */}
            </form>
        </div>
    );
};

export default AddMultipleItemsPage;
