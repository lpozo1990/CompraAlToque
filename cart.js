// cart.js
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// Carga productos y renderiza
fetch("/assets/data/products.json")
  .then((res) => res.json())
  .then((products) => {
    const container = document.getElementById("product-list");
    container.innerHTML = products
      .map(
        (p) => `
      <div class="border p-4 flex flex-col">
        <img src="${p.image}" alt="${p.name}" class="h-32 object-cover mb-2">
        <h2 class="font-bold">${p.name}</h2>
        <p class="text-gray-700">$${p.price}</p>
        <button data-id="${p.id}" class="add-to-cart mt-auto bg-blue-500 text-white py-1 rounded">
          Añadir al carrito
        </button>
      </div>
    `
      )
      .join("");

    // Agregar manejadores
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prod = products.find((x) => x.id == btn.dataset.id);
        const item = cart.find((x) => x.id == prod.id);
        if (item) item.qty++;
        else cart.push({ ...prod, qty: 1 });
        localStorage.setItem("cart", JSON.stringify(cart));
        alert(
          `Producto agregado. Tienes ${cart.reduce(
            (a, b) => a + b.qty,
            0
          )} artículos en el carrito.`
        );
      });
    });
  });
