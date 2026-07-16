import { supabase } from "./supabase";
import "./dashboard.css";
const appModal = document.querySelector("#appModal") as HTMLElement;
const modalIcon = document.querySelector("#modalIcon") as HTMLElement;
const modalTitle = document.querySelector("#modalTitle") as HTMLElement;
const modalText = document.querySelector("#modalText") as HTMLElement;
const modalCancel = document.querySelector("#modalCancel") as HTMLButtonElement;
const modalConfirm = document.querySelector("#modalConfirm") as HTMLButtonElement;


function closeAppModal() {
  appModal.classList.remove(
    "show",
    "delete-modal",
    "error-modal"
  );
}


function showMessageModal(
  type: "success" | "error",
  title: string,
  text: string
): Promise<void> {

  return new Promise((resolve) => {

    appModal.classList.remove(
      "delete-modal",
      "error-modal"
    );

    if (type === "error") {
      appModal.classList.add("error-modal");
      modalIcon.textContent = "!";
    } else {
      modalIcon.textContent = "✓";
    }

    modalTitle.textContent = title;
    modalText.textContent = text;

    modalCancel.style.display = "none";
    modalConfirm.textContent = "OK";

    modalConfirm.onclick = () => {
      closeAppModal();
      resolve();
    };

    appModal.classList.add("show");
  });
}


function showConfirmModal(
  title: string,
  text: string
): Promise<boolean> {

  return new Promise((resolve) => {

    appModal.classList.remove("error-modal");
    appModal.classList.add("delete-modal");

    modalIcon.textContent = "×";

    modalTitle.textContent = title;
    modalText.textContent = text;

    modalCancel.style.display = "";
    modalCancel.textContent = "Cancel";
    modalConfirm.textContent = "Delete";

    modalCancel.onclick = () => {
      closeAppModal();
      resolve(false);
    };

    modalConfirm.onclick = () => {
      closeAppModal();
      resolve(true);
    };

    appModal.classList.add("show");
  });
}
type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  created_at: string;
  customer_name: string;
  mobile_number: string;
  delivery_address: string;
  city: string;
  pin_code: string;
  payment_method: string;
  status: string;
  order_items: OrderItem[];
  total_amount: number;
};

type Product = {
  id: number;
  created_at: string;
  name: string;
  image: string;
  category: string;
  code: string;
  description: string;
  color: string;
  print: string;
  available: boolean;
  price: number;

  category_id: number | null;
  slug: string | null;
  sku: string | null;

  compare_at_price: number | null;
  discount_percent: number;

  stock_quantity: number;

  fabric: string;
  material: string;
  work_type: string;
  occasion: string;
  wash_care: string;
};

type ProductMeasurement = {
  id: number;
  created_at: string;
  product_id: number;
  top_length: number | null;
  bottom_length: number | null;
  dupatta_length: number | null;
  fabric_width: number | null;
  measurement_unit: string;
  additional_details: string;
};



const dashboardApp =
  document.querySelector<HTMLDivElement>(
    "#dashboard-app"
  );

if (!dashboardApp) {
  throw new Error(
    "Dashboard app element not found."
  );
}

// ======================================================
// SMALL HELPER FUNCTIONS
// ======================================================

const getInputValue = (
  selector: string
): string => {
  return (
    document
      .querySelector<HTMLInputElement>(selector)
      ?.value.trim() ?? ""
  );
};

const getTextareaValue = (
  selector: string
): string => {
  return (
    document
      .querySelector<HTMLTextAreaElement>(
        selector
      )
      ?.value.trim() ?? ""
  );
};

const getNumberValue = (
  selector: string
): number => {
  const value =
    document.querySelector<HTMLInputElement>(
      selector
    )?.value ?? "";

  if (value.trim() === "") {
    return 0;
  }

  return Number(value);
};

const getNullableNumberValue = (
  selector: string
): number | null => {
  const value =
    document.querySelector<HTMLInputElement>(
      selector
    )?.value ?? "";

  if (value.trim() === "") {
    return null;
  }

  const numberValue = Number(value);

  return Number.isNaN(numberValue)
    ? null
    : numberValue;
};

const getSelectBooleanValue = (
  selector: string
): boolean => {
  return (
    document.querySelector<HTMLSelectElement>(
      selector
    )?.value === "true"
  );
};

const escapeHtml = (
  value: unknown
): string => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};



const formatMoney = (
  amount: number
): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (
  date: string
): string => {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};




const getFileExtension = (
  file: File
): string => {
  return (
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "jpg"
  );
};

const createStoragePath = (
  file: File
): string => {
  const extension =
    getFileExtension(file);

  return (
    `products/${Date.now()}-` +
    `${crypto.randomUUID()}.${extension}`
  );
};



// ======================================================
// CHECK ADMIN LOGIN
// ======================================================

const checkAdminSession =
  async (): Promise<boolean> => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error(
        "Session loading error:",
        error
      );

      window.location.href =
        "/admin.html";

      return false;
    }

    if (!session) {
      window.location.href =
        "/admin.html";

      return false;
    }

    return true;
  };

// ======================================================
// DASHBOARD HTML
// ======================================================

const renderDashboard = () => {
  dashboardApp.innerHTML = `
    <div class="admin-layout">

      <aside class="admin-sidebar">

        <div class="admin-brand">

          <img
            src="/images/aliya-logo.jpeg"
            alt="Aliya Cloth Store"
          >

          <div>
            <h1>Aliya Cloth</h1>
            <p>Admin Panel</p>
          </div>

        </div>

        <nav class="admin-navigation">

          <button
            class="admin-nav-link active"
            data-section="overview"
          >
            Dashboard
          </button>

          <button
            class="admin-nav-link"
            data-section="orders"
          >
            Orders
          </button>

          <button
            class="admin-nav-link"
            data-section="products"
          >
            Products
          </button>

          <button
            class="admin-nav-link"
            data-section="categories"
          >
            Categories
          </button>

        </nav>

        <button
          id="admin-logout"
          class="admin-logout"
        >
          Logout
        </button>

      </aside>

      <main class="admin-main">

        <header class="admin-topbar">

          <div>

            <p class="admin-eyebrow">
              ALIYA CLOTH STORE
            </p>

            <h2 id="page-title">
              Dashboard
            </h2>

          </div>

          <div class="admin-account">
            <span class="admin-status"></span>
            <span>Admin</span>
          </div>

        </header>

        <section
          id="admin-content"
          class="admin-content"
        >
          <div class="dashboard-loading">
            Loading dashboard...
          </div>
        </section>

      </main>

    </div>
  `;
};

// ======================================================
// ORDERS
// ======================================================

const loadOrders =
  async (): Promise<Order[]> => {
    const { data, error } =
      await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Orders loading error:",
        error
      );

      return [];
    }

    return (data ?? []) as Order[];
  };

