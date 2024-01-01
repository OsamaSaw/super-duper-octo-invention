import {updateDeliveryMethod} from "@/app/lib/actions";
import {fetchDeliveryMethod} from "@/app/lib/data";
import styles from "@/app/ui/dashboard/products/singleProduct/singleProduct.module.css";
import Image from "next/image";

const SingleDeliveryPage = async ({ params }) => {
  const { id } = params;
  const delivery = await fetchDeliveryMethod(id);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
          <label>Delivery:</label>
          <label> {delivery.name}</label>
      </div>
      <div className={styles.formContainer}>
        <form action={updateDeliveryMethod} className={styles.form}>
          <input type="hidden" name="id" value={delivery.id} />
          <label>Delivery Place</label>
          <input type="text" name="name" placeholder={delivery.name} />
          <label>Description</label>
          <textarea
            name="desc"
            id="desc"
            rows="4"
            placeholder={delivery.desc}
          ></textarea>
          <button>Update</button>
        </form>
      </div>
    </div>
  );
};

export default SingleDeliveryPage;
