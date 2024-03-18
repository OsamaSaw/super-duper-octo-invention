"use client";
import {addOrder, fetchProductsList, getDeliveryMethods, getProductMeasures} from "@/app/lib/actions";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import {useEffect, useState} from "react";
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

const destinationList = [
  { label: "Select a Destination", value: "" },
  { label: "Branch 1 ", value: "b1" },
  { label: "Branch 2 ", value: "b2" },
  { label: "Kitchen", value: "k1" },
  { label: "Trash", value: "trash" },
];


const AddOrderPage = () => {
  const [measurements, setMeasurements] = useState(
    { type: null, quantity: "" },
  );
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [productsListNew, setProductsListNew] = useState([]);
  const [measurementOptions , setMeasurementOptions] = useState([])
  const [deliveryMethods, setDeliveryMethods] = useState([])

  useEffect(() => {
    // Fetch products when the component mounts
    const getProducts = async () => {
      const products = await fetchProductsList();
      setProductsListNew(products);

      const deliveries = await getDeliveryMethods()
      setDeliveryMethods(deliveries)
    };
    getProducts()
  }, []);


  const DestinationOptions = destinationList
      .filter((option) => option.value !== "")
      .map((place) => ({
        label: place.label,
        value: place.value,
      }));


  const handleProductChange = async (selectedOptions) => {
    setSelectedProduct(selectedOptions || []);
    const productMeasurements = await getProductMeasures(selectedOptions.value)
    const measurements = productMeasurements
        .map((volume) => ({
          label: volume.type,
          value: volume._id,
        }));
    setMeasurementOptions(measurements)

  };
  const handleDestinationChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedDestination(selectedOptions || "");
  };

  const inputTheme = "h-10 bg-[#2E374A] rounded-md placeholder:text-white";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
// Convert the entire measurements object into a JSON string
//     const measurementsJson = JSON.stringify({
//       type: measurements.type.label ? measurements.type.label : '',
//       quantity: measurements.quantity,
//     });
    formData.append('measurementType', measurements.type.label ? measurements.type.label : '');
    formData.append('quantity', measurements.quantity);

    console.log(formData.get('deliveryMethod'))
  const status = await addOrder(formData)
    console.log({status})
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
                name="deliveryMethod"
                id="deliveryMethod"
                className={`${styles.formElement}`} // Apply your styling
                options={deliveryMethods}
                onChange={handleDestinationChange}
                value={selectedDestination}
                placeholder="Select Destination"
                required
            />

            <div className={styles.measurementField}>

              <Select
                  theme={selectTheme}
                  styles={selectStyle}
                  className="w-1/2 mr-5"
                  value={measurements.type}
                  options={measurementOptions}
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