const showOverview = async () => {
  const content =
    document.querySelector<HTMLElement>(
      "#admin-content"
    );

  const pageTitle =
    document.querySelector<HTMLElement>(
      "#page-title"
    );

  if (!content || !pageTitle) {
    return;
  }

  pageTitle.textContent = "Dashboard";

  content.innerHTML = `
    <div class="dashboard-loading">
      Loading store information...
    </div>
  `;

  const orders = await loadOrders();

  const totalOrders =
    orders.length;

  const totalRevenue =
    orders.reduce(
      (total, order) =>
        total +
        Number(
          order.total_amount || 0
        ),
      0
    );

  const totalItemsSold =
    orders.reduce(
      (total, order) => {
        const items =
          Array.isArray(
            order.order_items
          )
            ? order.order_items
            : [];

        return (
          total +
          items.reduce(
            (
              itemTotal,
              item
            ) =>
              itemTotal +
              Number(
                item.quantity || 0
              ),
            0
          )
        );
      },
      0
    );

  const recentOrders =
    orders.slice(0, 5);

  content.innerHTML = `
    <section class="overview-section">

      <div class="stats-grid">

        <article class="stat-card">
          <p>Total Orders</p>
          <h3>${totalOrders}</h3>
          <span>
            Orders received
          </span>
        </article>

        <article class="stat-card">
          <p>Total Revenue</p>

          <h3>
            ${formatMoney(
              totalRevenue
            )}
          </h3>

          <span>
            Current order value
          </span>
        </article>

        <article class="stat-card">
          <p>Items Ordered</p>

          <h3>
            ${totalItemsSold}
          </h3>

          <span>
            Total product quantity
          </span>
        </article>

      </div>

      <div class="dashboard-panel">

        <div class="panel-heading">

          <div>

            <p class="admin-eyebrow">
              RECENT ACTIVITY
            </p>

            <h3>
              Recent Orders
            </h3>

          </div>

          <button
            class="view-orders-button"
            data-section="orders"
          >
            View All Orders
          </button>

        </div>

        <div class="table-wrapper">

          <table class="admin-table">

            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              ${
                recentOrders.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="5"
                        class="empty-table"
                      >
                        No orders received yet.
                      </td>
                    </tr>
                  `
                  : recentOrders
                      .map(
                        (order) => `
                          <tr>

                            <td>
                              #${order.id}
                            </td>

                            <td>

                              <strong>
                                ${escapeHtml(
                                  order.customer_name
                                )}
                              </strong>

                              <small>
                                ${escapeHtml(
                                  order.mobile_number
                                )}
                              </small>

                            </td>

                            <td>
                              ${formatDate(
                                order.created_at
                              )}
                            </td>

                            <td
                              class="payment-cell"
                            >
                              ${escapeHtml(
                                order.payment_method
                                  .toUpperCase()
                              )}
                            </td>

                            <td>

                              <strong>
                                ${formatMoney(
                                  Number(
                                    order.total_amount
                                  )
                                )}
                              </strong>

                            </td>

                          </tr>
                        `
                      )
                      .join("")
              }

            </tbody>

          </table>

        </div>

      </div>

    </section>
  `;
};

const showOrders = async () => {
  const content =
    document.querySelector<HTMLElement>(
      "#admin-content"
    );

  const pageTitle =
    document.querySelector<HTMLElement>(
      "#page-title"
    );

  if (!content || !pageTitle) {
    return;
  }

  pageTitle.textContent = "Orders";

  content.innerHTML = `
    <div class="dashboard-loading">
      Loading orders...
    </div>
  `;

  const orders =
    await loadOrders();

  content.innerHTML = `
    <section class="orders-section">

      <div class="panel-heading">

        <div>

          <p class="admin-eyebrow">
            STORE ORDERS
          </p>

          <h3>All Orders</h3>

        </div>

        <span class="order-count">
          ${orders.length} Orders
        </span>

      </div>

      <div class="dashboard-panel">

        <div class="table-wrapper">

          <table class="admin-table">

            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>

              ${
                orders.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="7"
                        class="empty-table"
                      >
                        No orders received yet.
                      </td>
                    </tr>
                  `
                  : orders
                      .map(
                        (order) => `
                          <tr>

                            <td>
                              #${order.id}
                            </td>

                            <td>

                              <strong>
                                ${escapeHtml(
                                  order.customer_name
                                )}
                              </strong>

                              <small>
                                ${escapeHtml(
                                  order.mobile_number
                                )}
                              </small>

                            </td>

                            <td>

                              ${escapeHtml(
                                order.city
                              )}

                              <small>
                                ${escapeHtml(
                                  order.pin_code
                                )}
                              </small>

                            </td>

                            <td>
                              ${formatDate(
                                order.created_at
                              )}
                            </td>

                            <td
                              class="payment-cell"
                            >
                              ${escapeHtml(
                                order.payment_method
                                  .toUpperCase()
                              )}
                            </td>

                            <td>

                              <strong>
                                ${formatMoney(
                                  Number(
                                    order.total_amount
                                  )
                                )}
                              </strong>

                            </td>

                            <td>

                              <button
                                class="order-details-button"
                                data-order-id="${order.id}"
                              >
                                View
                              </button>

                            </td>

                          </tr>
                        `
                      )
                      .join("")
              }

            </tbody>

          </table>

        </div>

      </div>

    </section>
  `;
};

// ======================================================
// ORDER DETAILS
// ======================================================

const showOrderDetails = async (
  orderId: number
) => {
  const content =
    document.querySelector<HTMLElement>(
      "#admin-content"
    );

  const pageTitle =
    document.querySelector<HTMLElement>(
      "#page-title"
    );

  if (!content || !pageTitle) {
    return;
  }

  content.innerHTML = `
    <div class="dashboard-loading">
      Loading order details...
    </div>
  `;

  const { data, error } =
    await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

  if (error || !data) {
    console.error(
      "Order details error:",
      error
    );

    content.innerHTML = `
      <div class="dashboard-message">
        Could not load this order.
      </div>
    `;

    return;
  }

  const order = data as Order;

  const items =
    Array.isArray(order.order_items)
      ? order.order_items
      : [];

  pageTitle.textContent =
    `Order #${order.id}`;

  content.innerHTML = `
    <section class="order-details-section">

      <button
        class="back-orders-button"
        data-section="orders"
      >
        ← Back to Orders
      </button>

      <div class="order-details-grid">

        <article
          class="dashboard-panel order-customer-card"
        >

          <p class="admin-eyebrow">
            CUSTOMER
          </p>

          <h3>
            ${escapeHtml(
              order.customer_name
            )}
          </h3>

          <div class="detail-list">

            <p>
              <span>Mobile Number</span>
              <strong>
                ${escapeHtml(
                  order.mobile_number
                )}
              </strong>
            </p>

            <p>
              <span>Address</span>
              <strong>
                ${escapeHtml(
                  order.delivery_address
                )}
              </strong>
            </p>

            <p>
              <span>City</span>
              <strong>
                ${escapeHtml(order.city)}
              </strong>
            </p>

            <p>
              <span>PIN Code</span>
              <strong>
                ${escapeHtml(
                  order.pin_code
                )}
              </strong>
            </p>

            <p>
              <span>Order Date</span>
              <strong>
                ${formatDate(
                  order.created_at
                )}
              </strong>
            </p>

            <p>
              <span>Payment</span>
              <strong>
                ${escapeHtml(
                  order.payment_method
                    .toUpperCase()
                )}
              </strong>
            </p>
           <p>
  <span>Order Status</span>

  <select id="order-status-select">
    <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
    <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>Confirmed</option>
    <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Shipped</option>
    <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
    <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Cancelled</option>
  </select>

  <button id="update-order-status">UPDATE STATUS</button>
</p>

          </div>

        </article>

        <article
          class="dashboard-panel order-items-card"
        >

          <p class="admin-eyebrow">
            ORDER ITEMS
          </p>

          <h3>Products Ordered</h3>

          <div class="order-product-list">

            ${
              items.length === 0
                ? `
                  <p class="empty-table">
                    No products found in this order.
                  </p>
                `
                : items
                    .map(
                      (item) => `
                        <div class="order-product">

                          <div>

                            <strong>
                              ${escapeHtml(
                                item.name
                              )}
                            </strong>

                            <small>
                              Quantity:
                              ${item.quantity}
                            </small>

                          </div>

                          <strong>
                            ${formatMoney(
                              Number(item.price) *
                                Number(
                                  item.quantity
                                )
                            )}
                          </strong>

                        </div>
                      `
                    )
                    .join("")
            }

          </div>

          <div class="order-grand-total">

            <span>Order Total</span>

            <strong>
              ${formatMoney(
                Number(
                  order.total_amount
                )
              )}
            </strong>

          </div>

        </article>

      </div>

    </section>
  `;
  const statusSelect =
  document.querySelector<HTMLSelectElement>("#order-status-select");

const updateStatusButton =
  document.querySelector<HTMLButtonElement>("#update-order-status");

updateStatusButton?.addEventListener("click", async () => {
  if (!statusSelect) return;

  const newStatus = statusSelect.value;

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", order.id);

  if (error) {
    console.error("STATUS MESSAGE:", error.message);
console.error("STATUS CODE:", error.code);
console.error("STATUS DETAILS:", error.details);
console.error("STATUS HINT:", error.hint);
    alert("Could not update order status.");
    return;
  }

  alert("Order status updated successfully.");
  order.status = newStatus;
await showOrderDetails(order.id);
});
};


