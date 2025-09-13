window.CHEF = (function(){
  const CART_KEY = 'cheffood_cart_v1';

  // Get cart from localStorage
  function getCart(){
    const cartStr = localStorage.getItem(CART_KEY);
    if(!cartStr) return [];
    try {
      return JSON.parse(cartStr);
    } catch {
      return [];
    }
  }

  // Save cart to localStorage
  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  // Add item to cart or update qty if exists
  function addToCart(id, title, price){
    const cart = getCart();
    const index = cart.findIndex(i => i.id === id);
    if(index > -1){
      cart[index].qty++;
    } else {
      cart.push({id, title, price: Number(price), qty: 1});
    }
    saveCart(cart);
    updateCartCount();
    showToast(`Added "${title}" to cart`);
  }

  // Update cart count in header
  function updateCartCount(){
    const cart = getCart();
    const count = cart.reduce((acc, i) => acc + i.qty, 0);
    const countEls = document.querySelectorAll('.cart-count');
    countEls.forEach(el => {
      if(count > 0){
        el.style.display = 'inline-block';
        el.textContent = count;
      } else {
        el.style.display = 'none';
      }
    });
  }

  // Render cart items in cart page
  function renderCartItems(){
    const cart = getCart();
    const tbody = document.getElementById('cart-list');
    const totalEl = document.getElementById('cart-total');
    if(!tbody || !totalEl) return;
    tbody.innerHTML = '';
    if(cart.length === 0){
      tbody.innerHTML = '<tr><td colspan="4">Your cart is empty</td></tr>';
      totalEl.textContent = '0.00 L.E';
      return;
    }
    let total = 0;
    cart.forEach(item => {
      const tr = document.createElement('tr');
      const subtotal = item.qty * item.price;
      total += subtotal;
      tr.innerHTML = `
        <td>${item.title}</td>
        <td>
          <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
        </td>
        <td>${item.price.toFixed(2)} L.E</td>
        <td>${subtotal.toFixed(2)} L.E</td>
      `;
      tbody.appendChild(tr);
    });
    totalEl.textContent = total.toFixed(2) + ' L.E';

    // Add event listeners for qty buttons
    tbody.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        updateQuantity(id, action);
      });
    });
  }

  // Update quantity of item in cart
  function updateQuantity(id, action){
    const cart = getCart();
    const index = cart.findIndex(i => i.id === id);
    if(index === -1) return;
    if(action === 'increase'){
      cart[index].qty++;
    } else if(action === 'decrease'){
      cart[index].qty--;
      if(cart[index].qty <= 0){
        cart.splice(index, 1);
      }
    }
    saveCart(cart);
    updateCartCount();
    renderCartItems();
  }

  // Show toast notification
  let toastTimeout;
  function showToast(message){
    let toast = document.querySelector('.toast');
    if(!toast){
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Theme toggle
  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme');
    if(current === 'dark'){
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('cheffood_theme');
      updateThemeButton('Light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('cheffood_theme', 'dark');
      updateThemeButton('Dark');
    }
  }

  function updateThemeButton(text){
    const btn = document.getElementById('theme-toggle');
    if(btn) btn.textContent = text;
  }

  // Load theme from localStorage
  function loadTheme(){
    const theme = localStorage.getItem('cheffood_theme');
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      updateThemeButton('Dark');
    } else {
      updateThemeButton('Light');
    }
  }

  // Mobile nav toggle
  function toggleMobileNav(){
    const nav = document.getElementById('mobile-nav');
    if(nav){
      nav.classList.toggle('show');
    }
  }

  // Product search filter (for products and offers pages)
  function setupProductSearch(){
    const input = document.getElementById('product-search');
    if(!input) return;
    input.addEventListener('input', () => {
      const filter = input.value.toLowerCase();
      const cards = document.querySelectorAll('.products-grid .product-card');
      cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        if(title.includes(filter)){
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Initialize event listeners
  function init(){
    loadTheme();
    updateCartCount();

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn){
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    if(hamburger){
      hamburger.addEventListener('click', toggleMobileNav);
    }

    // Add to cart buttons
    document.querySelectorAll('button[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const title = btn.dataset.title;
        const price = btn.dataset.price;
        addToCart(id, title, price);
      });
    });

    // Setup product search if present
    setupProductSearch();
  }

  // Public API
  return {
    init,
    getCart,
    addToCart,
    updateCartCount,
    renderCartItems,
    showToast,
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.CHEF.init();
});