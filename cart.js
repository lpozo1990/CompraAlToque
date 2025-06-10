// cart.js
(function () {
  window.cart = JSON.parse(localStorage.getItem("cart") || "[]");

  function updateCartCount() {
    const countElem = document.getElementById("cart-count");
    if (!countElem) return;
    countElem.textContent = window.cart.reduce((sum, i) => sum + i.qty, 0);
  }

  // Carga y renderiza el catálogo desde products.json en la raíz
  fetch("products.json")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo cargar products.json");
      return res.json();
    })
    .then((products) => {
      const container = document.getElementById("product-list");
      if (!container) return;

      container.innerHTML = products
        .map(
          (p) => `
          <div class="border bg-white p-4 flex flex-col hover:shadow-lg transition">
            <img src="${p.image}" alt="${p.name}" class="h-40 object-cover mb-2 rounded"/>
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

      document.querySelectorAll(".add-to-cart").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prod = products.find((x) => x.id == btn.dataset.id);
          if (!prod) return;
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
    })
    .catch((err) => console.error(err));
})();
