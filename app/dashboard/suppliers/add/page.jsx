"use client";
import {addDeliveryMethod, addSupplier} from "@/app/lib/actions";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import {useRouter} from "next/navigation";
import Select from "react-select";
import {selectStyle, selectTheme} from "@/utils/selectStyles";
import {useState} from "react";


const productsList = [
  { label: "Select Products", value: "" },
  { label: "item 1", value: "itemId1" },
  { label: "item 2", value: "itemId2" },
  { label: "item 3", value: "itemId3" },
  { label: "item 4", value: "itemId4" },
];
const AddDeliveryMethodPage = () => {
  const router = useRouter();
  const inputTheme = "h-10 bg-[#2E374A] rounded-md placeholder:text-white";
  const [selectedProducts, setSelectedProducts] = useState([]);
  const productsOptions = productsList
      .filter((option) => option.value !== "")
      .map((supplier) => ({
        label: supplier.label,
        value: supplier.value,
      }));

  const handleProcutsChange = (selectedOptions) => {
    // selectedOptions will be an array of { label, value } objects
    setSelectedProducts(selectedOptions || []);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    const status = await addSupplier(formData);
    console.log(status)
    if (status.status) {
      // router.push('/dashboard/suppliers');
      console.log("success")
    } else {
      console.log("Something went wrong try again later");
    }
  };
  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-row w-full justify-center">
          <div className="w-[50%] flex flex-col items-center">
            <input
                className={`w-[100%] ${inputTheme}`}
                type="text"
                placeholder="supplier name"
                name="name"
                required
            />
            <input
                className={`w-[100%] ${inputTheme} m-5`}
                type="number"
                placeholder="Phone Number"
                name="phoneNumber"
                required
            />
            <Select
                name="productsDelivered"
                theme={selectTheme}
                styles={selectStyle}
                className={`w-[100%] ${styles.formElement}`}
                options={productsOptions}
                isMulti
                onChange={handleProcutsChange}
                value={selectedProducts}
                placeholder="Select Products"
                required
            />
            <textarea
              className={`w-full rounded-md h-24 ${inputTheme} mt-4`}
              name="desc"
              id="desc"
              rows="4"
              placeholder=" Description"
            ></textarea>
            <button className={`${styles.formButton} w-[100%]`} type="submit">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddDeliveryMethodPage;
