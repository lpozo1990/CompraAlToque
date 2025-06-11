// cart.js
(function () {
  window.cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let allProducts = []; // Almacenar todos los productos
  let filteredProducts = []; // Almacenar productos filtrados
  let typingTimer; // Timer para el autocompletado
  const doneTypingInterval = 300; // Tiempo en ms para esperar después de que el usuario deje de escribir

  function updateCartCount() {
    const countElem = document.getElementById("cart-count");
    if (!countElem) return;
    countElem.textContent = window.cart.reduce((sum, i) => sum + i.qty, 0);
  }

  // Renderiza los productos en la página
  function renderProducts(products) {
    const container = document.getElementById("product-list");
    const noResults = document.getElementById("no-results");
    
    if (!container) return;
    
    if (products.length === 0) {
      container.innerHTML = '';
      noResults.classList.remove('hidden');
      return;
    }
    
    noResults.classList.add('hidden');
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

    // Agregar eventos a los botones de añadir al carrito
    attachAddToCartEvents();
  }

  // Adjunta los eventos de clic a los botones de añadir al carrito
  function attachAddToCartEvents() {
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prod = allProducts.find((x) => x.id == btn.dataset.id);
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
  }

  // Aplicar filtros a los productos - Simplificado para ordenar solo por precio
  function applyFilters() {
    // Obtener valores de los filtros
    const searchText = document.getElementById('search-input')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sort-by')?.value || 'default';
    
    // Filtrar por texto de búsqueda
    filteredProducts = allProducts.filter(product => {
      return product.name.toLowerCase().includes(searchText) || 
             product.description.toLowerCase().includes(searchText);
    });
    
    // Ordenar productos por precio
    if (sortBy !== 'default') {
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
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
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (!searchInput || !suggestionsContainer) return;
    
    const searchText = searchInput.value.toLowerCase().trim();
    
    // Si el texto de búsqueda está vacío, ocultar las sugerencias
    if (!searchText) {
      suggestionsContainer.classList.add('hidden');
      return;
    }
    
    // Filtrar productos que coincidan con el texto de búsqueda
    const suggestions = allProducts
      .filter(product => 
        product.name.toLowerCase().includes(searchText) || 
        product.description.toLowerCase().includes(searchText)
      )
      .slice(0, 5); // Limitar a 5 sugerencias
    
    // Si no hay sugerencias, ocultar el contenedor
    if (suggestions.length === 0) {
      suggestionsContainer.classList.add('hidden');
      return;
    }
    
    // Construir HTML para las sugerencias
    suggestionsContainer.innerHTML = suggestions.map(product => `
      <div class="suggestion-item p-2 hover:bg-gray-100 cursor-pointer flex items-center">
        <img src="${product.image}" alt="${product.name}" class="h-10 w-10 object-cover mr-2 rounded">
        <div>
          <div class="font-medium">${product.name}</div>
          <div class="text-sm text-gray-500">$${product.price}</div>
        </div>
      </div>
    `).join('');
    
    // Mostrar el contenedor de sugerencias
    suggestionsContainer.classList.remove('hidden');
    
    // Agregar eventos de clic a las sugerencias
    document.querySelectorAll('.suggestion-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        searchInput.value = suggestions[index].name;
        suggestionsContainer.classList.add('hidden');
        applyFilters();
      });
    });
  }

  // Cerrar sugerencias al hacer clic fuera
  document.addEventListener('click', (event) => {
    const suggestionsContainer = document.getElementById('search-suggestions');
    const searchInput = document.getElementById('search-input');
    
    if (suggestionsContainer && searchInput) {
      if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        suggestionsContainer.classList.add('hidden');
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
      
      // Configurar eventos para búsqueda y filtros
      setupFilterEvents();
    })
    .catch((err) => console.error(err));
    
  function setupFilterEvents() {
    // Evento para el botón de búsqueda
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn) {
      searchBtn.addEventListener('click', applyFilters);
    }
    
    if (searchInput) {
      // Manejar el evento keypress para Enter
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          applyFilters();
        }
      });
      
      // Evento para autocompletado al escribir
      searchInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(showSuggestions, doneTypingInterval);
      });
      
      // Limpiar el temporizador cuando el usuario presiona una tecla
      searchInput.addEventListener('keydown', () => {
        clearTimeout(typingTimer);
      });
    }
    
    // Eventos para cambios en el orden - Ahora se aplica automáticamente
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilters);
    }
  }
})();
