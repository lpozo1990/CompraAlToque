// cart.js
(function () {
  window.cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Actualiza el contador rojo del carrito
  function updateCartCount() {
    const count = window.cart.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById("cart-count").textContent = count;
  }

  // Carga y renderiza productos
  fetch("assets/data/products.json") // ← ruta relativa, sin "/" inicial
    .then((res) => res.json())
    .then((products) => {
      const container = document.getElementById("product-list");
      container.innerHTML = products
        .map(
          (p) => `
          <div class="border bg-white p-4 flex flex-col hover:shadow-lg transition">
            <img src="assets/img/${p.image.split("/").pop()}" alt="${
            p.name
          }" class="h-40 object-cover mb-2 rounded"/>
            <h3 class="font-semibold text-lg mb-1">${p.name}</h3>
            <p class="text-orange-600 font-bold mb-2">$${p.price}</p>
            <button
              data-id="${p.id}"
              class="add-to-cart mt-auto bg-orange-500 text-white py-1 rounded hover:bg-orange-600 transition"
            >
              Añadir al carrito
            </button>
          </div>
        `
        )
        .join("");

      // Añade evento a cada botón
      document.querySelectorAll(".add-to-cart").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prod = products.find((x) => x.id == btn.dataset.id);
          const item = window.cart.find((x) => x.id === prod.id);
          if (item) item.qty++;
          else window.cart.push({ ...prod, qty: 1 });
          localStorage.setItem("cart", JSON.stringify(window.cart));
          updateCartCount();
          alert(
            `Agregado: ${prod.name}. Total en carrito: ${window.cart.reduce(
              (a, b) => a + b.qty,
              0
            )} items.`
          );
        });
      });

      updateCartCount();
    });
})();
