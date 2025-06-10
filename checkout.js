// checkout.js
(function () {
  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (!window.cart.length) {
      return alert("Tu carrito está vacío.");
    }
    const lines = window.cart.map(
      (i) => `- ${i.name} ×${i.qty} ($${i.price * i.qty})`
    );
    const total = window.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const text = encodeURIComponent(
      `Hola, quiero comprar estos productos:\n${lines.join(
        "\n"
      )}\nTotal: $${total}`
    );
    // Cambia el número por el tuyo (sin espacios ni símbolos)
    window.location.href = `https://wa.me/5215512345678?text=${text}`;
  });
})();
