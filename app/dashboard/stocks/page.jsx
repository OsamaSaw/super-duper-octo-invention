import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/dashboard/products/products.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import {fetchProducts, fetchStocks} from "@/app/lib/data";
import {deleteProduct, deleteStock} from "@/app/lib/actions";
import Modal from './deleteConfirm'; // Adjust the import path as needed

const StocksPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const { count, stocks } = await fetchStocks(q, page);
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a stock..." />
        <div className={'space-x-3'}>
        <Link href="/dashboard/stocks/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
        <Link href="/dashboard/stocks/bulk">
          <button className={styles.addButton}>Add Bulk</button>
        </Link>
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Title</td>
            <td>Supplier</td>
            <td>Price / Piece</td>
            <td>Quantity</td>
            <td>Up coming expiry</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock._id}>
              <td>
                <div className={styles.product}>
                  <Image
                    src={stock.productDetails.img || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                  {stock.productDetails.title}
                </div>
              </td>
              <td>{stock.supplierDetails[0].name ?? "Unknown Supplier"}</td>
              <td>${stock.totalPrice} ({(stock.totalPrice / stock.stockMeasure.quantity).toFixed(2)})</td>
              <td>{stock.stockMeasure.quantity} {stock.stockMeasure.type}</td>
              <td>{stock.createdAt?.toString().slice(4, 16)}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/stocks/${stock.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form action={deleteStock}>
                    <input type="hidden" name="id" value={stock.id} />
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

export default StocksPage;