// ======================================================
// PRODUCT DATA FUNCTIONS
// ======================================================

const loadProducts =
  async (): Promise<Product[]> => {
    const { data, error } =
      await supabase
        .from("products")
        .select("*")
        .order("id", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Products loading error:",
        error
      );

      return [];
    }

    return (data ?? []) as Product[];
  };

const loadProductMeasurements = async (
  productId: number
): Promise<ProductMeasurement | null> => {
  const { data, error } =
    await supabase
      .from("product_measurements")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

  if (error) {
    console.error(
      "Product measurements loading error:",
      error
    );

    return null;
  }

  return data as ProductMeasurement | null;
};

// ======================================================
// PRODUCTS PAGE
// ======================================================

const showProducts = async () => {
  const content =
    document.querySelector<HTMLElement>(
      "#admin-content"
    );

  const pageTitle =
    document.querySelector<HTMLElement>(
      "#page-title"
    );

  if (!content || !pageTitle) {
    return;
  }

  pageTitle.textContent = "Products";

  content.innerHTML = `
    <div class="dashboard-loading">
      Loading products...
    </div>
  `;

  const products =
    await loadProducts();

  content.innerHTML = `
    <section class="products-section">

      <div class="panel-heading">

        <div>
          <p class="admin-eyebrow">
            STORE INVENTORY
          </p>

          <h3>Products</h3>
        </div>

        <button
          id="add-product-button"
          class="view-orders-button"
        >
          + Add Product
        </button>

      </div>

      <div class="dashboard-panel">

        <div class="table-wrapper">

          <table class="admin-table">

            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              ${
                products.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="8"
                        class="empty-table"
                      >
                        No products found.
                      </td>
                    </tr>
                  `
                  : products
                      .map((product) => {
                        const compareAtPrice =
                          product.compare_at_price === null
                            ? null
                            : Number(
                                product.compare_at_price
                              );

                        const price =
                          Number(product.price);

                        return `
                          <tr>

                            <td>
                              <img
                                src="${escapeHtml(
                                  product.image
                                )}"
                                alt="${escapeHtml(
                                  product.name
                                )}"
                                class="admin-product-image"
                              >
                            </td>

                            <td>

                              <strong>
                                ${escapeHtml(
                                  product.name
                                )}
                              </strong>

                              <small>
                                ${escapeHtml(
                                  product.sku ||
                                    product.code
                                )}
                              </small>

                            </td>

                            <td>
                              ${escapeHtml(
                                product.category
                              )}
                            </td>

                            <td>

                              <strong>
                                ${formatMoney(
                                  price
                                )}
                              </strong>

                              ${
                                compareAtPrice !== null &&
                                compareAtPrice > price
                                  ? `
                                    <small>
                                      Original:
                                      ${formatMoney(
                                        compareAtPrice
                                      )}
                                    </small>
                                  `
                                  : ""
                              }

                            </td>

                            <td>
                              ${
                                Number(
                                  product.discount_percent
                                ) > 0
                                  ? `${Number(
                                      product.discount_percent
                                    )}% OFF`
                                  : "No discount"
                              }
                            </td>

                            <td>
                              ${Number(
                                product.stock_quantity
                              )}
                            </td>

                            <td>

                              <span
                                class="${
                                  product.available &&
                                  Number(
                                    product.stock_quantity
                                  ) > 0
                                    ? "product-available"
                                    : "product-unavailable"
                                }"
                              >
                                ${
                                  product.available &&
                                  Number(
                                    product.stock_quantity
                                  ) > 0
                                    ? "Yes"
                                    : "No"
                                }
                              </span>

                            </td>

                            <td>

                              <button
                                class="product-edit-button"
                                data-product-id="${product.id}"
                              >
                                Edit
                              </button>

                              <button
                                class="product-delete-button"
                                data-product-id="${product.id}"
                              >
                                Delete
                              </button>

                            </td>

                          </tr>
                        `;
                      })
                      .join("")
              }

            </tbody>

          </table>

        </div>

      </div>

    </section>
  `;
};
// ======================================================
// SHARED PRODUCT FORM FIELDS
// ======================================================

const createProductFormFields = (
  mode: "add" | "edit",
  product?: Product,
  measurements?: ProductMeasurement | null
): string => {
  const prefix =
    mode === "add"
      ? "product"
      : "edit-product";

  const originalPrice =
    product?.compare_at_price ??
    product?.price ??
    "";

  const discountPercent =
    product?.discount_percent ?? 0;

  const salePrice =
    product?.price ?? "";

  const topLength =
    measurements?.top_length ?? 2.5;

  const bottomLength =
    measurements?.bottom_length ?? 2.5;

  const dupattaLength =
    measurements?.dupatta_length ?? 2.25;

  return `
    <div class="product-form-grid">

      <label class="product-form-field">
        <span>Product Name</span>

        <input
          type="text"
          id="${prefix}-name"
          value="${escapeHtml(product?.name ?? "")}"
          required
        >
      </label>

     <label class="product-form-field">
  <span>Gallery Images</span>

  <input
    type="file"
    id="${prefix}-gallery-images"
    accept="image/jpeg,image/png,image/webp"
    multiple
  />

  <small>
    Select up to 10 additional product images.
  </small>
</label>

      <label class="product-form-field">
  <span>Category</span>

  <select
    id="${prefix}-category"
    class="product-category-select"
    data-selected-category="${escapeHtml(product?.category ?? "")}"
    required
  >
    <option value="">Select Category</option>
  </select>
