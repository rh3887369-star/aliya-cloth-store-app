import "./style.css";
import { getProducts} from "./product";

const products = await getProducts();

const params = new URLSearchParams(window.location.search);

const productId = Number(params.get("id"));

const product =
  products.find((item) => item.id === productId) ??
  products[0];

if (!product) {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <section class="product-not-found">
      <h1>Product not found</h1>

      <a href="/">
        Back to Home
      </a>
    </section>
  `;

  throw new Error("Product not found.");
}

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

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div class="product-details-page">

<header class="details-header">

<a href="/">
← Back to Home
</a>

</header>

<div class="details-layout">

<div class="details-gallery">

<img
id="main-product-image"
class="details-main-image"
src="${product.image}"
alt="${escapeHtml(product.name)}"
/>

<div
id="gallery-thumbnails"
class="gallery-thumbnails"
>

</div>

</div>

<div class="details-content">

<p class="details-category">

${escapeHtml(product.category)}

</p>

<h1>

${escapeHtml(product.name)}

</h1>

<p class="details-code">

Code :
${escapeHtml(product.code)}

</p>

<div class="details-price">

${money(product.price)}

</div>

<p class="details-description">

${escapeHtml(product.description)}

</p>

<div class="details-meta">

<div>

<strong>Colour</strong>

<p>

${escapeHtml(product.color)}

</p>

</div>

<div>

<strong>Print</strong>

<p>

${escapeHtml(product.print)}

</p>

</div>

<div>

<strong>Stock</strong>

<p>

${
  product.available
    ? "In Stock"
    : "Sold Out"
}

</p>

</div>

</div>

<div class="details-buttons">

<button
class="details-cart-button"
>

Add to Cart

</button>

<button
class="details-buy-button"
>

Buy Now

</button>

</div>

</div>

</div>

<section
id="related-products"
class="related-products"
>

</section>

</div>
`;
// =========================
// PRODUCT GALLERY
// =========================

import { supabase } from "./supabase";

const { data: galleryImages } = await supabase
  .from("product_images")
  .select("*")
  .eq("product_id", product.id)
  .order("sort_order", { ascending: true });

const thumbnails =
  document.querySelector<HTMLDivElement>(
    "#gallery-thumbnails"
  );

const mainImage =
  document.querySelector<HTMLImageElement>(
    "#main-product-image"
  );

const allImages = [
  product.image,
  ...(galleryImages?.map((img) => img.image_url) ?? []),
];

if (thumbnails) {
  thumbnails.innerHTML = allImages
    .map(
      (image, index) => `
      <img
        src="${image}"
        class="gallery-thumb ${
          index === 0 ? "active-thumb" : ""
        }"
        data-image="${image}"
      >
    `
    )
    .join("");
}

document
  .querySelectorAll<HTMLImageElement>(
    ".gallery-thumb"
  )
  .forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (mainImage) {
        mainImage.src =
          thumb.dataset.image ?? "";
      }

      document
        .querySelectorAll(".gallery-thumb")
        .forEach((item) =>
          item.classList.remove(
            "active-thumb"
          )
        );

      thumb.classList.add("active-thumb");
    });
  });



// =========================
// EXTRA PRODUCT DETAILS
// =========================

const detailsContent =
  document.querySelector(".details-content");

if (detailsContent) {
  detailsContent.insertAdjacentHTML(
    "beforeend",
    `

<hr class="details-divider">

<div class="extra-details">

<h2>Product Details</h2>

<div class="detail-row">
<strong>Fabric</strong>
<span>${product.fabric ?? "-"}</span>
</div>

<div class="detail-row">
<strong>Top Length</strong>
<span>${product.top_length ?? "-"}</span>
</div>

<div class="detail-row">
<strong>Bottom Length</strong>
<span>${product.bottom_length ?? "-"}</span>
</div>

<div class="detail-row">
<strong>Dupatta Length</strong>
<span>${product.dupatta_length ?? "-"}</span>
</div>

<div class="detail-row">
<strong>Season</strong>
<span>${product.season ?? "-"}</span>
</div>

<div class="detail-row">
<strong>Transparency</strong>
<span>${product.transparency ?? "-"}</span>
</div>

<div class="detail-row">
<strong>Brand</strong>
<span>${product.brand ?? "-"}</span>
</div>

<div class="detail-row">
<strong>Availability</strong>
<span>${product.stock_label ?? "In Stock"}</span>
</div>

</div>

`
  );
}
// ===============================
// RELATED PRODUCTS
// ===============================

const relatedProducts = products
  .filter((item) => item.id !== product.id)
  .slice(0, 4);

const relatedSection =
  document.querySelector<HTMLDivElement>(
    "#related-products"
  );

if (relatedSection) {
  relatedSection.innerHTML = `
    <h2 class="related-title">
      You May Also Like
    </h2>

    <div class="related-grid">

      ${relatedProducts
        .map(
          (item) => `
          <article class="related-card">

            <a href="/product-details.html?id=${item.id}">

              <img
                src="${item.image}"
                alt="${escapeHtml(item.name)}"
              >

              <h3>
                ${escapeHtml(item.name)}
              </h3>

              <p class="related-price">
                ${money(item.price)}
              </p>

            </a>

          </article>
        `
        )
        .join("")}

    </div>
  `;
}



// ===============================
// IMAGE ZOOM
// ===============================

mainImage?.addEventListener(
  "mousemove",
  (event) => {

    const rect =
      mainImage.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    mainImage.style.transformOrigin =
      `${x}% ${y}%`;

    mainImage.style.transform =
      "scale(1.1)";
  }
);

mainImage?.addEventListener(
  "mouseleave",
  () => {

    mainImage.style.transform =
      "scale(1)";

    mainImage.style.transformOrigin =
      "center";
  }
);



// ===============================
// ADD TO CART
// ===============================

document
  .querySelector(".details-cart-button")
  ?.addEventListener(
    "click",
    () => {

      const cart = JSON.parse(
        localStorage.getItem(
          "aliya-cart"
        ) ?? "[]"
      );

      const existing =
        cart.find(
          (item: any) =>
            item.product.id === product.id
        );

      if (existing) {
        existing.quantity++;
      } else {
        cart.push({
          product,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "aliya-cart",
        JSON.stringify(cart)
      );

      alert(
        "Product added to cart."
      );

    }
  );




// ===============================
// BUY NOW
// ===============================

document
  .querySelector(".details-buy-button")
  ?.addEventListener(
    "click",
    () => {

      const cart = [
        {
          product,
          quantity: 1,
        },
      ];

      localStorage.setItem(
        "aliya-cart",
        JSON.stringify(cart)
      );

      window.location.href =
        "/#products";
    }
  );
