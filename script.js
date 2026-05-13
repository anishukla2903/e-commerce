// ----- PRODUCT FILTERING -----
const filterButtons = document.querySelectorAll(".filter-btn");
const products = document.querySelectorAll(".product-card");
const searchInput = document.getElementById("search-input");

function filterProducts(category, searchTerm) {
  products.forEach((card) => {
    const cardCategory = card.getAttribute("data-category");
    const name = card.getAttribute("data-name").toLowerCase();

    const matchesCategory =
      category === "all" || category === cardCategory;
    const matchesSearch = name.includes(searchTerm);

    if (matchesCategory && matchesSearch) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.getAttribute("data-category");
    const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    filterProducts(category, term);
  });
});

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const activeBtn = document.querySelector(".filter-btn.active");
    const category = activeBtn
      ? activeBtn.getAttribute("data-category")
      : "all";
    const term = searchInput.value.trim().toLowerCase();
    filterProducts(category, term);
  });
}

// ----- SIMPLE CART -----
let cart = [];

const cartButton = document.getElementById("cart-button");
const cartModal = document.getElementById("cart-modal");
const closeCartBtn = document.getElementById("close-cart");
const clearCartBtn = document.getElementById("clear-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const addToCartButtons = document.querySelectorAll(".add-to-cart");
const cartToast = document.getElementById("cart-toast");

// Payment-related elements
const checkoutBtn = document.getElementById("checkout-btn");
const cartStepCart = document.getElementById("cart-step-cart");
const cartStepPayment = document.getElementById("cart-step-payment");
const paymentForm = document.getElementById("payment-form");
const backToCartBtn = document.getElementById("back-to-cart");
const payNameInput = document.getElementById("pay-name");
const payAddressInput = document.getElementById("pay-address");
const payMethodSelect = document.getElementById("pay-method");
const extraFields = document.getElementById("extra-fields");

addToCartButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".product-card");
    const name = card.getAttribute("data-name");
    const priceElement = card.querySelector(".product-price");
    const price = parseInt(priceElement.getAttribute("data-price"), 10);

    addToCart(name, price);
  });
});

function showCartToast(productName) {

  if (!cartToast) return;

  cartToast.textContent =
    `${productName} added to cart 🛒`;

  cartToast.classList.add("show");

  setTimeout(() => {
    cartToast.classList.remove("show");
  }, 2000);
}

function addToCart(name, price) {
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
 renderCart();
generateRecommendations();
showCartToast(name);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartSummary() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountEl) cartCountEl.textContent = count;

  if (cartTotalEl) {
    const total = getCartTotal();
    cartTotalEl.textContent = `₹${total}`;
  }
}

function renderCart() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="cart-empty">Your cart is empty. Add some dog goodies!</p>';
    updateCartSummary();
    return;
  }

  cart.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.innerHTML = `
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">₹${item.price} × ${item.quantity}</p>
      </div>
      <button class="cart-remove-btn" data-index="${index}">Remove</button>
    `;
    cartItemsContainer.appendChild(row);
  });

  const removeButtons = cartItemsContainer.querySelectorAll(".cart-remove-btn");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"), 10);
      cart.splice(index, 1);
      renderCart();
      generateRecommendations();
    });
  });

  updateCartSummary();
}

// Open / close modal
if (cartButton && cartModal) {
  cartButton.addEventListener("click", () => {
    cartModal.classList.add("active");
    if (cartStepCart && cartStepPayment) {
      cartStepCart.classList.remove("hidden");
      cartStepPayment.classList.add("hidden");
    }
  });
}

if (closeCartBtn && cartModal) {
  closeCartBtn.addEventListener("click", () => {
    cartModal.classList.remove("active");
  });
}

if (cartModal) {
  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove("active");
    }
  });
}

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    cart = [];
    renderCart();
  });
}

// ----- CHECKOUT / PAYMENT FLOW -----
if (checkoutBtn && cartStepCart && cartStepPayment) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Add something before paying.");
      return;
    }

    cartStepCart.classList.add("hidden");
    cartStepPayment.classList.remove("hidden");
  });
}

if (backToCartBtn && cartStepCart && cartStepPayment) {
  backToCartBtn.addEventListener("click", () => {
    cartStepPayment.classList.add("hidden");
    cartStepCart.classList.remove("hidden");
  });
}

if (payMethodSelect && extraFields) {
  payMethodSelect.addEventListener("change", () => {
    const value = payMethodSelect.value;
    if (!value || value === "cod") {
      extraFields.classList.add("hidden");
      extraFields.innerHTML = "";
      return;
    }

    extraFields.classList.remove("hidden");

    if (value === "card") {
      extraFields.innerHTML = `
        <label>
          Fake Card Number
          <input type="text" placeholder="1111 2222 3333 4444 (demo only)" />
        </label>
      `;
    } else if (value === "upi") {
      extraFields.innerHTML = `
        <label>
          Fake UPI ID
          <input type="text" placeholder="name@upi (demo only)" />
        </label>
      `;
    }
  });
}