</label>

      <label class="product-form-field">
        <span>SKU</span>

        <input
          type="text"
          id="${prefix}-sku"
          value="${escapeHtml(product?.sku ?? "")}"
          placeholder="Leave empty to generate automatically"
        >
      </label>

      <label class="product-form-field">
        <span>Original Price</span>

        <input
          type="number"
          id="${prefix}-original-price"
          min="0"
          step="0.01"
          value="${originalPrice}"
          required
        >
      </label>

      <label class="product-form-field">
        <span>Discount %</span>

        <input
          type="number"
          id="${prefix}-discount-percent"
          min="0"
          max="100"
          step="0.01"
          value="${discountPercent}"
          required
        >
      </label>

      <label class="product-form-field">
        <span>Sale Price (Auto Calculated)</span>

        <input
          type="number"
          id="${prefix}-price"
          min="0"
          step="0.01"
          value="${salePrice}"
          readonly
        >
      </label>

      <label class="product-form-field">
        <span>Stock Quantity</span>

        <input
          type="number"
          id="${prefix}-stock-quantity"
          min="0"
          step="1"
          value="${product?.stock_quantity ?? 0}"
          required
        >
      </label>

      <label class="product-form-field">
        <span>Color</span>

        <input
          type="text"
          id="${prefix}-color"
          value="${escapeHtml(product?.color ?? "")}"
          required
        >
      </label>

      <label class="product-form-field">
        <span>Print / Pattern</span>

        <input
          type="text"
          id="${prefix}-print"
          value="${escapeHtml(product?.print ?? "")}"
          required
        >
      </label>

      <label class="product-form-field">
        <span>Fabric</span>

        <input
          type="text"
          id="${prefix}-fabric"
          value="${escapeHtml(product?.fabric ?? "")}"
          placeholder="Example: Cotton"
        >
      </label>

      <label class="product-form-field">
        <span>Material</span>

        <input
          type="text"
          id="${prefix}-material"
          value="${escapeHtml(product?.material ?? "")}"
          placeholder="Example: 100% Cotton"
        >
      </label>

      <label class="product-form-field">
        <span>Work Type</span>

        <input
          type="text"
          id="${prefix}-work-type"
          value="${escapeHtml(product?.work_type ?? "")}"
          placeholder="Example: Printed"
        >
      </label>

      <label class="product-form-field">
        <span>Occasion</span>

        <input
          type="text"
          id="${prefix}-occasion"
          value="${escapeHtml(product?.occasion ?? "")}"
          placeholder="Example: Casual, Festive"
        >
      </label>

      <label class="product-form-field">
        <span>Top Length (meter)</span>

        <input
          type="number"
          id="${prefix}-top-length"
          min="0"
          step="0.01"
          value="${topLength}"
        >
      </label>

      <label class="product-form-field">
        <span>Bottom Length (meter)</span>

        <input
          type="number"
          id="${prefix}-bottom-length"
          min="0"
          step="0.01"
          value="${bottomLength}"
        >
      </label>

      <label class="product-form-field">
        <span>Dupatta Length (meter)</span>

        <input
          type="number"
          id="${prefix}-dupatta-length"
          min="0"
          step="0.01"
          value="${dupattaLength}"
        >
      </label>

      <label class="product-form-field">
        <span>Wash Care</span>

        <input
          type="text"
          id="${prefix}-wash-care"
          value="${escapeHtml(product?.wash_care ?? "")}"
          placeholder="Example: Gentle hand wash"
        >
      </label>

      <label class="product-form-field">
        <span>Available</span>

        <select id="${prefix}-available">

          <option
            value="true"
            ${
              product?.available !== false
                ? "selected"
                : ""
            }
          >
            Yes
          </option>

          <option
            value="false"
            ${
              product?.available === false
                ? "selected"
                : ""
            }
          >
            No
          </option>

        </select>
      </label>

      <label
        class="product-form-field product-description-field"
      >
        <span>Description</span>

        <textarea
          id="${prefix}-description"
          rows="5"
          required
        >${escapeHtml(product?.description ?? "")}</textarea>
      </label>

    </div>
  `;
};
const loadProductCategoryDropdowns = async () => {
  const categorySelects =
    document.querySelectorAll<HTMLSelectElement>(
      ".product-category-select"
    );

  if (categorySelects.length === 0) return;

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
    console.log("CATEGORY TEST:", categories, error);

  if (error) {
    console.error("CATEGORY DROPDOWN LOAD ERROR:", error);
    return;
  }

  categorySelects.forEach((select) => {
    const selectedCategory =
      select.dataset.selectedCategory ?? "";

    select.innerHTML =
      `<option value="">Select Category</option>`;

    categories?.forEach((category) => {
      const option = document.createElement("option");

      option.value = category.name;
      option.textContent = category.name;

      if (category.name === selectedCategory) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  });
};
// ======================================================
// AUTOMATIC DISCOUNT CALCULATION
// ======================================================

const updateCalculatedSalePrice = (
  prefix: "product" | "edit-product"
) => {
  const originalPrice =
    getNumberValue(
      `#${prefix}-original-price`
    );

  const discountPercent =
    getNumberValue(
      `#${prefix}-discount-percent`
    );

  const salePriceInput =
    document.querySelector<HTMLInputElement>(
      `#${prefix}-price`
    );

  if (!salePriceInput) {
    return;
  }

  if (
    originalPrice < 0 ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    salePriceInput.value = "";
    return;
  }

  const salePrice =
    originalPrice *
    (1 - discountPercent / 100);

  salePriceInput.value =
    salePrice.toFixed(2);
};
// ======================================================
// SHOW ADD PRODUCT FORM
// ======================================================

// =========================================================
// SHOW ADD PRODUCT FORM
// =========================================================

