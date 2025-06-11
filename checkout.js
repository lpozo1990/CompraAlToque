// checkout.js
document.addEventListener("DOMContentLoaded", function () {
  // Recuperar carrito del almacenamiento local
  window.cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Sistema de notificaciones elegantes para checkout
  function showNotification(title, message, duration = 3000) {
    const container = document.getElementById("notifications-container");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = "notification";

    const notificationHTML = `
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
      <div class="notification-progress"></div>
    `;

    notification.innerHTML = notificationHTML;
    container.appendChild(notification);

    // Animar barra de progreso
    const progress = notification.querySelector(".notification-progress");

    // Mostrar la notificación después de un pequeño delay
    setTimeout(() => {
      notification.classList.add("show");

      // Animar la barra de progreso
      progress.style.transition = `transform ${duration / 1000}s linear`;
      progress.style.transform = "scaleX(0)";
    }, 10);

    // Eliminar la notificación después del tiempo especificado
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300); // Esperar a que termine la transición
    }, duration);
  }

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
    cartIcon.addEventListener("click", function (e) {
      if (
        window.cart.length === 0 &&
        !window.location.href.includes("checkout.html")
      ) {
        e.preventDefault();
        showNotification(
          "Carrito vacío",
          "Tu carrito está vacío. Agrega productos antes de continuar."
        );
      }
    });
  }

  // Agregar funcionalidad al botón "Vaciar carrito"
  const clearCartButton = document.getElementById("clear-cart");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
      if (window.cart.length === 0) {
        showNotification("Carrito vacío", "Tu carrito ya está vacío.");
        return;
      }

      if (confirm("¿Estás seguro de que quieres vaciar tu carrito?")) {
        window.cart = [];
        localStorage.setItem("cart", JSON.stringify(window.cart));
        renderCartItems();
        updateCartSummary();
        updateCartCount();
        showNotification(
          "Carrito vaciado",
          "Tu carrito ha sido vaciado correctamente."
        );
      }
    });
  }

  // Si estamos en la página de checkout, mostrar los items del carrito
  if (document.getElementById("cart-items")) {
    renderCartItems();
    updateCartSummary();
  }

  // Botón para finalizar compra en index.html
  const checkoutButton = document.getElementById("checkout-btn");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (!window.cart.length) {
        return showNotification("Carrito vacío", "Tu carrito está vacío.");
      }
      window.location.href = "checkout.html";
    });
  }

  // Gestión del modal de confirmación
  const confirmationModal = document.getElementById("confirmation-modal");
  const confirmButton = document.getElementById("confirm-order");
  const cancelButton = document.getElementById("cancel-order");
  let whatsappURL = "";

  // Cerrar modal al hacer clic en Cancelar
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      confirmationModal.classList.remove("active");
    });
  }

  // Continuar a WhatsApp al hacer clic en Confirmar
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      if (whatsappURL) {
        window.location.href = whatsappURL;
      }
    });
  }

  // También cerrar modal al hacer clic fuera
  if (confirmationModal) {
    confirmationModal.addEventListener("click", function (e) {
      if (e.target === this) {
        confirmationModal.classList.remove("active");
      }
    });
  }

  // Función para mostrar el modal de confirmación con los datos del pedido
  function showConfirmationModal(formData, orderSummary) {
    if (!confirmationModal) return;

    const itemsContainer = document.getElementById("confirmation-items");
    const subtotalElement = document.getElementById("confirmation-subtotal");
    const shippingContainer = document.getElementById(
      "confirmation-shipping-container"
    );
    const shippingElement = document.getElementById("confirmation-shipping");
    const totalElement = document.getElementById("confirmation-total");
    const customerDataElement = document.getElementById(
      "confirmation-customer-data"
    );

    // Mostrar items del carrito
    itemsContainer.innerHTML = window.cart
      .map(
        (item) => `
      <div class="flex justify-between">
        <span>${item.name} × ${item.qty}</span>
        <span>$${(item.price * item.qty).toFixed(2)}</span>
      </div>
    `
      )
      .join("");

    // Mostrar costos
    subtotalElement.textContent = `$${orderSummary.subtotal.toFixed(2)}`;

    if (orderSummary.shipping > 0) {
      shippingContainer.classList.remove("hidden");
      shippingElement.textContent = `$${orderSummary.shipping.toFixed(2)}`;
    } else {
      shippingContainer.classList.add("hidden");
    }

    totalElement.textContent = `$${orderSummary.total.toFixed(2)}`;

    // Mostrar datos del cliente
    let customerHTML = `
      <div><strong>Nombre:</strong> ${formData.name}</div>
      <div><strong>Teléfono:</strong> ${formData.phone}</div>
      <div><strong>Método de entrega:</strong> ${
        formData.deliveryMethod === "pickup"
          ? "Recoger en tienda"
          : "Envío a domicilio"
      }</div>
    `;

    if (formData.address) {
      customerHTML += `<div><strong>Dirección:</strong> ${formData.address}</div>`;
    }

    if (formData.notes) {
      customerHTML += `<div class="mt-2"><strong>Notas adicionales:</strong><br>${formData.notes}</div>`;
    }

    customerDataElement.innerHTML = customerHTML;

    // Mostrar el modal
    confirmationModal.classList.add("active");
  }

  // Manejo del formulario de checkout
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    console.log("Formulario de checkout encontrado:", checkoutForm);

    // Mostrar/ocultar dirección según método de entrega
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    const addressContainer = document.getElementById("address-container");

    deliveryRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "delivery") {
          addressContainer.classList.remove("hidden");
          document.getElementById("address").setAttribute("required", "");
        } else {
          addressContainer.classList.add("hidden");
          document.getElementById("address").removeAttribute("required");
        }
        updateCartSummary(); // Actualizar el total con/sin gastos de envío
      });
    });

    // Manejar envío del formulario
    checkoutForm.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Formulario enviado");

      // Validar que el carrito no esté vacío
      if (!window.cart || window.cart.length === 0) {
        showNotification(
          "Error",
          "Tu carrito está vacío. Agrega productos antes de continuar."
        );
        return;
      }

      // Recopilar datos del formulario
      const formData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        deliveryMethod:
          document.querySelector('input[name="delivery"]:checked')?.value ||
          "pickup",
        notes: document.getElementById("notes").value,
      };

      console.log("Datos del formulario:", formData);

      // Agregar dirección si es envío a domicilio
      if (formData.deliveryMethod === "delivery") {
        formData.address = document.getElementById("address").value;
      }

      // Guardar datos del cliente en localStorage para futuros pedidos
      localStorage.setItem(
        "customerData",
        JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        })
      );

      try {
        // Preparar texto para WhatsApp
        const lines = window.cart.map(
          (i) => `- ${i.name} ×${i.qty} ($${i.price * i.qty})`
        );
        const subtotal = window.cart.reduce(
          (sum, i) => sum + i.price * i.qty,
          0
        );
        const shipping = formData.deliveryMethod === "delivery" ? 50 : 0;
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
        text += `Método de entrega: ${
          formData.deliveryMethod === "pickup"
            ? "Recoger en tienda"
            : "Envío a domicilio"
        }\n`;

        if (formData.address) {
          text += `Dirección: ${formData.address}\n`;
        }

        if (formData.notes) {
          text += `\nNotas adicionales:\n${formData.notes}\n`;
        }

        console.log("Mensaje preparado:", text);

        // Preparar URL de WhatsApp pero no redirigir aún
        const whatsappNumber = "58766375"; // Número actualizado
        whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          text
        )}`;
        console.log("URL preparada:", whatsappURL);

        // Mostrar modal de confirmación en lugar de redirigir directamente
        showConfirmationModal(formData, { subtotal, shipping, total });
      } catch (error) {
        console.error("Error al procesar el formulario:", error);
        showNotification(
          "Error",
          "Hubo un error al procesar tu pedido. Por favor, intenta de nuevo."
        );
      }
    });

    // Prellenar datos del cliente si existen en localStorage
    const savedCustomerData = JSON.parse(
      localStorage.getItem("customerData") || "null"
    );
    if (savedCustomerData) {
      document.getElementById("name").value = savedCustomerData.name || "";
      document.getElementById("phone").value = savedCustomerData.phone || "";
    }
  }

  // Función para renderizar los items del carrito
  function renderCartItems() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    if (window.cart.length === 0) {
      container.innerHTML =
        '<p class="py-4 text-center text-gray-500">Tu carrito está vacío</p>';
      return;
    }

    container.innerHTML = window.cart
      .map(
        (item) => `
      <div class="py-4 flex justify-between items-center" data-id="${item.id}">
        <div class="flex items-center">
          <img src="${item.image}" alt="${
          item.name
        }" class="w-16 h-16 object-cover rounded mr-4">
          <div>
            <h3 class="font-medium">${item.name}</h3>
            <p class="text-gray-500">$${item.price} x ${item.qty}</p>
          </div>
        </div>
        <div class="flex items-center">
          <span class="font-medium mr-4">$${(item.price * item.qty).toFixed(
            2
          )}</span>
          <button class="remove-item text-gray-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // Añadir funcionalidad para eliminar items
    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", function () {
        const itemId = this.closest("[data-id]").dataset.id;
        window.cart = window.cart.filter((item) => item.id != itemId);
        localStorage.setItem("cart", JSON.stringify(window.cart));
        renderCartItems();
        updateCartSummary();
        updateCartCount();
        showNotification(
          "Producto eliminado",
          "El producto ha sido eliminado de tu carrito."
        );
      });
    });
  }

  // Actualizar resumen del carrito
  function updateCartSummary() {
    // Calcular subtotal
    const subtotal = window.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Determinar costo de envío
    const deliveryMethod = document.querySelector(
      'input[name="delivery"]:checked'
    )?.value;
    const shipping = deliveryMethod === "delivery" ? 50 : 0;

    // Calcular total
    const total = subtotal + shipping;

    // Actualizar elementos en la página
    const subtotalElement = document.getElementById("subtotal");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");
    const cartTotalElement = document.getElementById("cart-total");

    if (subtotalElement)
      subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement)
      shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    if (cartTotalElement)
      cartTotalElement.textContent = `$${subtotal.toFixed(2)}`;
  }
});
