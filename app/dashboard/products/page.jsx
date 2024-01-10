import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/dashboard/products/products.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import {fetchProducts, fetchProductsWithStocks} from "@/app/lib/data";
import { deleteProduct } from "@/app/lib/actions";
import Modal from './deleteConfirm'; // Adjust the import path as needed

const ProductsPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const { count, products } = await fetchProductsWithStocks(q, page);
  // console.log(products)
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a product..." />
        <Link href="/dashboard/products/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Title</td>
            <td>Supplier</td>
            <td>Price</td>
            <td>Up coming expiry</td>
            <td>Stock</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className={styles.product}>
                  <Image
                    src={product.img || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                  {product.title}
                </div>
              </td>
              <td>
                {product.suppliers && product.suppliers.length > 0
                    ? product.suppliers.map(supplier => supplier.name).join(', ')
                    : 'No supplier available'
                }
              </td>
              <td>${product.totalPrice}</td>
              <td>
                {product.nextExpiryDate
                    ? new Date(product.nextExpiryDate).toLocaleDateString('en-GB') // 'en-GB' uses the day-month-year format
                    : 'No expiry date'
                }
              </td>
              <td>{product.totalStock}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/products/${product.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="img" value={product.img} />
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

export default ProductsPage;
// 6251919000788
// input tile , volume,
// input barcode, input qu, input price +
// input barcode, input qu, input price +