const showAddProductForm = async () => {
  const content =
    document.querySelector<HTMLElement>("#admin-content");

  const pageTitle =
    document.querySelector<HTMLElement>("#page-title");

  if (!content || !pageTitle) return;

  pageTitle.textContent = "Add Product";

  content.innerHTML = `
    <section class="product-form-section">

      <button
        type="button"
        class="back-products-button"
        data-section="products"
      >
        ← Back to Products
      </button>

      <div class="dashboard-panel product-form-panel">

        <div class="panel-heading">
          <div>
            <p class="admin-eyebrow">
              STORE INVENTORY
            </p>

            <h3>Add New Product</h3>
          </div>
        </div>

        <form id="add-product-form">

          <div class="product-form-grid">

            <label class="product-form-field">
              <span>Product Name</span>

              <input
                type="text"
                id="product-name"
                required
              >
            </label>


            <label class="product-form-field">
              <span>Primary Product Image</span>

              <label class="product-form-field">
  <span>Primary Product Image</span>

  <input
    type="file"
    id="product-image"
    accept="image/jpeg,image/png,image/webp"
    required
  >
</label>

<label class="product-form-field product-description-field">
  <span>Gallery Images (Optional)</span>

  <input
    type="file"
    id="product-gallery-images"
    accept="image/jpeg,image/png,image/webp"
    multiple
  >

  <small>
    Select up to 10 additional product images.
  </small>
</label>
            </label>


            <label class="product-form-field">
  <span>Category</span>

 <select
  id="product-category"
  class="product-category-select"
  data-selected-category=""
  required
>
  <option value="">Select Category</option>
</select>
</label>


            <label class="product-form-field">
              <span>SKU</span>

              <input
                type="text"
                id="product-sku"
                placeholder="Leave empty to generate automatically"
              >
            </label>


            <label class="product-form-field">
              <span>Original Price</span>

              <input
                type="number"
                id="product-price"
                min="0"
                step="0.01"
                required
              >
            </label>


            <label class="product-form-field">
              <span>Discount %</span>

              <input
                type="number"
                id="product-discount-percent"
                min="0"
                max="100"
                step="0.01"
                value="0"
                required
              >
            </label>


            <label class="product-form-field">
              <span>Sale Price (Auto Calculated)</span>

              <input
                type="number"
                id="product-sale-price"
                min="0"
                step="0.01"
                value="0"
                readonly
              >
            </label>


            <label class="product-form-field">
              <span>Stock Quantity</span>

              <input
                type="number"
                id="product-stock-quantity"
                min="0"
                step="1"
                value="0"
                required
              >
            </label>


            <label class="product-form-field">
              <span>Color</span>

              <input
                type="text"
                id="product-color"
                required
              >
            </label>


            <label class="product-form-field">
              <span>Print / Pattern</span>

              <input
                type="text"
                id="product-print"
                required
              >
            </label>


            <label class="product-form-field">
              <span>Fabric</span>

              <input
                type="text"
                id="product-fabric"
                placeholder="Example: Cotton"
              >
            </label>


            <label class="product-form-field">
              <span>Material</span>

              <input
                type="text"
                id="product-material"
                placeholder="Example: 100% Cotton"
              >
            </label>


            <label class="product-form-field">
              <span>Work Type</span>

              <input
                type="text"
                id="product-work-type"
                placeholder="Example: Printed"
              >
            </label>


            <label class="product-form-field">
              <span>Occasion</span>

              <input
                type="text"
                id="product-occasion"
                placeholder="Example: Casual, Festive"
              >
            </label>


            <label class="product-form-field">
              <span>Top Length (meter)</span>

              <input
                type="number"
                id="product-top-length"
                min="0"
                step="0.01"
                value="2.5"
              >
            </label>


            <label class="product-form-field">
              <span>Bottom Length (meter)</span>

              <input
                type="number"
                id="product-bottom-length"
                min="0"
                step="0.01"
                value="2.5"
              >
            </label>


            <label class="product-form-field">
              <span>Dupatta Length (meter)</span>

              <input
                type="number"
                id="product-dupatta-length"
                min="0"
                step="0.01"
                value="2.25"
              >
            </label>


            <label class="product-form-field">
              <span>Wash Care</span>

              <input
                type="text"
                id="product-wash-care"
                placeholder="Example: Gentle hand wash"
              >
            </label>


            <label class="product-form-field">
              <span>Available</span>

              <select id="product-available">

                <option value="true" selected>
                  Yes
                </option>

                <option value="false">
                  No
                </option>

              </select>
            </label>


            <label
              class="product-form-field product-description-field"
            >
              <span>Description</span>

              <textarea
                id="product-description"
                rows="5"
                required
              ></textarea>
            </label>

          </div>


          <div class="product-form-actions">

            <button
              type="submit"
              class="save-product-button"
            >
              Save Product
            </button>

          </div>


          <p
            id="product-form-message"
            class="product-form-message"
          ></p>

        </form>

      </div>

    </section>
  `;

  // -----------------------------------------
  // AUTOMATIC SALE PRICE CALCULATION
  // -----------------------------------------
const priceInput =
  document.querySelector<HTMLInputElement>("#product-price");

const discountInput =
  document.querySelector<HTMLInputElement>("#product-discount-percent");

const salePriceInput =
  document.querySelector<HTMLInputElement>("#product-sale-price");

const updateSalePrice = () => {
  if (!priceInput || !discountInput || !salePriceInput) return;

  const originalPrice = Number(priceInput.value) || 0;
  const discountPercent = Number(discountInput.value) || 0;

  const salePrice =
    originalPrice - originalPrice * (discountPercent / 100);

  salePriceInput.value = salePrice.toFixed(2);
};


priceInput?.addEventListener("input", updateSalePrice);
discountInput?.addEventListener("input", updateSalePrice);
updateSalePrice();
  
  await loadProductCategoryDropdowns();
};



// ======================================================
// SHOW EDIT PRODUCT FORM
// ======================================================

const showEditProductForm = async (
  productId: number
) => {
  const content =
    document.querySelector<HTMLElement>("#admin-content");

  const pageTitle =
    document.querySelector<HTMLElement>("#page-title");

  if (!content || !pageTitle) return;

  pageTitle.textContent = "Edit Product";

  content.innerHTML = `
    <div class="dashboard-loading">
      Loading product...
    </div>
  `;

  const [productResult, measurements] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single(),

      loadProductMeasurements(productId),
    ]);

  if (
    productResult.error ||
    !productResult.data
  ) {
    console.error(
      "Load product error:",
      productResult.error
    );

    content.innerHTML = `
      <div class="dashboard-message">
        Could not load product.
      </div>
    `;

    return;
  }

  const product =
    productResult.data as Product;

  content.innerHTML = `
    <section class="product-form-section">

      <button
        type="button"
        class="back-products-button"
        data-section="products"
      >
        ← Back to Products
      </button>

      <div class="dashboard-panel product-form-panel">

        <div class="panel-heading">
          <div>
            <p class="admin-eyebrow">
              STORE INVENTORY
            </p>

            <h3>
              Edit ${escapeHtml(product.name)}
            </h3>
          </div>
        </div>

        <form
          id="edit-product-form"
          data-product-id="${product.id}"
        >

          ${createProductFormFields(
            "edit",
            product,
            measurements
          )}

          <div class="product-form-actions">
            <button
              type="submit"
              class="update-product-button"
            >
              Update Product
            </button>
          </div>

          <p
            id="edit-product-form-message"
            class="product-form-message"
          ></p>

        </form>

      </div>

    </section>
  `;

  updateCalculatedSalePrice("edit-product");
};

// ======================================================
// UPLOAD PRODUCT IMAGE
// ======================================================

const uploadProductImage = async (
  imageFile: File
): Promise<{
  imageUrl: string;
  storagePath: string;
}> => {
  const storagePath =
    createStoragePath(imageFile);

  const { error: uploadError } =
    await supabase.storage
      .from("product-images")
      .upload(storagePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } =
    supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

  return {
    imageUrl: data.publicUrl,
    storagePath,
  };
};
void uploadProductImage;
// ======================================================
// READ PRODUCT FORM VALUES
// ======================================================

const readProductFormValues = (
  prefix: "product" | "edit-product"
) => {
  const name =
    getInputValue(`#${prefix}-name`);

  const category =
    getInputValue(`#${prefix}-category`);

  const sku =
    getInputValue(`#${prefix}-sku`);

  const originalPrice =
    getNumberValue(
      `#${prefix}-original-price`
    );

  const discountPercent =
    getNumberValue(
      `#${prefix}-discount-percent`
    );

  const price =
    getNumberValue(`#${prefix}-price`);

  const stockQuantity =
    getNumberValue(
      `#${prefix}-stock-quantity`
    );

  const color =
    getInputValue(`#${prefix}-color`);

  const print =
    getInputValue(`#${prefix}-print`);

  const fabric =
    getInputValue(`#${prefix}-fabric`);

  const material =
    getInputValue(`#${prefix}-material`);

  const workType =
    getInputValue(`#${prefix}-work-type`);

  const occasion =
    getInputValue(`#${prefix}-occasion`);

  const washCare =
    getInputValue(`#${prefix}-wash-care`);

  const description =
    getTextareaValue(
      `#${prefix}-description`
    );

  const available =
    getSelectBooleanValue(
      `#${prefix}-available`
    );

  const topLength =
    getNullableNumberValue(
      `#${prefix}-top-length`
    );

  const bottomLength =
    getNullableNumberValue(
      `#${prefix}-bottom-length`
    );

  const dupattaLength =
    getNullableNumberValue(
      `#${prefix}-dupatta-length`
    );

  return {
    name,
    category,
    sku,
    originalPrice,
    discountPercent,
    price,
    stockQuantity,
    color,
    print,
    fabric,
    material,
    workType,
    occasion,
    washCare,
    description,
    available,
    topLength,
    bottomLength,
    dupattaLength,
  };
};

// ======================================================
// VALIDATE PRODUCT FORM
// ======================================================

