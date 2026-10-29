import banner1 from '../public/banner1.jpg';
import banner2 from '../public/banner2.jpg';
import banner3 from '../public/banner2.png';
export const itemData = [
  {
    img: banner1,
    title: 'Offer1',
  },
  {
    img: banner2,
    title: 'Offer2',
  },
  {
    img: banner3,
    title: 'Offer3',
  },
];

export const stats = { products: 12, users: 10, orders: 17 };

export const items = [
            {
              label: "Products",
              value: stats.products,
              buttonText: "Manage Products",
              route: "/admin/products",
            },
            {
              label: "Users",
              value: stats.users,
              buttonText: "Manage Users",
              route: "/admin/users",
            },
            {
              label: "Orders",
              value: stats.orders,
              buttonText: "Orders Management",
              route: "/admin/orders",
            },
          ];


export const sortOptions = ["Price", "New Arrivals"];