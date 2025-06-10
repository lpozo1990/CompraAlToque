// checkout.js
document.getElementById("checkout-btn").addEventListener("click", () => {
  if (!cart.length) {
    return alert("El carrito está vacío.");
  }
  const lines = cart.map((i) => `- ${i.name} ×${i.qty} ($${i.price * i.qty})`);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const text = encodeURIComponent(
    `Hola, quiero comprar estos productos:\n${lines.join(
      "\n"
    )}\nTotal: $${total}`
  );
  // Reemplaza el número por el tuyo (sin espacios ni separadores)
  window.location.href = `https://wa.me/5215512345678?text=${text}`;
});