const validateProductValues = (
  values: ReturnType<
    typeof readProductFormValues
  >
): string | null => {
  if (
    !values.name ||
    !values.category ||
    !values.color ||
    !values.print ||
    !values.description
  ) {
    return "Please fill all required product details.";
  }

  if (
    Number.isNaN(values.originalPrice) ||
    values.originalPrice < 0
  ) {
    return "Original price is invalid.";
  }

  if (
    Number.isNaN(values.discountPercent) ||
    values.discountPercent < 0 ||
    values.discountPercent > 100
  ) {
    return "Discount must be between 0 and 100.";
  }

  if (
    Number.isNaN(values.price) ||
    values.price < 0
  ) {
    return "Sale price is invalid.";
  }

  if (
    !Number.isInteger(values.stockQuantity) ||
    values.stockQuantity < 0
  ) {
    return "Stock quantity must be a whole number of 0 or more.";
  }

  return null;
};

// ======================================================
// SAVE PRODUCT MEASUREMENTS
// ======================================================

const saveProductMeasurements = async (
  productId: number,
  values: ReturnType<
    typeof readProductFormValues
  >
) => {
  const { error } =
    await supabase
      .from("product_measurements")
      .upsert(
        {
          product_id: productId,
          top_length: values.topLength,
          bottom_length: values.bottomLength,
          dupatta_length:
            values.dupattaLength,
          measurement_unit: "meter",
        },
        {
          onConflict: "product_id",
        }
      );

  if (error) {
    throw error;
  }
};

// ======================================================
// SAVE PRIMARY IMAGE GALLERY RECORD
// ======================================================

const savePrimaryImageRecord = async (
  productId: number,
  imageUrl: string,
  productName: string
) => {
  const { error: resetError } =
    await supabase
      .from("product_images")
      .update({
        is_primary: false,
      })
      .eq("product_id", productId);

  if (resetError) {
    throw resetError;
  }

  const { error: insertError } =
    await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        image_url: imageUrl,
        alt_text: productName,
        sort_order: 0,
        is_primary: true,
      });

  if (insertError) {
    throw insertError;
  }
};

// ==========================================================
// UPDATE EXISTING PRODUCT
// ==========================================================

const updateProduct = async (
  form: HTMLFormElement
) => {
  const productId = Number(form.dataset.productId);

  const message =
    document.querySelector<HTMLElement>(
      "#edit-product-form-message"
    );

  const updateButton =
    form.querySelector<HTMLButtonElement>(
      ".update-product-button"
    );

  if (!Number.isInteger(productId)) {
    if (message) {
      message.textContent = "Invalid product ID.";
    }
    return;
  }

  const values = readProductFormValues("edit-product");

  const validationError = validateProductValues(values);

  if (validationError) {
    if (message) {
      message.textContent = validationError;
    }
    return;
  }

  const imageInput =
    document.querySelector<HTMLInputElement>(
      "#edit-product-image"
    );

  const newImageFile = imageInput?.files?.[0];

  if (updateButton) {
    updateButton.disabled = true;
    updateButton.textContent = "Updating...";
  }

  if (message) {
    message.textContent = "";
  }

  try {
    const {
      data: updatedProduct,
      error: updateError,
    } = await supabase
      .from("products")
      .update({
        name: values.name,
        category: values.category,
        code: values.sku,
        compare_at_price:
        values.originalPrice,
        discount_percent: values.discountPercent,
        price: values.price,
        stock_quantity: values.stockQuantity,
        color: values.color,
        print: values.print,
        fabric: values.fabric,
        material: values.material,
        work_type: values.workType,
        occasion: values.occasion,
        wash_care: values.washCare,
        description: values.description,
        available: values.available,
      })
      .eq("id", productId)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    await saveProductMeasurements(productId, values);

    if (newImageFile) {
      const fileExtension =
        newImageFile.name
          .split(".")
          .pop()
          ?.toLowerCase() ?? "jpg";

      const fileName =
        `products/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(fileName, newImageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: newImageFile.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      const { error: imageUpdateError } =
        await supabase
          .from("products")
          .update({
            image: imageUrl,
          })
          .eq("id", productId);

      if (imageUpdateError) {
        throw imageUpdateError;
      }

      await savePrimaryImageRecord(
        productId,
        imageUrl,
        values.name
      );
    }

    console.log("Updated product:", updatedProduct);

await showMessageModal(
  "success",
  "Product Updated",
  "Your product changes have been saved successfully."
);
    await showProducts();
  } catch (error) {
    console.error("Update product error:", error);

  const errorMessage =
  error instanceof Error
    ? error.message
    : typeof error === "object" &&
      error !== null &&
      "message" in error
    ? String(error.message)
    : JSON.stringify(error);

    if (message) {
      message.textContent =
        `Could not update product: ${errorMessage}`;
    }

    if (updateButton) {
      updateButton.disabled = false;
      updateButton.textContent = "Update Product";
    }
  }
};
// =========================================================
// SAVE NEW PRODUCT TO SUPABASE STORAGE + DATABASE
// =========================================================

const saveNewProduct = async (
  form: HTMLFormElement
) => {
  const getInputValue = (selector: string) =>
    document
      .querySelector<HTMLInputElement>(selector)
      ?.value.trim() ?? "";

  const getNumberValue = (selector: string) =>
    Number(
      document.querySelector<HTMLInputElement>(
        selector
      )?.value ?? 0
    );

  const name = getInputValue("#product-name");

 const imageInput =
  document.querySelector<HTMLInputElement>(
    "#product-image"
  );

const imageFile = imageInput?.files?.[0];

const galleryInput =
  document.querySelector<HTMLInputElement>(
    "#product-gallery-images"
  );

const galleryFiles = Array.from(
  galleryInput?.files ?? []
);

  const category =
    getInputValue("#product-category");

  const skuInput =
    getInputValue("#product-sku");
const originalPrice =
  getNumberValue("#product-price");

const discountPercent =
  getNumberValue("#product-discount-percent");


  
  const stockQuantity =
    getNumberValue("#product-stock-quantity");

  const color =
    getInputValue("#product-color");

  const print =
    getInputValue("#product-print");

  const fabric =
    getInputValue("#product-fabric");

  const material =
    getInputValue("#product-material");

  const workType =
    getInputValue("#product-work-type");

  const occasion =
    getInputValue("#product-occasion");

  const topLength =
    getNumberValue("#product-top-length");

  const bottomLength =
    getNumberValue("#product-bottom-length");

  const dupattaLength =
    getNumberValue("#product-dupatta-length");

  const washCare =
    getInputValue("#product-wash-care");

  const description =
    document
      .querySelector<HTMLTextAreaElement>(
        "#product-description"
      )
      ?.value.trim() ?? "";

  const available =
    document.querySelector<HTMLSelectElement>(
      "#product-available"
    )?.value === "true";

  const message =
    document.querySelector<HTMLElement>(
      "#product-form-message"
    );

  const saveButton =
    form.querySelector<HTMLButtonElement>(
      ".save-product-button"
    );


  // -----------------------------------------
  // VALIDATION
  // -----------------------------------------

  if (
    !name ||
    !imageFile ||
    galleryFiles.length === 0 ||
    !category ||
    !description ||
    !color ||
    !print
  ) {
    if (message) {
      message.textContent =
        "Please select a cover image and at least one gallery image.";
    }

    return;
  }

  if (
    !Number.isFinite(originalPrice) ||
    originalPrice < 0
  ) {
    if (message) {
      message.textContent =
        "Original price is invalid.";
    }

    return;
  }

  if (
    !Number.isFinite(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    if (message) {
      message.textContent =
        "Discount must be between 0 and 100.";
    }

    return;
  }

  if (
    !Number.isInteger(stockQuantity) ||
    stockQuantity < 0
  ) {
    if (message) {
      message.textContent =
        "Stock quantity must be a whole number of 0 or more.";
    }

    return;
  }


  // -----------------------------------------
  // CALCULATE SALE PRICE AGAIN
  // NEVER TRUST ONLY THE READONLY INPUT
  // -----------------------------------------

  const calculatedSalePrice =
    Number(
      (
        originalPrice -
        originalPrice * (discountPercent / 100)
      ).toFixed(2)
    );


  // -----------------------------------------
  // GENERATE CODE + SKU
  // -----------------------------------------

  const uniqueId =
    crypto.randomUUID();

  const code =
    `ACS-${Date.now()}-${uniqueId.slice(0, 8)}`;

  const sku =
    skuInput ||
    `ACS-SKU-${uniqueId.slice(0, 8).toUpperCase()}`;


  // -----------------------------------------
  // DISABLE SAVE BUTTON
  // -----------------------------------------

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
  }

  if (message) {
    message.textContent = "";
  }


  // -----------------------------------------
  // CREATE UNIQUE STORAGE FILE NAME
  // -----------------------------------------

  const fileExtension =
    imageFile.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "jpg";

  const fileName =
    `products/${Date.now()}-${uniqueId}.${fileExtension}`;


  // -----------------------------------------
  // UPLOAD IMAGE
  // -----------------------------------------

  const { error: uploadError } =
    await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      });

  if (uploadError) {
    console.error(
      "Image upload error:",
      uploadError
    );

    if (message) {
      message.textContent =
        `Could not upload image: ${uploadError.message}`;
    }

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Save Product";
    }

    return;
  }


  // -----------------------------------------
  // GET PUBLIC IMAGE URL
  // -----------------------------------------

  const { data: publicUrlData } =
    supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

  const imageUrl =
    publicUrlData.publicUrl;


  // -----------------------------------------
  // INSERT PRODUCT
  // -----------------------------------------
const {
  data: insertedProduct,
  error: insertError,
} = await supabase
  .from("products")
  .insert({
    code,
    sku,

    name,
    image: imageUrl,
    category,
    description,

    color,
    print,

    available,

    price: calculatedSalePrice,

    compare_at_price: originalPrice,
    discount_percent: discountPercent,

    stock_quantity: stockQuantity,

    fabric,
    material,
    work_type: workType,
    occasion,
    wash_care: washCare,
  })
  .select("id")
  .single();
if (insertedProduct) {
  let sortOrder = 1;

  for (const galleryFile of galleryFiles) {
    const extension =
      galleryFile.name.split(".").pop()?.toLowerCase() ?? "jpg";

    const galleryFileName =
      `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: galleryUploadError } =
      await supabase.storage
        .from("product-images")
        .upload(galleryFileName, galleryFile);

    if (galleryUploadError) {
      console.error(galleryUploadError);
      continue;
    }

    const { data } =
      supabase.storage
        .from("product-images")
        .getPublicUrl(galleryFileName);

    await supabase
      .from("product_images")
      .insert({
        product_id: insertedProduct.id,
        image_url: data.publicUrl,
        alt_text: name,
        sort_order: sortOrder++,
        is_primary: false,
      });
  }
}
  // -----------------------------------------
  // DATABASE INSERT FAILED
  // -----------------------------------------

  if (insertError) {
    console.error(
      "Add product error:",
      insertError
    );

    // Remove uploaded image to avoid orphan files.

    const { error: cleanupError } =
      await supabase.storage
        .from("product-images")
        .remove([fileName]);

    if (cleanupError) {
      console.error(
        "Uploaded image cleanup error:",
        cleanupError
      );
    }

    if (message) {
      message.textContent =
        `Could not add product: ${insertError.message}`;
    }

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Save Product";
    }

    return;
  }


  // -----------------------------------------
  // SUCCESS
  // -----------------------------------------

  form.reset();

  if (message) {
    message.textContent =
      "Product added successfully.";
  }

 await showMessageModal(
  "success",
  "Product Added",
  "The product has been successfully added to your store inventory."
);

  await showProducts();
};

