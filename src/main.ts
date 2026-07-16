import { supabase } from "./supabase";
import "./style.css";
import { getProducts, type Product } from "./product";
let products: Product[] = [];

products = await getProducts();
let searchText = "";
let selectedPrint = "";
let selectedCategory = "";

type CartItem = {
  product: Product;
  quantity: number;
};

let cart: CartItem[] = JSON.parse(
  localStorage.getItem("aliya-cart") || "[]"
);

const saveCart = () => {
  localStorage.setItem("aliya-cart", JSON.stringify(cart));
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const uniquePrints = [
  ...new Set(products.map((product) => product.print)),
];

const uniqueCategories = [
  ...new Set(products.map((product) => product.category)),
];

const createProductCards = (productList: Product[]) => {
  if (productList.length === 0) {
    return `
      <div class="no-products">
        <span class="no-products-icon">⌕</span>
        <h3>No products found</h3>
        <p>Try another search, print, or collection filter.</p>
        <button class="reset-filters" type="button">
          View All Products
        </button>
      </div>
    `;
  }

  return productList
    .map(
      (product) => `
       <article
  class="product-card"
  onclick="window.location.href='product-details.html?id=${product.id}'"
>

          <div class="product-media">

           <img
  src="${product.image}"
  alt="${escapeHtml(product.name)}"
  class="product-image"
  loading="lazy"
  onclick="window.location.href='product-details.html?id=${product.id}'"
>
            <span class="product-category-badge">
              ${escapeHtml(product.category)}
            </span>

            ${
              product.available
                ? `
                  <span class="stock-badge in-stock">
                    In Stock
                  </span>
                `
                : `
                  <span class="stock-badge sold-out">
                    Sold Out
                  </span>
                `
            }

          </div>

          <div class="product-info">

            <p class="product-code">
              ${escapeHtml(product.code)}
            </p>

           <h3
  onclick="window.location.href='product-details.html?id=${product.id}'"
  style="cursor:pointer;"
>
  ${escapeHtml(product.name)}
</h3>

            <p class="product-description">
              ${escapeHtml(product.description)}
            </p>

            <div class="product-meta">
              <span>${escapeHtml(product.color)}</span>
              <span>${escapeHtml(product.print)}</span>
            </div>

            <div class="product-price-row">

              <p class="price">
                ${money(product.price)}
              </p>

              <span class="tax-note">
                Inclusive of taxes
              </span>

            </div>

            ${
              product.available
                ? `
                  <button
                    class="add-to-cart"
                    data-id="${product.id}"
                    type="button"
                  >
                    Add to Cart
                  </button>
                `
                : `
                  <button
                    class="out-of-stock-button"
                    type="button"
                    disabled
                  >
                    Currently Unavailable
                  </button>
                `
            }

          </div>

        </article>
      `
    )
    .join("");
};

const filteredProducts = () => {
  const search = searchText.trim().toLowerCase();

  return products.filter((product) => {
    const searchableText = [
      product.name,
      product.color,
      product.print,
      product.code,
      product.category,
      product.description,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      search === "" || searchableText.includes(search);

    const matchesPrint =
      selectedPrint === "" ||
      product.print === selectedPrint;

    const matchesCategory =
      selectedCategory === "" ||
      product.category === selectedCategory;

    return (
      matchesSearch &&
      matchesPrint &&
      matchesCategory
    );
  });
};

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `

  <div class="announcement-bar">
    <div class="announcement-inner">
      <span>Authentic fabrics from Jaipur</span>
      <span class="announcement-divider">◆</span>
      <span>Cash on Delivery Available</span>
      <span class="announcement-divider">◆</span>
      <span>Thoughtfully Selected Collections</span>
    </div>
  </div>

  <header class="site-header">

    <div class="header-container">

      <a
        href="#home"
        class="brand"
        aria-label="Aliya Cloth Store home"
      >
        <img
          src="/images/aliya-logo.jpeg"
          alt="Aliya Cloth Store"
          class="site-logo"
        >
      </a>

      <nav
        id="desktop-nav"
        class="desktop-nav"
        aria-label="Main navigation"
      >
        <a href="#home">Home</a>
        <a href="#collections">Collections</a>
        <a href="#products">Shop</a>
        <a href="#about">Our Story</a>
        <a href="#contact">Contact</a>
      </nav>

      <div class="header-actions">

        <button
          id="header-search-button"
          class="icon-button"
          type="button"
          aria-label="Search products"
        >
          ⌕
        </button>

        <button
          id="cart-button"
          class="cart-button"
          type="button"
          aria-label="Open shopping cart"
        >
          <span class="cart-icon">🛍</span>
          <span class="cart-text">Cart</span>
          <span id="cart-count" class="cart-count">0</span>
        </button>

        <button
          id="menu-button"
          class="menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

    </div>

    <div id="mobile-menu" class="mobile-menu">
      <a href="#home">Home</a>
      <a href="#collections">Collections</a>
      <a href="#products">Shop</a>
      <a href="#about">Our Story</a>
      <a href="#contact">Contact</a>
    </div>

    <div id="header-search" class="header-search">

      <div class="header-search-inner">

        <input
          id="headerSearchInput"
          type="search"
          placeholder="Search fabrics, prints, colours..."
          aria-label="Search products"
        >

        <button
          id="close-header-search"
          type="button"
          aria-label="Close search"
        >
          ×
        </button>

      </div>

    </div>

  </header>

  <main>

    <section class="hero" id="home">

      <div class="hero-decoration hero-decoration-one"></div>
      <div class="hero-decoration hero-decoration-two"></div>

      <div class="hero-content">

        <p class="eyebrow">
          JAIPUR • FABRICS • TRADITION
        </p>

        <h1>
          Timeless Fabrics,
          <span>Made for Your Story.</span>
        </h1>

        <p class="hero-description">
          Discover thoughtfully selected unstitched suits and
          traditional fabrics inspired by the colours, craft and
          heritage of Jaipur.
        </p>

        <div class="hero-actions">

          <a href="#products" class="primary-button">
            Shop Collection
          </a>

          <a href="#about" class="secondary-button">
            Discover Our Story
          </a>

        </div>

      </div>

    </section>

    <section class="trust-strip">

      <div class="trust-item">
        <span class="trust-icon">✦</span>
        <div>
          <strong>Selected Quality</strong>
          <p>Fabrics chosen with care</p>
        </div>
      </div>

      <div class="trust-item">
        <span class="trust-icon">₹</span>
        <div>
          <strong>Cash on Delivery</strong>
          <p>Simple and convenient ordering</p>
        </div>
      </div>

      <div class="trust-item">
        <span class="trust-icon">⌂</span>
        <div>
          <strong>Jaipur Based Store</strong>
          <p>Serving customers with trusted service</p>
        </div>
      </div>

      <div class="trust-item">
        <span class="trust-icon">♡</span>
        <div>
          <strong>Personal Service</strong>
          <p>Customer care that feels personal</p>
        </div>
      </div>

    </section>

    <section class="collections-section" id="collections">

      <div class="section-heading">

        <p class="eyebrow">
          SHOP BY COLLECTION
        </p>

        <h2>
          Fabrics for Every Occasion
        </h2>

        <p>
          Begin with our signature cotton suit collection.
          More carefully selected collections will be added as
          Aliya Cloth Store grows.
        </p>

      </div>

      <div class="collection-grid">

        <button
          class="collection-card active-collection"
          type="button"
          data-category=""
        >

          <div class="collection-image-wrap">
            <img
              src="${products[0]?.image ?? ""}"
              alt="All Aliya Cloth Store products"
            >
          </div>

          <div class="collection-card-content">
            <p>Explore Everything</p>
            <h3>All Products</h3>
            <span>Shop Now →</span>
          </div>

        </button>

        ${uniqueCategories
          .map((category, index) => {
            const categoryProduct =
              products.find(
                (product) =>
                  product.category === category
              ) ?? products[index];

            return `
              <button
                class="collection-card"
                type="button"
                data-category="${escapeHtml(category)}"
              >

                <div class="collection-image-wrap">
                  <img
                    src="${categoryProduct?.image ?? ""}"
                    alt="${escapeHtml(category)}"
                  >
                </div>

                <div class="collection-card-content">
                  <p>Aliya Cloth Store</p>
                  <h3>${escapeHtml(category)}</h3>
                  <span>View Collection →</span>
                </div>

              </button>
            `;
          })
          .join("")}

      </div>

    </section>

    <section class="products-section" id="products">

      <div class="section-heading">

        <p class="eyebrow">
          OUR COLLECTION
        </p>

        <h2>
          Shop Our Fabrics
        </h2>

        <p>
          Explore our available designs and find the fabric
          that suits your style.
        </p>

      </div>

      <div class="products-toolbar">

        <div class="search-box">

          <span>⌕</span>

          <input
            id="searchInput"
            class="search-input"
            type="search"
            placeholder="Search by name, colour, print or code..."
          >

        </div>

        <select
          id="printFilter"
          class="print-filter"
          aria-label="Filter by print"
        >

          <option value="">All Prints</option>

          ${uniquePrints
            .map(
              (print) => `
                <option value="${escapeHtml(print)}">
                  ${escapeHtml(print)}
                </option>
              `
            )
            .join("")}

        </select>

        <button
          id="clear-filters"
          class="clear-filters"
          type="button"
        >
          Clear
        </button>

      </div>

      <div class="products-result-row">

        <p id="product-result-count">
          ${products.length} products
        </p>

        <p id="active-filter-label">
          Showing all products
        </p>

      </div>

      <div class="product-grid">
        ${createProductCards(products)}
      </div>

    </section>
    <section class="story-section" id="about">

      <div class="story-content">

        <p class="eyebrow">
          OUR STORY
        </p>

        <h2>
          Jaipur Tradition,
          Thoughtfully Selected.
        </h2>

        <p>
          Aliya Cloth Store is a Jaipur-based fabric store
          focused on quality, variety and trusted customer
          service.
        </p>

        <p>
          Our collection brings together unstitched suits,
          traditional prints and wearable designs selected for
          customers who appreciate comfort, colour and timeless
          Indian style.
        </p>

        <a href="#products" class="text-link">
          Explore Our Collection →
        </a>

      </div>


      <div class="story-visual">

        <div class="story-image-large">
          <img
            src="${products[2]?.image ?? products[0]?.image ?? ""}"
            alt="Aliya Cloth Store fabric collection"
          >
        </div>

        <div class="story-image-small">
          <img
            src="${products[5]?.image ?? products[0]?.image ?? ""}"
            alt="Traditional fabric from Aliya Cloth Store"
          >
        </div>

        <div class="story-badge">
          <strong>JAIPUR</strong>
          <span>Tradition in Every Thread</span>
        </div>

      </div>

    </section>


    <section class="service-section">

      <div class="section-heading">

        <p class="eyebrow">
          SHOP WITH CONFIDENCE
        </p>

        <h2>
          Simple Shopping. Trusted Service.
        </h2>

      </div>


      <div class="service-grid">

        <article class="service-card">
          <span>01</span>
          <h3>Browse</h3>
          <p>
            Explore available fabrics, colours and prints from
            our current collection.
          </p>
        </article>

        <article class="service-card">
          <span>02</span>
          <h3>Add to Cart</h3>
          <p>
            Choose your products and adjust quantities in your
            shopping cart.
          </p>
        </article>

        <article class="service-card">
          <span>03</span>
          <h3>Place Your Order</h3>
          <p>
            Enter your delivery information and place your COD
            order securely.
          </p>
        </article>

        <article class="service-card">
          <span>04</span>
          <h3>Order Processing</h3>
          <p>
            Your order details are received by Aliya Cloth
            Store for confirmation and fulfilment.
          </p>
        </article>

      </div>

    </section>


    <section class="contact-section" id="contact">

      <div>

        <p class="eyebrow">
          GET IN TOUCH
        </p>

        <h2>
          We’d Love to Hear From You
        </h2>

        <p>
          Have a product question or need help with an order?
          Contact Aliya Cloth Store for assistance.
        </p>

      </div>

      <a href="#products" class="primary-button">
        Browse Collection
      </a>

    </section>


  </main>


  <div id="cart-overlay" class="cart-overlay"></div>


  <aside
    id="cart-panel"
    class="cart-panel"
    aria-label="Shopping cart"
  >

    <div class="cart-header">

      <div>
        <p class="eyebrow">YOUR SELECTION</p>
        <h2>Shopping Cart</h2>
      </div>

      <button
        id="close-cart"
        class="close-cart"
        type="button"
        aria-label="Close cart"
      >
        ×
      </button>

    </div>


    <div
      id="cart-items"
      class="cart-items"
    ></div>


    <div class="cart-footer">

      <div class="cart-total">

        <span>Subtotal</span>

        <strong>
          <span id="cart-total">
            ${money(0)}
          </span>
        </strong>

      </div>

      <p class="cart-footer-note">
        Delivery charges, if applicable, will be confirmed
        before fulfilment.
      </p>

      <button
        id="checkout-button"
        class="checkout-button"
        type="button"
      >
        Proceed to Checkout
      </button>

    </div>

  </aside>


  <footer class="site-footer">

    <div class="footer-grid">

      <div class="footer-brand">

        <img
          src="/images/aliya-logo.jpeg"
          alt="Aliya Cloth Store"
          class="footer-logo"
        >

        <p>
          Quality fabrics, traditional designs and trusted
          service from Jaipur.
        </p>

      </div>


      <div class="footer-column">

        <h3>Shop</h3>

        <a href="#products">All Products</a>
        <a href="#collections">Collections</a>
        <a href="#products">Cotton Suits</a>

      </div>


      <div class="footer-column">

        <h3>Information</h3>

        <a href="#about">Our Story</a>
        <a href="#contact">Contact</a>
        <span>Shipping Information</span>
        <span>Return & Exchange Policy</span>

      </div>


      <div class="footer-column">

        <h3>Customer Care</h3>

        <span>Cash on Delivery</span>
        <span>Order Assistance</span>
        <span>Jaipur, Rajasthan</span>

      </div>

    </div>


    <div class="footer-bottom">

      <p>
        © 2026 Aliya Cloth Store. All rights reserved.
      </p>

      <p>
        Weaving Tradition Into Style
      </p>

    </div>

  </footer>
`;


const searchInput =
  document.querySelector<HTMLInputElement>(
    "#searchInput"
  );

const headerSearchInput =
  document.querySelector<HTMLInputElement>(
    "#headerSearchInput"
  );

const printFilter =
  document.querySelector<HTMLSelectElement>(
    "#printFilter"
  );

const productGrid =
  document.querySelector<HTMLDivElement>(
    ".product-grid"
  );

const productResultCount =
  document.querySelector<HTMLParagraphElement>(
    "#product-result-count"
  );

const activeFilterLabel =
  document.querySelector<HTMLParagraphElement>(
    "#active-filter-label"
  );

const cartPanel =
  document.querySelector<HTMLElement>(
    "#cart-panel"
  );

const cartOverlay =
  document.querySelector<HTMLDivElement>(
    "#cart-overlay"
  );

const cartItems =
  document.querySelector<HTMLDivElement>(
    "#cart-items"
  );

const cartTotal =
  document.querySelector<HTMLSpanElement>(
    "#cart-total"
  );

const mobileMenu =
  document.querySelector<HTMLDivElement>(
    "#mobile-menu"
  );

const menuButton =
  document.querySelector<HTMLButtonElement>(
    "#menu-button"
  );

const headerSearch =
  document.querySelector<HTMLDivElement>(
    "#header-search"
  );


const updateProducts = () => {
  const visibleProducts = filteredProducts();

  if (productGrid) {
    productGrid.innerHTML =
      createProductCards(visibleProducts);
  }

  if (productResultCount) {
    productResultCount.textContent =
      `${visibleProducts.length} ${
        visibleProducts.length === 1
          ? "product"
          : "products"
      }`;
  }

  if (activeFilterLabel) {
    if (selectedCategory) {
      activeFilterLabel.textContent =
        selectedCategory;
    } else if (selectedPrint) {
      activeFilterLabel.textContent =
        `Print: ${selectedPrint}`;
    } else if (searchText.trim()) {
      activeFilterLabel.textContent =
        `Search: "${searchText.trim()}"`;
    } else {
      activeFilterLabel.textContent =
        "Showing all products";
    }
  }

  document
    .querySelectorAll(".collection-card")
    .forEach((card) => {
      const button =
        card as HTMLButtonElement;

      button.classList.toggle(
        "active-collection",
        button.dataset.category === selectedCategory
      );
    });
};


const updateCartCount = () => {
  const cartCount =
    document.querySelector<HTMLSpanElement>(
      "#cart-count"
    );

  const totalQuantity = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  if (cartCount) {
    cartCount.textContent =
      String(totalQuantity);
  }
};
updateCartCount();

const calculateTotal = () =>
  cart.reduce(
    (total, item) =>
      total +
      item.product.price * item.quantity,
    0
  );


const renderCart = () => {
  if (!cartItems || !cartTotal) {
    return;
  }

  if (cart.length === 0) {
    cartItems.innerHTML = `

      <div class="empty-cart">

        <div class="empty-cart-icon">
          🛍
        </div>

        <h3>Your cart is empty</h3>

        <p>
          Explore our collection and add something you love.
        </p>

        <button
          class="continue-shopping"
          type="button"
        >
          Continue Shopping
        </button>

      </div>
    `;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `

          <article class="cart-item">

            <img
              src="${item.product.image}"
              alt="${escapeHtml(item.product.name)}"
            >

            <div class="cart-item-info">

              <p class="cart-item-code">
                ${escapeHtml(item.product.code)}
              </p>

              <h3>
                ${escapeHtml(item.product.name)}
              </h3>

              <strong>
                ${money(
                  item.product.price *
                    item.quantity
                )}
              </strong>

              <div class="quantity-controls">

                <button
                  class="decrease-quantity"
                  data-id="${item.product.id}"
                  type="button"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>${item.quantity}</span>

                <button
                  class="increase-quantity"
                  data-id="${item.product.id}"
                  type="button"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

            </div>

            <button
              class="remove-cart-item"
              data-id="${item.product.id}"
              type="button"
              aria-label="Remove ${escapeHtml(item.product.name)}"
            >
              ×
            </button>

          </article>
        `
      )
      .join("");
  }

  cartTotal.textContent =
    money(calculateTotal());

  updateCartCount();
};


const openCart = () => {
  renderCart();

  cartPanel?.classList.add("open");
  cartOverlay?.classList.add("show");
  document.body.classList.add("cart-open");
};


const closeCart = () => {
  cartPanel?.classList.remove("open");
  cartOverlay?.classList.remove("show");
  document.body.classList.remove("cart-open");
};


const closeMobileMenu = () => {
  mobileMenu?.classList.remove("open");
  menuButton?.classList.remove("active");

  menuButton?.setAttribute(
    "aria-expanded",
    "false"
  );
};


const clearFilters = () => {
  searchText = "";
  selectedPrint = "";
  selectedCategory = "";

  if (searchInput) {
    searchInput.value = "";
  }

  if (headerSearchInput) {
    headerSearchInput.value = "";
  }

  if (printFilter) {
    printFilter.value = "";
  }

  updateProducts();
};


searchInput?.addEventListener("input", () => {
  searchText = searchInput.value;

  if (headerSearchInput) {
    headerSearchInput.value = searchText;
  }

  updateProducts();
});


headerSearchInput?.addEventListener(
  "input",
  () => {
    searchText = headerSearchInput.value;

    if (searchInput) {
      searchInput.value = searchText;
    }

    updateProducts();

    document
      .querySelector("#products")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }
);


printFilter?.addEventListener(
  "change",
  () => {
    selectedPrint = printFilter.value;
    updateProducts();
  }
);


document.addEventListener(
  "click",
  (event) => {
    const target =
      event.target as HTMLElement;


    const addButton =
      target.closest<HTMLButtonElement>(
        ".add-to-cart"
      );

    if (addButton) {
      const productId =
        Number(addButton.dataset.id);

      const product =
        products.find(
          (item) => item.id === productId
        );

      if (product && product.available) {
        const existingItem =
          cart.find(
            (item) =>
              item.product.id === product.id
          );

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            product,
            quantity: 1,
          });
        
        }
          saveCart();

        updateCartCount();

        const originalText =
          addButton.textContent;

        addButton.textContent =
          "Added to Cart ✓";

        addButton.classList.add("added");

        window.setTimeout(() => {
          addButton.textContent =
            originalText ?? "Add to Cart";

          addButton.classList.remove("added");
        }, 900);
      }

      return;
    }


    const collectionCard =
      target.closest<HTMLButtonElement>(
        ".collection-card"
      );

    if (collectionCard) {
      selectedCategory =
        collectionCard.dataset.category ?? "";

      updateProducts();

      document
        .querySelector("#products")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }


    if (
      target.closest("#clear-filters") ||
      target.closest(".reset-filters")
    ) {
      clearFilters();
      return;
    }


    if (target.closest("#cart-button")) {
      openCart();
      return;
    }


    if (
      target.closest("#close-cart") ||
      target === cartOverlay
    ) {
      closeCart();
      return;
    }


    if (
      target.closest(".continue-shopping")
    ) {
      closeCart();

      document
        .querySelector("#products")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }


    const increaseButton =
      target.closest<HTMLButtonElement>(
        ".increase-quantity"
      );

    if (increaseButton) {
      const productId =
        Number(increaseButton.dataset.id);

      const item =
        cart.find(
          (cartItem) =>
            cartItem.product.id === productId
        );

      if (item) {
        item.quantity += 1;
        renderCart();
      }

      return;
    }


    const decreaseButton =
      target.closest<HTMLButtonElement>(
        ".decrease-quantity"
      );

    if (decreaseButton) {
      const productId =
        Number(decreaseButton.dataset.id);

      const item =
        cart.find(
          (cartItem) =>
            cartItem.product.id === productId
        );

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          const index =
            cart.findIndex(
              (cartItem) =>
                cartItem.product.id ===
                productId
            );

          if (index !== -1) {
            cart.splice(index, 1);
          }
        }

        renderCart();
      }

      return;
    }


    const removeButton =
      target.closest<HTMLButtonElement>(
        ".remove-cart-item"
      );

    if (removeButton) {
      const productId =
        Number(removeButton.dataset.id);

      const index =
        cart.findIndex(
          (item) =>
            item.product.id === productId
        );

      if (index !== -1) {
        cart.splice(index, 1);
        renderCart();
      }

      return;
    }


    if (target.closest("#menu-button")) {
      const isOpen =
        mobileMenu?.classList.toggle("open");

      menuButton?.classList.toggle(
        "active",
        Boolean(isOpen)
      );

      menuButton?.setAttribute(
        "aria-expanded",
        String(Boolean(isOpen))
      );

      return;
    }


    if (target.closest(".mobile-menu a")) {
      closeMobileMenu();
      return;
    }


    if (
      target.closest("#header-search-button")
    ) {
      headerSearch?.classList.add("open");

      window.setTimeout(() => {
        headerSearchInput?.focus();
      }, 100);

      return;
    }


    if (
      target.closest("#close-header-search")
    ) {
      headerSearch?.classList.remove("open");
      return;
    }
  }
);
const checkoutButton =
  document.querySelector<HTMLButtonElement>(
    "#checkout-button"
  );

