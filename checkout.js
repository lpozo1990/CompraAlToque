// checkout.js
document.addEventListener("DOMContentLoaded", function() {
  // Recuperar carrito del almacenamiento local
  window.cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Actualizar contador de items en carrito
  function updateCartCount() {
    const countElem = document.getElementById("cart-count");
    if (!countElem) return;
    countElem.textContent = window.cart.reduce((sum, i) => sum + i.qty, 0);
  }
  updateCartCount();
  
  // Detectar si el carrito está vacío para mostrar mensaje apropiado 
  // al hacer clic en el ícono del carrito
  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) {
    cartIcon.addEventListener("click", function(e) {
      if (window.cart.length === 0 && !window.location.href.includes("checkout.html")) {
        e.preventDefault();
        alert("Tu carrito está vacío. Agrega productos antes de continuar.");
      }
    });
  }
  
  // Agregar funcionalidad al botón "Vaciar carrito"
  const clearCartButton = document.getElementById("clear-cart");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", function() {
      if (window.cart.length === 0) {
        alert("Tu carrito ya está vacío.");
        return;
      }
      
      if (confirm("¿Estás seguro de que quieres vaciar tu carrito?")) {
        window.cart = [];
        localStorage.setItem("cart", JSON.stringify(window.cart));
        renderCartItems();
        updateCartSummary();
        updateCartCount();
        alert("Tu carrito ha sido vaciado.");
      }
    });
  }
  
  // Si estamos en la página de checkout, mostrar los items del carrito
  if (document.getElementById('cart-items')) {
    renderCartItems();
    updateCartSummary();
  }
  
  // Botón para finalizar compra en index.html
  const checkoutButton = document.getElementById("checkout-btn");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (!window.cart.length) {
        return alert("Tu carrito está vacío.");
      }
      window.location.href = "checkout.html";
    });
  }
  
  // Manejo del formulario de checkout
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    // Mostrar/ocultar dirección según método de entrega
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    const addressContainer = document.getElementById('address-container');
    
    deliveryRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'delivery') {
          addressContainer.classList.remove('hidden');
          document.getElementById('address').setAttribute('required', '');
        } else {
          addressContainer.classList.add('hidden');
          document.getElementById('address').removeAttribute('required');
        }
        updateCartSummary(); // Actualizar el total con/sin gastos de envío
      });
    });
    
    // Manejar envío del formulario
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validar que el carrito no esté vacío
      if (!window.cart.length) {
        alert("Tu carrito está vacío. Agrega productos antes de continuar.");
        return;
      }
      
      // Recopilar datos del formulario
      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        deliveryMethod: document.querySelector('input[name="delivery"]:checked').value,
        notes: document.getElementById('notes').value
      };
      
      // Agregar dirección si es envío a domicilio
      if (formData.deliveryMethod === 'delivery') {
        formData.address = document.getElementById('address').value;
      }
      
      // Guardar datos del cliente en localStorage para futuros pedidos
      localStorage.setItem('customerData', JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      }));
      
      // Preparar texto para WhatsApp
      const lines = window.cart.map(
        (i) => `- ${i.name} ×${i.qty} ($${i.price * i.qty})`
      );
      const subtotal = window.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      const shipping = formData.deliveryMethod === 'delivery' ? 50 : 0;
      const total = subtotal + shipping;
      
      let text = `Hola, quiero realizar este pedido:\n\n`;
      text += `${lines.join("\n")}\n\n`;
      text += `Subtotal: $${subtotal}\n`;
      if (shipping > 0) {
        text += `Envío: $${shipping}\n`;
      }
      text += `Total: $${total}\n\n`;
      text += `Datos del cliente:\n`;
      text += `Nombre: ${formData.name}\n`;
      text += `Teléfono: ${formData.phone}\n`;
      text += `Email: ${formData.email}\n`;
      text += `Método de entrega: ${formData.deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}\n`;
      
      if (formData.address) {
        text += `Dirección: ${formData.address}\n`;
      }
      
      if (formData.notes) {
        text += `\nNotas adicionales:\n${formData.notes}\n`;
      }
      
      // Enviar a WhatsApp (número actualizado)
      const whatsappNumber = "58766375"; // Número actualizado
      window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    });
    
    // Prellenar datos del cliente si existen en localStorage
    const savedCustomerData = JSON.parse(localStorage.getItem('customerData') || 'null');
    if (savedCustomerData) {
      document.getElementById('name').value = savedCustomerData.name || '';
      document.getElementById('phone').value = savedCustomerData.phone || '';
      document.getElementById('email').value = savedCustomerData.email || '';
    }
  }
  
  // Función para renderizar los items del carrito
  function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    if (window.cart.length === 0) {
      container.innerHTML = '<p class="py-4 text-center text-gray-500">Tu carrito está vacío</p>';
      return;
    }
    
    container.innerHTML = window.cart.map(item => `
      <div class="py-4 flex justify-between items-center" data-id="${item.id}">
        <div class="flex items-center">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
          <div>
            <h3 class="font-medium">${item.name}</h3>
            <p class="text-gray-500">$${item.price} x ${item.qty}</p>
          </div>
        </div>
        <div class="flex items-center">
          <span class="font-medium mr-4">$${(item.price * item.qty).toFixed(2)}</span>
          <button class="remove-item text-gray-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `).join('');
    
    // Añadir funcionalidad para eliminar items
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const itemId = this.closest('[data-id]').dataset.id;
        window.cart = window.cart.filter(item => item.id != itemId);
        localStorage.setItem('cart', JSON.stringify(window.cart));
        renderCartItems();
        updateCartSummary();
        updateCartCount();
      });
    });
  }
  
  // Actualizar resumen del carrito
  function updateCartSummary() {
    // Calcular subtotal
    const subtotal = window.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    
    // Determinar costo de envío
    const deliveryMethod = document.querySelector('input[name="delivery"]:checked')?.value;
    const shipping = deliveryMethod === 'delivery' ? 50 : 0;
    
    // Calcular total
    const total = subtotal + shipping;
    
    // Actualizar elementos en la página
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    if (cartTotalElement) cartTotalElement.textContent = `$${subtotal.toFixed(2)}`;
  }
});