// ======================================================
// DELETE PRODUCT
// ======================================================

const deleteProduct = async (
  productId: number
) => {
  const confirmed = await showConfirmModal(
  "Delete Product?",
  "This product will be permanently removed from your store inventory. This action cannot be undone."
);

if (!confirmed) {
  return;
}
  const { error } =
    await supabase
      .from("products")
      .delete()
      .eq("id", productId);

  if (error) {
  console.error(
    "Delete product error:",
    error
  );

  await showMessageModal(
    "error",
    "Delete Failed",
    `Could not delete the product: ${error.message}`
  );

  return;
}
  await showMessageModal(
  "success",
  "Product Deleted",
  "The product has been successfully removed from your store inventory."
);

  await showProducts();
};

// ======================================================
// CATEGORIES PAGE
// ======================================================
const showAddCategoryForm = () => {
  const content =
    document.querySelector<HTMLElement>("#admin-content");

  const pageTitle =
    document.querySelector<HTMLElement>("#page-title");

  if (!content || !pageTitle) return;

  pageTitle.textContent = "Add Category";

  content.innerHTML = `
    <section class="categories-admin-section">

      <div class="categories-admin-header">
        <div>
          <p class="admin-eyebrow">CATEGORY MANAGEMENT</p>
          <h2>Add Category</h2>
        </div>
      </div>

      <form id="add-category-form">

        <div class="admin-form-group">
          <label for="category-name">Category Name</label>

          <input
            type="text"
            id="category-name"
            name="category-name"
            placeholder="Enter category name"
            required
          />
        </div>

        <button type="submit" class="admin-primary-button">
          SAVE CATEGORY
        </button>

      </form>

    </section>
  `;
};

const showEditCategoryForm = async (categoryId: number) => {
  const content =
    document.querySelector<HTMLElement>("#admin-content");

  const pageTitle =
    document.querySelector<HTMLElement>("#page-title");

  if (!content || !pageTitle) return;

  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("id", categoryId)
    .single();

  if (error || !category) {
    console.error("CATEGORY FETCH ERROR:", error);
    alert("Could not load category.");
    return;
  }

  pageTitle.textContent = "Edit Category";

  content.innerHTML = `
    <section class="categories-admin-section">

      <div class="categories-admin-header">
        <div>
          <p class="admin-eyebrow">CATEGORY MANAGEMENT</p>
          <h2>Edit Category</h2>
        </div>
      </div>

      <form id="edit-category-form">

        <input
          type="hidden"
          id="edit-category-id"
          value="${category.id}"
        />

        <div class="admin-form-group">
          <label for="edit-category-name">Category Name</label>

          <input
            type="text"
            id="edit-category-name"
            name="category-name"
            value="${category.name}"
            required
          />
        </div>

        <button
          type="submit"
          class="admin-primary-button"
        >
          UPDATE CATEGORY
        </button>

      </form>

    </section>
  `;
};
const showCategories = async () => {
  const content =
    document.querySelector<HTMLElement>("#admin-content");

  const pageTitle =
    document.querySelector<HTMLElement>("#page-title");

  if (!content || !pageTitle) return;

  pageTitle.textContent = "Categories";

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("id", { ascending: true });

  if (error) {
    console.error("CATEGORY ERROR:", error);

    content.innerHTML = `
      <section class="dashboard-panel">
        <h3>Could not load categories</h3>
        <p>${error.message}</p>
      </section>
    `;

    return;
  }

  content.innerHTML = `
    <section class="dashboard-panel">

     <div class="products-section-header">
  <div>
    <p class="admin-eyebrow">CATEGORY MANAGEMENT</p>
    <h2>Categories</h2>
  </div>

  <button
    type="button"
    id="add-category-button"
    class="admin-primary-button"
  >
    ADD CATEGORY
  </button>
</div>

      <div class="categories-admin-list">

        ${
          categories && categories.length > 0
            ? categories
                .map(
                  (category) => `
                    <div class="category-admin-row">

                      <div class="category-admin-info">
                        <h3>${category.name}</h3>
                        <p>${category.slug}</p>
                      </div>

                      <div class="category-admin-actions">

  <span class="category-admin-id">
    ID: ${category.id}
  </span>

  <button
    type="button"
    class="edit-category-button"
    data-category-id="${category.id}"
    data-category-name="${category.name}"
  >
    EDIT
  </button>

  <button
    type="button"
    class="delete-category-button"
    data-category-id="${category.id}"
  >
    DELETE
  </button>

</div>

                    </div>
                  `
                )
                .join("")
            : `
                <div class="empty-state">
                  <p>No categories found.</p>
                </div>
              `
        }

      </div>

    </section>
    `;
      };