checkoutButton?.addEventListener(
  "click",
  () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    closeCart();

    document
      .querySelector(".checkout-section")
      ?.remove();

    const checkoutSection =
      document.createElement("section");

    checkoutSection.className =
      "checkout-section";

    checkoutSection.innerHTML = `

      <div class="checkout-container">

        <div class="checkout-header">

          <div>
            <p class="eyebrow">
              SECURE CHECKOUT
            </p>

            <h2>Complete Your Order</h2>
          </div>

          <button
            id="close-checkout"
            class="close-checkout"
            type="button"
            aria-label="Close checkout"
          >
            ×
          </button>

        </div>


        <div class="checkout-layout">

          <form
            id="checkout-form"
            class="checkout-form"
          >

            <h3>Delivery Information</h3>


            <label for="customer-name">
              Full Name
            </label>

            <input
              id="customer-name"
              type="text"
              required
              autocomplete="name"
              placeholder="Enter your full name"
            >


            <label for="customer-phone">
              Mobile Number
            </label>

            <input
              id="customer-phone"
              type="tel"
              required
              inputmode="numeric"
              pattern="[0-9]{10}"
              maxlength="10"
              autocomplete="tel"
              placeholder="Enter 10 digit mobile number"
            >


            <label for="customer-address">
              Delivery Address
            </label>

            <textarea
              id="customer-address"
              required
              autocomplete="street-address"
              placeholder="House number, street, area"
            ></textarea>


            <div class="checkout-row">

              <div>

                <label for="customer-city">
                  City
                </label>

                <input
                  id="customer-city"
                  type="text"
                  required
                  autocomplete="address-level2"
                  placeholder="City"
                >

              </div>


              <div>

                <label for="customer-pincode">
                  PIN Code
                </label>

                <input
                  id="customer-pincode"
                  type="text"
                  required
                  inputmode="numeric"
                  pattern="[0-9]{6}"
                  maxlength="6"
                  autocomplete="postal-code"
                  placeholder="6 digit PIN"
                >

              </div>

            </div>


            <h3 class="payment-heading">
              Payment Method
            </h3>


            <label class="payment-option">

              <input
                type="radio"
                name="payment"
                value="cod"
                checked
              >

              <span>
                <strong>
                  Cash on Delivery
                </strong>

                <small>
                  Pay when your order is delivered.
                </small>
              </span>

            </label>


            <button
              type="submit"
              class="place-order-button"
            >
              Place Order •
              ${money(calculateTotal())}
            </button>

          </form>


          <aside class="checkout-summary">

            <h3>Order Summary</h3>

            <div class="checkout-summary-items">

              ${cart
                .map(
                  (item) => `

                    <div class="checkout-item">

                      <img
                        src="${item.product.image}"
                        alt="${escapeHtml(
                          item.product.name
                        )}"
                      >

                      <div>

                        <span>
                          ${escapeHtml(
                            item.product.name
                          )}
                        </span>

                        <small>
                          Qty: ${item.quantity}
                        </small>

                      </div>

                      <strong>
                        ${money(
                          item.product.price *
                            item.quantity
                        )}
                      </strong>

                    </div>

                  `
                )
                .join("")}

            </div>


            <div class="checkout-total">

              <span>Total</span>

              <strong>
                ${money(calculateTotal())}
              </strong>

            </div>

          </aside>

        </div>

      </div>
    `;


    document.body.appendChild(
      checkoutSection
    );

    document.body.classList.add(
      "checkout-open"
    );


    document
      .querySelector("#close-checkout")
      ?.addEventListener(
        "click",
        () => {
          checkoutSection.remove();

          document.body.classList.remove(
            "checkout-open"
          );
        }
      );


    const checkoutForm =
      document.querySelector<HTMLFormElement>(
        "#checkout-form"
      );


    checkoutForm?.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();


        const submitButton =
          checkoutForm.querySelector<HTMLButtonElement>(
            ".place-order-button"
          );


        const customerName =
          document.querySelector<HTMLInputElement>(
            "#customer-name"
          )!.value.trim();


        const mobileNumber =
          document.querySelector<HTMLInputElement>(
            "#customer-phone"
          )!.value.trim();


        const deliveryAddress =
          document.querySelector<HTMLTextAreaElement>(
            "#customer-address"
          )!.value.trim();


        const city =
          document.querySelector<HTMLInputElement>(
            "#customer-city"
          )!.value.trim();


        const pinCode =
          document.querySelector<HTMLInputElement>(
            "#customer-pincode"
          )!.value.trim();


        const totalAmount =
          calculateTotal();


        const orderItems = cart.map(
          (item) => ({
            id: item.product.id,
            code: item.product.code,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })
        );


        if (submitButton) {
          submitButton.disabled = true;

          submitButton.textContent =
            "Placing Order...";
        }


        const { error } = await supabase
          .from("orders")
          .insert({
            customer_name: customerName,
            mobile_number: mobileNumber,
            delivery_address:
              deliveryAddress,
            city: city,
            pin_code: pinCode,
            payment_method: "cod",
            order_items: orderItems,
            total_amount: totalAmount,
          });


        if (error) {
          console.error(
            "Order error:",
            error
          );

          alert(
            "We could not place your order. Please try again."
          );


          if (submitButton) {
            submitButton.disabled = false;

            submitButton.textContent =
              `Place Order • ${money(
                calculateTotal()
              )}`;
          }

          return;
        }


        cart.length = 0;

        renderCart();


        checkoutSection.innerHTML = `

          <div class="order-success">

            <div class="success-icon">
              ✓
            </div>

            <p class="eyebrow">
              ORDER RECEIVED
            </p>

            <h2>
              Thank You for Your Order
            </h2>

            <p>
              Your order has been received by
              Aliya Cloth Store.
            </p>

            <p>
              Our team will process your order
              details for confirmation and
              fulfilment.
            </p>

            <button
              id="continue-after-order"
              class="primary-button"
              type="button"
            >
              Continue Shopping
            </button>

          </div>
        `;


        document
          .querySelector(
            "#continue-after-order"
          )
          ?.addEventListener(
            "click",
            () => {
              checkoutSection.remove();

              document.body.classList.remove(
                "checkout-open"
              );

              document
                .querySelector("#products")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }
          );
      }
    );
  }
);


updateProducts();
renderCart();