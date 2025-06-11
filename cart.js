// cart.js
(function () {
  window.cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let allProducts = []; // Almacenar todos los productos
  let filteredProducts = []; // Almacenar productos filtrados
  let typingTimer; // Timer para el autocompletado
  const doneTypingInterval = 300; // Tiempo en ms para esperar después de que el usuario deje de escribir

  // Sistema de notificaciones elegantes
  function showNotification(title, message, duration = 3000) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const notificationHTML = `
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
      <div class="notification-progress"></div>
    `;
    
    notification.innerHTML = notificationHTML;
    container.appendChild(notification);
    
    // Animar barra de progreso
    const progress = notification.querySelector('.notification-progress');
    
    // Mostrar la notificación después de un pequeño delay
    setTimeout(() => {
      notification.classList.add('show');
      
      // Animar la barra de progreso
      progress.style.transition = `transform ${duration/1000}s linear`;
      progress.style.transform = 'scaleX(0)';
    }, 10);
    
    // Eliminar la notificación después del tiempo especificado
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300); // Esperar a que termine la transición
    }, duration);
  }

  function updateCartCount() {
    const countElem = document.getElementById("cart-count");
    if (!countElem) return;
    countElem.textContent = window.cart.reduce((sum, i) => sum + i.qty, 0);
  }
  
  // Actualizar el mini-carrito
  function updateMiniCart() {
    const itemsContainer = document.getElementById("mini-cart-items");
    const emptyMessage = document.getElementById("mini-cart-empty");
    const totalElement = document.getElementById("mini-cart-total");
    const checkoutButton = document.getElementById("checkout-mini-btn");
    
    if (!itemsContainer || !emptyMessage || !totalElement || !checkoutButton) return;
    
    if (window.cart.length === 0) {
      itemsContainer.innerHTML = '';
      emptyMessage.classList.remove('hidden');
      checkoutButton.classList.add('opacity-50', 'cursor-not-allowed');
      checkoutButton.setAttribute('disabled', 'true');
      totalElement.textContent = '$0.00';
      return;
    }
    
    // Ocultar mensaje de vacío y activar botón de checkout
    emptyMessage.classList.add('hidden');
    checkoutButton.classList.remove('opacity-50', 'cursor-not-allowed');
    checkoutButton.removeAttribute('disabled');
    
    // Calcular total
    const total = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Renderizar items
    itemsContainer.innerHTML = window.cart.map(item => `
      <div class="mini-cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="mini-cart-image">
        <div class="mini-cart-details">
          <div class="mini-cart-name">${item.name}</div>
          <div class="mini-cart-price">$${item.price} × ${item.qty}</div>
        </div>
        <button class="mini-cart-remove text-gray-400 hover:text-red-500 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `).join('');
    
    // Agregar eventos para eliminar productos
    document.querySelectorAll('.mini-cart-remove').forEach(btn => {
      btn.addEventListener('click', function() {
        const itemId = parseInt(this.closest('.mini-cart-item').dataset.id);
        window.cart = window.cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(window.cart));
        updateMiniCart();
        updateCartCount();
        
        // Si estamos en la página de checkout, actualizar también esos elementos
        if (document.getElementById('cart-items')) {
          renderCartItems();
          updateCartSummary();
        }
        
        showNotification('Producto eliminado', 'Se ha eliminado el producto de tu carrito.');
      });
    });
  }

  // Renderiza los productos en la página
  function renderProducts(products) {
    const container = document.getElementById("product-list");
    const noResults = document.getElementById("no-results");

    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = "";
      noResults.classList.remove("hidden");
      return;
    }

    noResults.classList.add("hidden");
    container.innerHTML = products
      .map(
        (p) => `
        <div class="border bg-white p-4 flex flex-col hover:shadow-lg transition">
          <img src="${p.image}" alt="${p.name}" class="h-40 object-cover mb-2 rounded"/>
          <h3 class="font-semibold text-lg mb-1">${p.name}</h3>
          <p class="text-orange-600 font-bold mb-2">$${p.price}</p>
          <div class="flex items-center mt-auto mb-2">
            <span class="mr-2">Cantidad:</span>
            <div class="flex border rounded">
              <button class="quantity-btn decrease px-2 py-1 bg-gray-100 hover:bg-gray-200" data-id="${p.id}">-</button>
              <input type="number" class="quantity-input w-12 text-center border-x" value="1" min="1" max="99" data-id="${p.id}">
              <button class="quantity-btn increase px-2 py-1 bg-gray-100 hover:bg-gray-200" data-id="${p.id}">+</button>
            </div>
          </div>
          <button
            data-id="${p.id}"
            class="add-to-cart bg-orange-500 text-white py-1 rounded hover:bg-orange-600 transition"
          >
            Añadir al carrito
          </button>
        </div>
      `
      )
      .join("");

    // Agregar eventos a los botones de añadir al carrito y a los selectores de cantidad
    attachAddToCartEvents();
    attachQuantityEvents();
  }

  // Adjunta los eventos de clic a los botones de añadir al carrito
  function attachAddToCartEvents() {
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prod = allProducts.find((x) => x.id == btn.dataset.id);
        if (!prod) return;

        // Obtener la cantidad seleccionada
        const quantityInput = document.querySelector(
          `.quantity-input[data-id="${btn.dataset.id}"]`
        );
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

        const item = window.cart.find((x) => x.id === prod.id);
        if (item) item.qty += quantity;
        else window.cart.push({ ...prod, qty: quantity });

        localStorage.setItem("cart", JSON.stringify(window.cart));
        updateCartCount();
        updateMiniCart();
        
        // Usar la notificación elegante en lugar de alert
        const totalItems = window.cart.reduce((a, b) => a + b.qty, 0);
        showNotification(
          '¡Producto añadido!',
          `${quantity} × ${prod.name} añadido al carrito.<br>Total en carrito: ${totalItems} items.`
        );
      });
    });
  }

  // Adjunta los eventos a los botones de incremento/decremento de cantidad
  function attachQuantityEvents() {
    // Manejar clicks en los botones + y -
    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.id;
        const input = document.querySelector(
          `.quantity-input[data-id="${productId}"]`
        );

        if (!input) return;

        let value = parseInt(input.value) || 1;

        if (btn.classList.contains("decrease")) {
          value = Math.max(1, value - 1);
        } else if (btn.classList.contains("increase")) {
          value = Math.min(99, value + 1);
        }

        input.value = value;
      });
    });

    // Validar entrada manual en el input
    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", () => {
        let value = parseInt(input.value) || 1;
        value = Math.max(1, Math.min(99, value));
        input.value = value;
      });
    });
  }

  // Aplicar filtros a los productos - Simplificado para ordenar solo por precio
  function applyFilters() {
    // Obtener valores de los filtros
    const searchText =
      document.getElementById("search-input")?.value.toLowerCase() || "";
    const sortBy = document.getElementById("sort-by")?.value || "default";

    // Filtrar por texto de búsqueda
    filteredProducts = allProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText)
      );
    });

    // Ordenar productos por precio
    if (sortBy !== "default") {
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          default:
            return 0;
        }
      });
    }

    // Mostrar productos filtrados
    renderProducts(filteredProducts);
  }

  // Gestión del autocompletado
  function showSuggestions() {
    const searchInput = document.getElementById("search-input");
    const suggestionsContainer = document.getElementById("search-suggestions");

    if (!searchInput || !suggestionsContainer) return;

    const searchText = searchInput.value.toLowerCase().trim();

    // Si el texto de búsqueda está vacío, ocultar las sugerencias
    if (!searchText) {
      suggestionsContainer.classList.add("hidden");
      return;
    }

    // Filtrar productos que coincidan con el texto de búsqueda
    const suggestions = allProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchText) ||
          product.description.toLowerCase().includes(searchText)
      )
      .slice(0, 5); // Limitar a 5 sugerencias

    // Si no hay sugerencias, ocultar el contenedor
    if (suggestions.length === 0) {
      suggestionsContainer.classList.add("hidden");
      return;
    }

    // Construir HTML para las sugerencias
    suggestionsContainer.innerHTML = suggestions
      .map(
        (product) => `
      <div class="suggestion-item p-2 hover:bg-gray-100 cursor-pointer flex items-center">
        <img src="${product.image}" alt="${product.name}" class="h-10 w-10 object-cover mr-2 rounded">
        <div>
          <div class="font-medium">${product.name}</div>
          <div class="text-sm text-gray-500">$${product.price}</div>
        </div>
      </div>
    `
      )
      .join("");

    // Mostrar el contenedor de sugerencias
    suggestionsContainer.classList.remove("hidden");

    // Agregar eventos de clic a las sugerencias
    document.querySelectorAll(".suggestion-item").forEach((item, index) => {
      item.addEventListener("click", () => {
        searchInput.value = suggestions[index].name;
        suggestionsContainer.classList.add("hidden");
        applyFilters();
      });
    });
  }

  // Cerrar sugerencias al hacer clic fuera
  document.addEventListener("click", (event) => {
    const suggestionsContainer = document.getElementById("search-suggestions");
    const searchInput = document.getElementById("search-input");

    if (suggestionsContainer && searchInput) {
      if (
        !searchInput.contains(event.target) &&
        !suggestionsContainer.contains(event.target)
      ) {
        suggestionsContainer.classList.add("hidden");
      }
    }
  });

  // Carga y renderiza el catálogo desde products.json
  fetch("assets/data/products.json")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo cargar products.json");
      return res.json();
    })
    .then((products) => {
      allProducts = products;
      filteredProducts = products;
      renderProducts(products);
      updateCartCount();
      updateMiniCart(); // Inicializar mini-carrito

      // Configurar eventos para búsqueda y filtros
      setupFilterEvents();
    })
    .catch((err) => console.error(err));

  function setupFilterEvents() {
    // Evento para el botón de búsqueda
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");

    if (searchBtn) {
      searchBtn.addEventListener("click", applyFilters);
    }

    if (searchInput) {
      // Manejar el evento keypress para Enter
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          applyFilters();
        }
      });

      // Evento para autocompletado al escribir
      searchInput.addEventListener("input", () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(showSuggestions, doneTypingInterval);
      });

      // Limpiar el temporizador cuando el usuario presiona una tecla
      searchInput.addEventListener("keydown", () => {
        clearTimeout(typingTimer);
      });
    }

    // Eventos para cambios en el orden - Ahora se aplica automáticamente
    const sortSelect = document.getElementById("sort-by");
    if (sortSelect) {
      sortSelect.addEventListener("change", applyFilters);
    }
  }
})();
