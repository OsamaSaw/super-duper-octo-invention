"use client";
import { addProduct } from "@/app/lib/actions";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import { useState } from "react";
import Select from "react-select";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { selectTheme, selectStyle } from "./../../../../utils/selectStyles";

// This could also be fetched from a database and set in state
const measurementTypes = [
  {label: "Select Measurement Type", value: ""},
  { label: "Pieces", value: "pieces" },
  { label: "Kilos", value: "kilos" },
  { label: "Boxes", value: "boxes" },
];

const ProductsTypes = [
  { label: "item1", value: "id1" },
  { label: "item2", value: "id2" },
  { label: "item3", value: "id3" },
];

const suppliersList = [
  { label: "Select a Supplier", value: "" },
  { label: "Supplier 1", value: "s1" },
  { label: "Supplier 2", value: "s2" },
  { label: "Supplier 3", value: "s3" },
  { label: "Supplier 4", value: "s4" },
];


const AddOrderPage = () => {
  const [measurements, setMeasurements] = useState(
    { type: null, quantity: "" },
  );
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const ProductsOptions = ProductsTypes
    .filter((option) => option.value !== "")
    .map((product) => ({
      label: product.label,
      value: product.value,
    }));

  const SuppliersOptions = suppliersList
      .filter((option) => option.value !== "")
      .map((place) => ({
        label: place.label,
        value: place.value,
      }));

  const measurmentsOptions = measurementTypes
      .filter((option) => option.value !== "")
      .map((volume) => ({
        label: volume.label,
        value: volume.value,
      }));
  const handleProductChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedProduct(selectedOptions || []);
  };
  const handleDestinationChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedSupplier(selectedOptions || "");
  };

  const inputTheme = "h-10 bg-[#2E374A] rounded-md placeholder:text-white";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    // Manually append each measurement to the FormData
    formData.append('measurement[type]', measurements.type ? measurements.type.value : '');
    formData.append('measurement[quantity]', measurements.quantity);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // const status = await addProduct(formData);
    // if (status.status) {
    //   // revalidatePath("/dashboard/products");
    //   redirect("/dashboard/products");
    // } else {
    //   console.log("Something went wrong try again later");
    // }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center">
          <div className="flex flex-col w-[50%]">
            <Select
              name="product"
              theme={selectTheme}
              styles={selectStyle}
              className={styles.formElement} // Apply your styling
              options={ProductsOptions}
              onChange={handleProductChange}
              value={selectedProduct}
              placeholder="Select Product"
              required
            />

            <Select
                theme={selectTheme}
                styles={selectStyle}
                name="deliveryMethod"
                id="deliveryMethod"
                className={`${styles.formElement}`} // Apply your styling
                options={SuppliersOptions}
                onChange={handleDestinationChange}
                value={selectedSupplier}
                placeholder="Select Supplier"
                required
            />

            <div className={styles.measurementField}>

              <Select
                  theme={selectTheme}
                  styles={selectStyle}
                  className="w-1/2 mr-5"
                  value={measurements.type}
                  options={measurmentsOptions}
                  onChange={(selectedOption) =>
                      setMeasurements({ ...measurements, type: selectedOption })
                  }
                  placeholder="Select Measurement Type" // This is the key
                  required
              />


              {/* Quantity Input */}
              <input
                  className={styles.formElement}
                  type="number"
                  value={measurements.quantity}
                  onChange={(e) =>
                      setMeasurements({ ...measurements, quantity: e.target.value })
                  }
                  placeholder="Quantity"
                  inputMode="numeric"
                  required
              />
            </div>
            <input
                className={`w-[100%] ${inputTheme} mt-1 mb-3`}
                type="number"
                placeholder="Total Cost"
                name="totalPrice"
                required
            />
            <textarea
                className={`w-full rounded-md h-24 ${inputTheme}`}
                name="desc"
                id="desc"
                rows="4"
                placeholder=" Description"
            ></textarea>
            <button className={`${styles.formButton} w-full`} type="submit">
              Submit
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};

export default AddOrderPage;
