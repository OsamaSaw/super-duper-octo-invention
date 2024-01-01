"use client"
import { addProduct } from "@/app/lib/actions";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import {useState} from "react";
import Select from 'react-select';
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

// This could also be fetched from a database and set in state
const measurementTypes = [
  { label: "Select Measurement Type", value: "" },
  { label: "Pieces", value: "pieces" },
  { label: "Kilos", value: "kilos" },
  { label: "Boxes", value: "boxes" },
];

const categoryOptions = [
  { label: "Choose a Category", value: "general" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Phone", value: "phone" },
  { label: "Computer", value: "computer" },
];

const supplierList = [
  { label: "Select a supplier", value: "" },
  { label: "supplier 1", value: "suppId1" },
  { label: "supplier 2", value: "suppId2" },
  { label: "supplier 3", value: "suppId3" },
  { label: "supplier 4", value: "suppId4" },
];

const AddProductPage = () => {

  const [measurements, setMeasurements] = useState([{ type: '', quantity: '' }]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const supplierOptions = supplierList.filter(option => option.value !== "").map(supplier => ({
    label: supplier.label,
    value: supplier.value,
  }));
  const handleSupplierChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedSuppliers(selectedOptions || []);
  };
  const getAvailableMeasurementTypes = (currentIndex) => {
    const selectedTypes = measurements.map((m, index) => index === currentIndex ? null : m.type).filter(t => t);
    return measurementTypes.filter(type => type.value === "" || !selectedTypes.includes(type.value));
  };
  const handleMeasurementChange = (index, field, value) => {
    const newMeasurements = [...measurements];
    newMeasurements[index][field] = value;
    setMeasurements(newMeasurements);
  };
  const isAddMoreButtonVisible = () => {
    return measurements.length < measurementTypes.length - 1;
  };
  const deleteMeasurement = (index) => {
    const newMeasurements = measurements.filter((_, i) => i !== index);
    setMeasurements(newMeasurements);
  };
  const addMeasurement = () => {
    if (measurements.length < measurementTypes.length - 1) {
      setMeasurements([...measurements, { type: '', quantity: '' }]);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    // Manually append each measurement to the FormData
    measurements.forEach((measurement, index) => {
      formData.append(`measurements[${index}][type]`, measurement.type);
      formData.append(`measurements[${index}][quantity]`, measurement.quantity);
    });

    const status = await addProduct(formData)
    if (status.status){
      // revalidatePath("/dashboard/products");
      redirect("/dashboard/products");
    }
    else {
      console.log("Something went wrong try again later")
    }
  };
  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="text" placeholder="title" name="title" required />
        <input type="file" name="productImage" accept="image/*" />

        <select name="cat" id="cat" className={styles.formElement}>
          {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
          ))}
        </select>

        <Select
            name="suppliers"
            className={styles.formElement} // Apply your styling
            options={supplierOptions}
            isMulti
            onChange={handleSupplierChange}
            value={selectedSuppliers}
            placeholder="Select suppliers"
        />

        {measurements.map((measurement, index) => (
            <div key={index} className={styles.measurementField}>
              {/* Measurement Type Dropdown */}
              <select
                  className={styles.formElement} // Apply styles to select
                  value={measurement.type}
                  onChange={(e) => handleMeasurementChange(index, 'type', e.target.value)}
                  required
              >
                {getAvailableMeasurementTypes(index).map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* Quantity Input */}
              <input
                  className={styles.formElement} // Apply styles to input
                  type="number"
                  value={measurement.quantity}
                  onChange={(e) => handleMeasurementChange(index, 'quantity', e.target.value)}
                  placeholder="Quantity"
                  required
              />

              {/* Delete Button (not for the first measurement) */}
              {index > 0 && (
                  <button type="button" onClick={() => deleteMeasurement(index)} className={styles.deleteButton}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      {/* SVG path for an X icon */}
                      <path d="M18.3,5.71,12,12l6.3,6.29a1,1,0,0,1,0,1.41,1,1,0,0,1-1.41,0L12,14.41l-6.29,6.3a1,1,0,0,1-1.41-1.41L10.59,12,4.3,5.71A1,1,0,0,1,5.71,4.3L12,10.59l6.29-6.3a1,1,0,0,1,1.41,1.41Z"/>
                    </svg>
                  </button>
              )}
            </div>
        ))}

        {/* Add More Measurements Button */}
        <button
            type="button"
            onClick={addMeasurement}
            className={`${styles.formButton} ${!isAddMoreButtonVisible() && styles.hidden}`} // Apply styles and conditional hiding
        >
          Add More Measurements
        </button>


        <textarea
          required
          name="desc"
          id="desc"
          rows="4"
          placeholder="Description"
        ></textarea>
        <button className={styles.submit} type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddProductPage;
