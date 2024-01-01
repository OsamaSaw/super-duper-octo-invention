"use client";
import {addDeliveryMethod} from "@/app/lib/actions";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import {useRouter} from "next/navigation";

const AddDeliveryMethodPage = () => {
  const router = useRouter();
  const inputTheme = "h-10 bg-[#2E374A] rounded-md placeholder:text-white";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const status = await addDeliveryMethod(formData);
    console.log(status)
    if (status.status) {
      router.push('/dashboard/deliverymethods');
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
                placeholder="DeliveryMethod name"
                name="name"
                required
            />
            <textarea
              className={`w-full rounded-md mt-5 h-24 ${inputTheme}`}
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
