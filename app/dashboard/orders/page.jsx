import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/dashboard/products/products.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import {fetchOrders} from "@/app/lib/data";
import {deleteOrder} from "@/app/lib/actions";
import Modal from './deleteConfirm'; // Adjust the import path as needed

const ProductsPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const { count, orders } = await fetchOrders(q, page);
    console.log("Testing")
    console.log(orders)
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for an order..." />
          <div className={'space-x-3'}>
              <Link href="/dashboard/orders/add">
                  <button className={styles.addButton}>Add New</button>
              </Link>
              <Link href="/dashboard/orders/bulk">
                  <button className={styles.addButton}>Add Bulk</button>
              </Link>
          </div>

      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Product</td>
            <td>Quantity</td>
             <td>Cost</td>
            <td>Sent To</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>
                <div className={styles.product}>
                  <Image
                    src={order.productDetails.img || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                    {order.productDetails.title}
                </div>
              </td>
              <td>{order.totalQuantity} / {order.productDetails.measurements[0].type}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
              <td>{order.deliveryMethodDetails.name}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form action={deleteOrder}>
                    <input type="hidden" name="id" value={order.id} />
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