if (paymentForm) {
  paymentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const name = payNameInput.value.trim();
    const address = payAddressInput.value.trim();
    const method = payMethodSelect.value;

    if (!name || !address || !method) {
      alert("Please fill all required fields.");
      return;
    }

    const total = getCartTotal();
    alert(
      `Thank you ${name}! Your demo order of ₹${total} has been placed.\n(Delivery to: ${address})`
    );

    cart = [];
    renderCart();
    paymentForm.reset();
    if (extraFields) {
      extraFields.classList.add("hidden");
      extraFields.innerHTML = "";
    }

    if (cartStepPayment && cartStepCart) {
      cartStepPayment.classList.add("hidden");
      cartStepCart.classList.remove("hidden");
    }
    if (cartModal) {
      cartModal.classList.remove("active");
    }
  });
}

// Initial cart state
renderCart();

// ----- AUTH MODAL (LOGIN / SIGN UP) -----
const loginOpenBtn = document.getElementById("login-open");
const signupOpenBtn = document.getElementById("signup-open");
const authModal = document.getElementById("auth-modal");
const authCloseBtn = document.getElementById("auth-close");
const authTabs = document.querySelectorAll(".auth-tab");
const authLoginPanel = document.getElementById("auth-login");
const authSignupPanel = document.getElementById("auth-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authInlineSwitches = document.querySelectorAll(".auth-inline-switch");

function setAuthTab(tabName) {
  if (!authLoginPanel || !authSignupPanel) return;

  authTabs.forEach((tab) => {
    const isActive = tab.getAttribute("data-tab") === tabName;
    tab.classList.toggle("active", isActive);
  });

  authLoginPanel.classList.toggle("hidden", tabName !== "login");
  authSignupPanel.classList.toggle("hidden", tabName !== "signup");
}

function openAuth(tabName) {
  if (!authModal) return;
  authModal.classList.add("active");
  setAuthTab(tabName);
}

function closeAuth() {
  if (!authModal) return;
  authModal.classList.remove("active");
}

// open buttons
if (loginOpenBtn) {
  loginOpenBtn.addEventListener("click", () => openAuth("login"));
}
if (signupOpenBtn) {
  signupOpenBtn.addEventListener("click", () => openAuth("signup"));
}

// close button + backdrop click
if (authCloseBtn && authModal) {
  authCloseBtn.addEventListener("click", closeAuth);
}

if (authModal) {
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      closeAuth();
    }
  });
}

// tab click
authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.getAttribute("data-tab");
    setAuthTab(tabName);
  });
});

// inline switches (small text links)
authInlineSwitches.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab-target");
    setAuthTab(target);
  });
});

// fake login/signup handlers
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const pwd = document.getElementById("login-password").value.trim();
    if (!email || !pwd) {
      alert("Please fill email and password.");
      return;
    }
    alert(`Logged in as ${email} `);
    loginForm.reset();
    closeAuth();
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const pwd = document.getElementById("signup-password").value.trim();

    if (!name || !email || !pwd) {
      alert("Please fill all sign up fields.");
      return;
    }
    if (pwd.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }

    alert(`Welcome, ${name}!`);
    signupForm.reset();
    setAuthTab("login");
  });
}

// ----- AI PRODUCT RECOMMENDATIONS -----

const allProducts = [
  {
    name: "Premium Chicken Kibble",
    category: "food",
    reason: "High protein for active dogs",
    price: 899
  },
  {
    name: "Salmon & Rice Formula",
    category: "food",
    reason: "Great for digestion and shiny coat",
    price: 1099
  },
  {
    name: "Crunchy Bone Treats",
    category: "treats",
    reason: "Perfect reward snacks",
    price: 299
  },
  {
    name: "Tick & Flea Spray",
    category: "medicine",
    reason: "Recommended for outdoor dogs",
    price: 649
  }
];

function generateRecommendations() {

  const recommendationContainer =
    document.getElementById("ai-recommendations");

  if (!recommendationContainer) return;

  recommendationContainer.innerHTML = "";

  // Get cart categories
  const cartCategories = cart.map(item => {

    const card = [...products].find(p =>
      p.getAttribute("data-name") === item.name
    );

    return card?.getAttribute("data-category");
  });

  let recommendedProducts = [];

  // AI Logic
  if (cartCategories.includes("food")) {

    recommendedProducts = allProducts.filter(
      product =>
        product.category === "treats" ||
        product.category === "medicine"
    );

  } else if (cartCategories.includes("belts")) {

    recommendedProducts = allProducts.filter(
      product =>
        product.category === "medicine"
    );

  } else {

    recommendedProducts = allProducts.slice(0, 2);
  }

  recommendationContainer.innerHTML =
    recommendedProducts.map(product => `
      <article class="product-card">

        <span class="ai-badge">
          AI Recommended
        </span>

        <h3>${product.name}</h3>

        <p class="product-desc">
          ${product.reason}
        </p>

        <p class="product-price">
          ₹${product.price}
        </p>

        <button class="btn-secondary">
          Recommended Product
        </button>

      </article>
    `).join("");
}

// Run AI recommendations
generateRecommendations();