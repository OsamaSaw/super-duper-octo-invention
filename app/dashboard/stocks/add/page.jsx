"use client";
import {
  addProduct,
  addStock,
  fetchProductsList,
  fetchSuppliersList,
  getProduct,
  getProductMeasures
} from "@/app/lib/actions";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import {useEffect, useState} from "react";
import Select from "react-select";
import { revalidatePath } from "next/cache";
import {redirect, useRouter} from "next/navigation";
import { selectTheme, selectStyle } from "./../../../../utils/selectStyles";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";



const AddOrderPage = () => {
  const [measurements, setMeasurements] = useState(
    { type: null, quantity: "" },
  );
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [productsListNew, setProductsListNew] = useState([]);
  const [productMeasuresList, setProductMeasuresList] = useState([]);
  const [suppliersListNew, setSuppliersListNew] = useState([]);
  const [expiryDate, setExpiryDate] = useState(new Date().setFullYear(new Date().getFullYear() + 1));


  useEffect(() => {
    // Fetch products when the component mounts
    const getProducts = async () => {
      const products = await fetchProductsList();
      const suppliers = await fetchSuppliersList();

      setProductsListNew(products);
      setSuppliersListNew(suppliers)
    };
    // fetchSuppliersList
    getProducts()
  }, []);

  useEffect(()=>{
    const getProductMeasus = async ()=> {
      if(selectedProduct && selectedProduct.value){
      console.log(selectedProduct.value)
      const measurements = await getProductMeasures(selectedProduct.value)
      const measurementsList = measurements.map(measurement=>({
        label:measurement.type,
        value:measurement.type
      }))
        setProductMeasuresList(measurementsList)
      }
    }
    getProductMeasus()
  },[selectedProduct])

  const handleProductChange = async (selectedOptions) => {
    setSelectedProduct(selectedOptions);
  };

  const handleSupplierChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedSupplier(selectedOptions || []);
  };
  const inputTheme = "h-10 bg-[#2E374A] rounded-md placeholder:text-white";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    formData.append('stockMeasure', JSON.stringify({ 'type': measurements.type.value, 'quantity': measurements.quantity }));
    formData.append('expiryDate', expiryDate)
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }
    const status = await addStock(formData);
    if (status.status) {
      router.push('/dashboard/stocks');
    } else {
      console.log("Something went wrong try again later");
    }
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
              options={productsListNew}
              onChange={handleProductChange}
              value={selectedProduct}
              placeholder="Select Product"
              required
            />

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

            <div className={styles.measurementField}>

              <Select
                  theme={selectTheme}
                  styles={selectStyle}
                  className="w-1/2 mr-5"
                  value={measurements.type}
                  options={productMeasuresList}
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
            <div>
              <label htmlFor="expiry-date-picker">Expiry Date:</label> {/* Label for the date picker */}
              <DatePicker
                  id="expiry-date-picker" // Adding an id for accessibility
                  selected={expiryDate}
                  onChange={(date) => setExpiryDate(date)}
                  dateFormat="dd/MM/yyyy"
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