// ======================================================
// ACTIVE NAVIGATION
// ======================================================

const setActiveNavigation = (
  section: string
) => {
  document
    .querySelectorAll<HTMLButtonElement>(
      ".admin-nav-link"
    )
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.section === section
      );
    });
};

// ======================================================
// OPEN SECTION
// ======================================================

const openSection = async (
  section: string
) => {
  setActiveNavigation(section);

  if (section === "overview") {
    await showOverview();
    return;
  }

  if (section === "orders") {
    await showOrders();
    return;
  }

  if (section === "products") {
    await showProducts();
    return;
  }

  if (section === "categories") {
    showCategories();
  }
};

// ======================================================
// CLICK EVENTS
// ======================================================

document.addEventListener(
  "click",
  async (event) => {
    const target =
      event.target as HTMLElement;

    // ADD PRODUCT

    const addProductButton =
      target.closest<HTMLButtonElement>(
        "#add-product-button"
      );

    if (addProductButton) {
      showAddProductForm();
      return;
    }
    // ADD CATEGORY

const addCategoryButton =
  target.closest<HTMLButtonElement>("#add-category-button");

if (addCategoryButton) {
  showAddCategoryForm();
  return;
}
// EDIT CATEGORY

const editCategoryButton =
  target.closest<HTMLButtonElement>(
    ".edit-category-button"
  );

if (editCategoryButton) {
  const categoryId = Number(
    editCategoryButton.dataset.categoryId
  );

  if (!Number.isNaN(categoryId)) {
    await showEditCategoryForm(categoryId);
  }

  return;
}
    // EDIT PRODUCT

    const editProductButton =
      target.closest<HTMLButtonElement>(
        ".product-edit-button"
      );

    if (editProductButton) {
      const productId = Number(
        editProductButton.dataset.productId
      );

      if (!Number.isNaN(productId)) {
        await showEditProductForm(productId);
      }

      return;
    }
// DELETE CATEGORY

const deleteCategoryButton =
  target.closest<HTMLButtonElement>(".delete-category-button");

if (deleteCategoryButton) {
  const categoryId = Number(
    deleteCategoryButton.dataset.categoryId
  );

  if (Number.isNaN(categoryId)) {
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete this category?"
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    console.error("CATEGORY DELETE ERROR:", error);
    alert(error.message);
    return;
  }

  await showMessageModal(
  "success",
  "Category Deleted",
  "The category has been successfully deleted from your store."
);

  await showCategories();
  return;
}
    // DELETE PRODUCT

    const deleteProductButton =
      target.closest<HTMLButtonElement>(
        ".product-delete-button"
      );

    if (deleteProductButton) {
      const productId = Number(
        deleteProductButton.dataset.productId
      );

      if (!Number.isNaN(productId)) {
        await deleteProduct(productId);
      }

      return;
    }

    // NAVIGATION

    const navigationButton =
      target.closest<HTMLButtonElement>(
        "[data-section]"
      );

    if (navigationButton) {
      const section =
        navigationButton.dataset.section;

      if (section) {
        await openSection(section);
      }

      return;
    }

    // ORDER DETAILS

    const orderDetailsButton =
      target.closest<HTMLButtonElement>(
        ".order-details-button"
      );

    if (orderDetailsButton) {
      const orderId = Number(
        orderDetailsButton.dataset.orderId
      );

      if (!Number.isNaN(orderId)) {
        await showOrderDetails(orderId);
      }

      return;
    }

    // LOGOUT

    const logoutButton =
      target.closest<HTMLButtonElement>(
        "#admin-logout"
      );

    if (logoutButton) {
      logoutButton.disabled = true;
      logoutButton.textContent =
        "Logging out...";

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Logout error:",
          error
        );

        logoutButton.disabled = false;
        logoutButton.textContent = "Logout";

        alert(
          "Could not log out. Please try again."
        );

        return;
      }

      window.location.href =
        "/admin.html";
    }
  }
);

// ======================================================
// AUTOMATIC PRICE INPUT EVENTS
// ======================================================

document.addEventListener(
  "input",
  (event) => {
    const target =
      event.target as HTMLElement;

    if (
      target.matches(
        "#product-original-price, #product-discount-percent"
      )
    ) {
      updateCalculatedSalePrice("product");
      return;
    }

    if (
      target.matches(
        "#edit-product-original-price, #edit-product-discount-percent"
      )
    ) {
      updateCalculatedSalePrice(
        "edit-product"
      );
    }
  }
);

// ======================================================
// FORM SUBMIT EVENTS
// ======================================================

document.addEventListener(
  "submit",
  async (event) => {
    const form =
      event.target as HTMLFormElement;

    if (form.id === "add-product-form") {
      event.preventDefault();

      await saveNewProduct(form);
      return;
    }

    if (form.id === "edit-product-form") {
      event.preventDefault();

      await updateProduct(form);
    }
    if (form.id === "add-category-form") {
  event.preventDefault();

  const categoryNameInput =
    form.querySelector<HTMLInputElement>("#category-name");

  if (!categoryNameInput) return;

  const name = categoryNameInput.value.trim();

  if (!name) {
    alert("Please enter a category name.");
    return;
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { error } = await supabase
    .from("categories")
    .insert({
      name: name,
      slug: slug,
    });

  if (error) {
    console.error("CATEGORY INSERT ERROR:", error);
    alert(error.message);
    return;
  }

  await showMessageModal(
  "success",
  "Category Added",
  "The category has been successfully added to your store."
);

  await showCategories();
  return;
}
if (form.id === "edit-category-form") {
  event.preventDefault();

  const categoryIdInput =
    form.querySelector<HTMLInputElement>("#edit-category-id");

  const categoryNameInput =
    form.querySelector<HTMLInputElement>("#edit-category-name");

  if (!categoryIdInput || !categoryNameInput) return;

  const categoryId = Number(categoryIdInput.value);
  const name = categoryNameInput.value.trim();

  if (!name || Number.isNaN(categoryId)) return;

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { error } = await supabase
    .from("categories")
    .update({
      name: name,
      slug: slug,
    })
    .eq("id", categoryId);

  if (error) {
    console.error("CATEGORY UPDATE ERROR:", error);
    alert(error.message);
    return;
  }

await showMessageModal(
  "success",
  "Category Updated",
  "Your category changes have been saved successfully."
);

  await showCategories();
  return;
}
  }
);



// ======================================================
// START DASHBOARD
// ======================================================

const startDashboard = async () => {
  const isLoggedIn =
    await checkAdminSession();

  if (!isLoggedIn) {
    return;
  }

  renderDashboard();

  await showOverview();
};

startDashboard();