import {updateCategory, updateProduct} from "@/app/lib/actions";
import {fetchCategory, fetchProduct} from "@/app/lib/data";
import styles from "@/app/ui/dashboard/products/singleProduct/singleProduct.module.css";
import Image from "next/image";

const SingleCategoryPage = async ({ params }) => {
  const { id } = params;
  const category = await fetchCategory(id);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
          <label>Category:</label>
          <label> {category.name}</label>
      </div>
      <div className={styles.formContainer}>
        <form action={updateCategory} className={styles.form}>
          <input type="hidden" name="id" value={category.id} />
          <label>Category</label>
          <input type="text" name="name" placeholder={category.name} />
          <label>Description</label>
          <textarea
            name="desc"
            id="desc"
            rows="4"
            placeholder={category.desc}
          ></textarea>
          <button>Update</button>
        </form>
      </div>
    </div>
  );
};

export default SingleCategoryPage;
