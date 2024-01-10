"use client";
import { addProduct } from "@/app/lib/actions";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import { useState } from "react";
import Select from "react-select";
import { revalidatePath } from "next/cache";
import { selectTheme, selectStyle } from "./../../../../utils/selectStyles";
import { useRouter } from "next/navigation";

// This could also be fetched from a database and set in state
const measurementTypes = [
  { label: "Pieces", value: "pieces" },
  { label: "Kilos", value: "kilos" },
  { label: "Boxes", value: "boxes" },
];

const categoryOptions = [
  { label: "Choose a Category", value: "" },
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
  const [measurements, setMeasurements] = useState([
    { type: "Select Measurement Type", quantity: "", barCode:"" },
  ]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const supplierOptions = supplierList
    .filter((option) => option.value !== "")
    .map((supplier) => ({
      label: supplier.label,
      value: supplier.value,
    }));

  const router = useRouter();
  const handleSupplierChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedSuppliers(selectedOptions || []);
  };
  const handleCategoryChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedCategory(selectedOptions || "");
  };
  const getAvailableMeasurementTypes = (currentIndex) => {
    const selectedTypes = measurements
      .map((m, index) => (index === currentIndex ? null : m.type))
      .filter((t) => t);
    return measurementTypes.filter(
      (type) => type.value === "" || !selectedTypes.includes(type.value)
    );
  };
  const handleMeasurementChange = (index, field, value) => {
    const newMeasurements = [...measurements];
    newMeasurements[index][field] = value;
    setMeasurements(newMeasurements);
  };
  const isAddMoreButtonVisible = () => {
    return measurements.length < measurementTypes.length;
  };
  const deleteMeasurement = (index) => {
    const newMeasurements = measurements.filter((_, i) => i !== index);
    setMeasurements(newMeasurements);
  };
  const addMeasurement = () => {
    if (measurements.length < measurementTypes.length) {
      setMeasurements([...measurements, { type: "", quantity: "" }]);
    }
  };
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]); // Store the file object
      setImage(URL.createObjectURL(event.target.files[0])); // For preview purposes
    }
  };
  const inputTheme = "h-10 bg-[#2E374A] rounded-md placeholder:text-white";

  const handleSubmit = async (event) => {
    event.preventDefault();

    let measures = [];
    let suppliers = []
    measurements.forEach((measurement, index) => {
      measures.push({
        quantity: measurement.quantity,
        type: measurement.type,
        barCode:measurement.barCode
      });
    });
    selectedSuppliers.forEach((supplier, index) => {
      suppliers.push(supplier.value);
      if (Array.isArray(supplier)) {
        suppliers.push(...supplier);
      }
    });
    const formData = new FormData();
    formData.append('title', event.target.title.value);
    formData.append('category', event.target.cat.value);
    formData.append('desc', event.target.desc.value);
    formData.append('image', selectedFile);  // Assuming 'image' is a File object
    formData.append('measurements', JSON.stringify(measures));
    formData.append('suppliers', JSON.stringify(suppliers));
    // console.log(JSON.stringify(measures))
    const status = await addProduct(formData)
    console.log(status)
    router.push("/dashboard/products");
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-row w-full">
          {/* image and des */}
          <div className="w-[50%] flex flex-col items-center">
            <div className="flex flex-col w-[70%] items-center relative mb-5">
              <img
                className="w-full rounded-md"
                alt="preview image"
                src={image || "/imagePlaceholder.jpg"}
              />
              <input
                type="file"
                onChange={onImageChange}
                name="productImage"
                accept="image/*"
                className="absolute -bottom-8 left-0 justify-items-center text-black"
              />
            </div>
            <textarea
              className={`w-full rounded-md mt-5 h-24 ${inputTheme}`}
              name="desc"
              id="desc"
              rows="4"
              placeholder=" Description"
            ></textarea>
          </div>
          {/* the rest */}
          <div className="flex flex-col w-[50%] space-y-5">
            <div className="flex items-center justify-between">
              <input
                className={`w-[46%] ${inputTheme} pl-2`}
                type="text"
                placeholder="Title"
                name="title"
                required
              />
              <Select
                theme={selectTheme}
                styles={selectStyle}
                name="cat"
                id="cat"
                className={`${styles.formElement} w-[46%]`} // Apply your styling
                options={categoryOptions}
                onChange={handleCategoryChange}
                value={selectedCategory}
                placeholder="Select Category"
              />
            </div>

            <Select
              name="suppliers"
              theme={selectTheme}
              styles={selectStyle}
              className={styles.formElement} // Apply your styling
              options={supplierOptions}
              isMulti
              onChange={handleSupplierChange}
              value={selectedSuppliers}
              placeholder="Select suppliers"
            />
            {measurements.map((measurement, index) => (
              <div key={index} className={`${styles.measurementField} space-x-5`}>
                {/* Measurement Type Dropdown */}
                <Select
                  theme={selectTheme}
                  styles={selectStyle}
                  className="w-1/2"
                  value={{ label: measurement.type, value: measurement.type }}
                  options={getAvailableMeasurementTypes(index).map((type) => ({
                    label: type.label,
                    value: type.value,
                  }))}
                  onChange={(selectedOption) =>
                    handleMeasurementChange(index, "type", selectedOption.value)
                  }
                  required
                />

                {/* Quantity Input */}
                <input
                  className={`${styles.formElement} ${inputTheme} pl-2`} // Apply styles to input
                  type="number"
                  value={measurement.quantity}
                  onChange={(e) =>
                    handleMeasurementChange(index, "quantity", e.target.value)
                  }
                  placeholder="Quantity"
                  inputMode="numeric"
                  required
                />
                <input
                    className={`${styles.formElement} ${inputTheme} pl-2`} // Apply styles to input
                    type="text"
                    value={measurement.barCode}
                    onChange={(e) =>
                        handleMeasurementChange(index, "barCode", e.target.value)
                    }
                    placeholder="Barcode"
                    required
                />
                {/* Delete Button (not for the first measurement) */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => deleteMeasurement(index)}
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
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* Add More Measurements Button */}
            <button
              type="button"
              onClick={addMeasurement}
              className={`${styles.formButton} ${
                !isAddMoreButtonVisible() && styles.hidden
              }`} // Apply styles and conditional hiding
            >
              Add More Measurements
            </button>
          </div>
        </div>
        <button className={`${styles.formButton} w-full`} type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
