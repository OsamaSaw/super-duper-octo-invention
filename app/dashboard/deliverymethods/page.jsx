import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/dashboard/products/products.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import {fetchCategories, fetchDeliveryMethods, fetchProducts} from "@/app/lib/data";
import {deleteCategory, deleteDeliveryMethod, deleteProduct} from "@/app/lib/actions";
import Modal from './deleteConfirm'; // Adjust the import path as needed

const DeliveryMethodsPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const { count, places } = await fetchDeliveryMethods(q, page);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a product..." />
        <Link href="/dashboard/deliverymethods/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>name</td>
            <td>Description</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {places.map((place) => (
            <tr key={place.id}>
              <td>
                <div className={styles.product}>
                  <Image
                    src={place.img || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                  {place.name}
                </div>
              </td>
              <td>{place.desc}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/deliverymethods/${place.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>

                  <form action={deleteDeliveryMethod}>
                    <input type="hidden" name="id" value={place.id} />
                    <button className={`${styles.button} ${styles.delete}`}>
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination count={count} />
    </div>
  );
};

export default DeliveryMethodsPage;
