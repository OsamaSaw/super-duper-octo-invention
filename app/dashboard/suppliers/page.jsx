import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/dashboard/products/products.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import {fetchCategories, fetchDeliveryMethods, fetchProducts, fetchSuppliers} from "@/app/lib/data";
import {deleteCategory, deleteDeliveryMethod, deleteProduct, deleteSupplier} from "@/app/lib/actions";
import Modal from './deleteConfirm'; // Adjust the import path as needed

const SuppliersPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const { count, suppliers } = await fetchSuppliers(q, page);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a supplier..." />
        <Link href="/dashboard/suppliers/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>name</td>
              <td>Phone Number</td>
              <td>Description</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>
                <div className={styles.product}>
                  <Image
                    src={supplier.img || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                  {supplier.name}
                </div>
              </td>
                <td>{supplier.phoneNumber}</td>
                <td>{supplier.desc}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/suppliers/${supplier.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>

                  <form action={deleteSupplier}>
                    <input type="hidden" name="id" value={supplier.id} />
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

export default SuppliersPage;
