import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
import {
  MdDashboard,
  MdSupervisedUserCircle,
  MdShoppingBag,
  MdAttachMoney,
  MdWork,
  MdAnalytics,
  MdPeople,
  MdOutlineSettings,
  MdHelpCenter,
  MdLogout,
  MdCurrencyExchange,
  MdDashboardCustomize,
  MdEditDocument,
  MdProductionQuantityLimits,
  MdOutlineProductionQuantityLimits,
  MdInventory2,
  MdInventory,
  MdOutlineBroadcastOnPersonal,
  MdLockPerson,
  MdPersonSearch,
  MdBroadcastOnPersonal,
  MdPersonPinCircle,
  MdPersonPin,
  MdPersonalVideo,
  MdPerson2,
  MdPerson3,
  MdPersonAddAlt1,
  MdPersonOutline,
  MdOutlinePerson2,
  MdOutlineWorkspacePremium,
  MdDeliveryDining,
  MdOutlineDeliveryDining,
  MdOutlineAddHomeWork,
  MdFactory,
  MdCarRepair,
  MdDriveEta,
  MdMultipleStop,
  MdOutlineMultipleStop,
  MdOutlinePerson3,
  MdOutlinePerson4,
  MdOutlinePersonAddAlt1,
  MdOutlinePersonAddAlt,
  MdOutlinePersonAdd,
  MdOutlinePersonOff,
  MdOutlinePersonOutline,
  MdOutlinePersonRemoveAlt1,
  MdOutlinePersonRemove,
  MdOutlinePerson,
  MdOutlinePersonalInjury,
  MdPersonAddDisabled,
  MdPerson4,
  MdOutlineAddShoppingCart,
  MdAddShoppingCart,
  MdRemoveShoppingCart, MdShoppingCartCheckout, MdShoppingCart, MdFindReplace, MdPlace,
} from "react-icons/md";
import { auth, signOut } from "@/app/auth";

const menuItems = [
  {
    title: "Pages",
    list: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: <MdDashboard />,
      },
      {
        title: "Users",
        path: "/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Products",
        path: "/dashboard/products",
        icon: <MdShoppingBag />,
      },
      {
        title: "Stocks",
        path: "/dashboard/stocks",
        icon: <MdInventory />,
      },
      {
        title: "Orders",
        path: "/dashboard/orders",
        icon: <MdEditDocument />,
      },
      {
        title: "Suppliers",
        path: "/dashboard/suppliers",
        icon: <MdPerson4 />,
      },
      {
        title: "Transactions",
        path: "/dashboard/transactions",
        icon: <MdCurrencyExchange />,
      },
      {
        title: "Categories",
        path: "/dashboard/categories",
        icon: <MdAddShoppingCart />,
      },
      {
        title: "DeliveryMethods",
        path: "/dashboard/deliverymethods",
        icon: <MdPlace />,
      },
    ],
  },
  {
    title: "Analytics",
    list: [
      {
        title: "Revenue",
        path: "/dashboard/revenue",
        icon: <MdWork />,
      },
      {
        title: "Reports",
        path: "/dashboard/reports",
        icon: <MdAnalytics />,
      },
      {
        title: "Teams",
        path: "/dashboard/teams",
        icon: <MdPeople />,
      },
    ],
  },
  {
    title: "User",
    list: [
      {
        title: "Settings",
        path: "/dashboard/settings",
        icon: <MdOutlineSettings />,
      },
      {
        title: "Help",
        path: "/dashboard/help",
        icon: <MdHelpCenter />,
      },
    ],
  },
];

const Sidebar = async () => {
  const { user } = await auth();
  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Image
          className={styles.userImage}
          src={user.img || "/noavatar.png"}
          alt=""
          width="50"
          height="50"
        />
        <div className={styles.userDetail}>
          <span className={styles.username}>{user.username}</span>
          <span className={styles.userTitle}>Administrator</span>
        </div>
      </div>
      <ul className={styles.list}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>{cat.title}</span>
            {cat.list.map((item) => (
              <MenuLink item={item} key={item.title} />
            ))}
          </li>
        ))}
      </ul>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className={styles.logout}>
          <MdLogout />
          Logout
        </button>
      </form>
    </div>
  );
};

export default Sidebar;