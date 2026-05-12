// ---- Product Data ----
const PRODUCTS = [
    { id:1, name:'Silk Slip Dress',    category:'women',      price:249, sale_price:179, image:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', stars:5, reviews:128, badge:'Sale', new:false },
    { id:2, name:'Linen Blazer',       category:'women',      price:320, sale_price:null, image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', stars:4, reviews:84,  badge:'New', new:true  },
    { id:3, name:'Merino Wool Coat',   category:'men',        price:580, sale_price:null, image:'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80', stars:5, reviews:210, badge:null,  new:false },
    { id:4, name:'Leather Crossbody',  category:'accessories',price:195, sale_price:145, image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', stars:4, reviews:67,  badge:'Sale', new:false },
    { id:5, name:'Wide-Leg Trousers',  category:'women',      price:189, sale_price:null, image:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', stars:4, reviews:92,  badge:'New', new:true  },
    { id:6, name:'Oxford Derby Shoes', category:'footwear',   price:345, sale_price:null, image:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80', stars:5, reviews:156, badge:null,  new:false },
    { id:7, name:'Cashmere Sweater',   category:'men',        price:420, sale_price:299, image:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80', stars:4, reviews:73,  badge:'Sale', new:false },
    { id:8, name:'Gold Hoop Earrings', category:'accessories',price:89,  sale_price:null, image:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', stars:5, reviews:204, badge:'New', new:true  },
];

// ---- State ----
let cart        = JSON.parse(localStorage.getItem('luxe_cart')    || '[]');
let wishlist    = JSON.parse(localStorage.getItem('luxe_wishlist') || '[]');
let currentUser = JSON.parse(localStorage.getItem('luxe_user')    || 'null');
let currentPage = 'home';

// =============================================
// PAGE NAVIGATION  (DOM manipulation + Events)
// =============================================
function navigate(page) {
    // DOM: hide all pages, show target
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');
        currentPage = page;
        window.scrollTo(0, 0);
    }

    // Update nav active state (addEventListener pattern via class toggle)
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });

    // Render page-specific content
    if (page === 'home')        renderHomeProducts();
    if (page === 'shop')        renderShopProducts();
    if (page === 'cart')        renderCart();
    if (page === 'wishlist')    renderWishlist();
    if (page === 'checkout')    renderCheckout();
    if (page === 'account')     renderAccount();
    if (page === 'collections') initReveal();
    if (page === 'about')       initReveal();

    // Close mobile menu on navigate
    const nav = document.querySelector('.nav-links');
    nav.style.cssText = '';
}

// =============================================
// PRODUCT CARD TEMPLATE (DOM injection)
// =============================================
function productCard(p) {
    const inWishlist = wishlist.includes(p.id);
    const price = p.sale_price
        ? `<span class="product-price">$${p.sale_price.toFixed(2)}</span><span class="product-old-price">$${p.price.toFixed(2)}</span>`
        : `<span class="product-price">$${p.price.toFixed(2)}</span>`;
    const stars = '★'.repeat(p.stars) + '☆'.repeat(5 - p.stars);
    const badge = p.badge ? `<span class="product-badge ${p.badge === 'Sale' ? 'badge-sale' : ''}">${p.badge}</span>` : '';

    return `
        <div class="product-card reveal">
            <div class="product-img">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                ${badge}
                <div class="product-actions">
                    <button class="action-btn" onclick="addToCart(${p.id})" title="Add to Bag">
                        <i class="fa-solid fa-bag-shopping"></i>
                    </button>
                    <button class="action-btn ${inWishlist ? 'wishlist-active' : ''}" onclick="toggleWishlist(${p.id}, this)" title="Wishlist">
                        <i class="fa-${inWishlist ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <p class="product-category">${p.category}</p>
                <h3 class="product-title">${p.name}</h3>
                <div class="product-price-row">${price}</div>
                <div class="product-stars">${stars} <span style="color:var(--text-muted);font-size:0.75rem;">(${p.reviews})</span></div>
            </div>
        </div>`;
}

// ---- Home Products ----
function renderHomeProducts() {
    const grid = document.getElementById('home-product-grid');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.slice(0, 4).map(productCard).join('');
    initReveal();
}

// =============================================
// SHOP — Filter + Sort (Events: oninput, onchange)
// =============================================
function renderShopProducts() {
    let products = [...PRODUCTS];
    const cat    = document.querySelector('input[name="cat"]:checked')?.value || '';
    const onSale = document.getElementById('filter-sale')?.checked;
    const sort   = document.getElementById('sort-select')?.value || 'newest';
    const q      = document.getElementById('shop-search')?.value?.toLowerCase() || '';

    if (cat)    products = products.filter(p => p.category === cat);
    if (onSale) products = products.filter(p => p.sale_price);
    if (q)      products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q));

    if (sort === 'price_asc')  products.sort((a,b) => (a.sale_price||a.price) - (b.sale_price||b.price));
    else if (sort === 'price_desc') products.sort((a,b) => (b.sale_price||b.price) - (a.sale_price||a.price));
    else if (sort === 'popular')    products.sort((a,b) => b.reviews - a.reviews);

    const grid  = document.getElementById('shop-product-grid');
    const count = document.getElementById('product-count');
    if (count) count.textContent = `${products.length} product${products.length !== 1 ? 's' : ''} found`;
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `<div style="text-align:center;padding:80px 0;grid-column:1/-1;">
            <i class="fa-solid fa-box-open" style="font-size:3rem;color:var(--border);"></i>
            <h3 style="margin-top:20px;">No products found</h3>
            <p style="color:var(--text-muted);margin-top:8px;">Try a different search or remove filters.</p>
        </div>`;
        return;
    }
    grid.innerHTML = products.map(productCard).join('');
    initReveal();
}

function filterProducts() { renderShopProducts(); }

// =============================================
// CART  (DOM updates on every change)
// =============================================
function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty++;
    else cart.push({ id, qty: 1 });
    saveCart();
    updateCartBadge();
    showToast(`${product.name} added to your bag!`, 'success');
}

function saveCart() {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById('cart-badge').textContent = total;
}

function renderCart() {
    const hero    = document.getElementById('cart-hero-count');
    const content = document.getElementById('cart-content');
    const total   = cart.reduce((sum, i) => sum + i.qty, 0);
    if (hero) hero.textContent = `${total} item${total !== 1 ? 's' : ''} in your bag`;

    if (cart.length === 0) {
        content.innerHTML = `<div class="cart-empty">
            <i class="fa-solid fa-bag-shopping"></i>
            <h2>Your bag is empty</h2>
            <p>Add some items to get started.</p>
            <button class="btn btn-primary" onclick="navigate('shop')">Continue Shopping</button>
        </div>`;
        return;
    }

    const subtotal   = cart.reduce((sum, i) => {
        const p = PRODUCTS.find(p => p.id === i.id);
        return sum + (p ? (p.sale_price || p.price) * i.qty : 0);
    }, 0);
    const shipping   = subtotal > 150 ? 0 : 12;
    const orderTotal = subtotal + shipping;

    const rows = cart.map(i => {
        const p = PRODUCTS.find(p => p.id === i.id);
        if (!p) return '';
        const price = p.sale_price || p.price;
        return `<tr>
            <td>
                <div class="cart-product">
                    <img src="${p.image}" alt="${p.name}">
                    <div><h4>${p.name}</h4><p style="color:var(--text-muted);font-size:0.85rem;">${p.category}</p></div>
                </div>
            </td>
            <td>$${price.toFixed(2)}</td>
            <td>
                <div class="qty-control">
                    <button onclick="changeQty(${p.id}, -1)">−</button>
                    <span>${i.qty}</span>
                    <button onclick="changeQty(${p.id}, 1)">+</button>
                </div>
            </td>
            <td><strong>$${(price * i.qty).toFixed(2)}</strong></td>
            <td><button class="cart-remove" onclick="removeFromCart(${p.id})"><i class="fa-solid fa-xmark"></i> Remove</button></td>
        </tr>`;
    }).join('');

    content.innerHTML = `
        <div class="cart-layout">
            <div>
                <table class="cart-table">
                    <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div style="display:flex;gap:12px;margin-top:24px;">
                    <button class="btn btn-secondary" onclick="navigate('shop')">← Continue Shopping</button>
                    <button class="btn btn-secondary" onclick="clearCart()"><i class="fa-solid fa-trash"></i> Clear Bag</button>
                </div>
            </div>
            <div>
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
                    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:var(--success)">Free</span>' : '$' + shipping.toFixed(2)}</span></div>
                    ${shipping > 0 ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">Add $${(150 - subtotal).toFixed(2)} more for free shipping</p>` : ''}
                    <div class="summary-row total"><span>Total</span><span>$${orderTotal.toFixed(2)}</span></div>
                    <button class="btn btn-primary btn-full" style="margin-top:24px;" onclick="navigate('checkout')">Proceed to Checkout →</button>
                </div>
            </div>
        </div>`;
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartBadge();
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartBadge();
    renderCart();
    showToast('Item removed from bag.', 'success');
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
}

// =============================================
// WISHLIST
// =============================================
function toggleWishlist(id, btn) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(w => w !== id);
        btn.classList.remove('wishlist-active');
        btn.querySelector('i').className = 'fa-regular fa-heart';
        showToast('Removed from wishlist.', 'success');
    } else {
        wishlist.push(id);
        btn.classList.add('wishlist-active');
        btn.querySelector('i').className = 'fa-solid fa-heart';
        showToast('Added to wishlist!', 'success');
    }
    localStorage.setItem('luxe_wishlist', JSON.stringify(wishlist));
}

function renderWishlist() {
    const content = document.getElementById('wishlist-content');
    if (wishlist.length === 0) {
        content.innerHTML = `<div class="wishlist-empty">
            <i class="fa-regular fa-heart"></i>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love to find them easily later.</p>
            <button class="btn btn-primary" style="margin-top:24px;" onclick="navigate('shop')">Start Shopping</button>
        </div>`;
        return;
    }
    const items = wishlist.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    content.innerHTML = `<div class="product-grid">${items.map(productCard).join('')}</div>`;
    initReveal();
}

// =============================================
// CHECKOUT
// =============================================
function renderCheckout() {
    const itemsEl  = document.getElementById('checkout-items');
    const totalsEl = document.getElementById('checkout-totals');
    if (!itemsEl) return;

    const subtotal = cart.reduce((sum, i) => {
        const p = PRODUCTS.find(p => p.id === i.id);
        return sum + (p ? (p.sale_price || p.price) * i.qty : 0);
    }, 0);
    const shipping = subtotal > 150 ? 0 : 12;

    itemsEl.innerHTML = cart.map(i => {
        const p = PRODUCTS.find(p => p.id === i.id);
        if (!p) return '';
        const price = p.sale_price || p.price;
        return `<div class="checkout-summary-item">
            <img src="${p.image}" alt="${p.name}">
            <div><h4>${p.name}</h4><p>Qty: ${i.qty}</p><strong>$${(price * i.qty).toFixed(2)}</strong></div>
        </div>`;
    }).join('');

    totalsEl.innerHTML = `
        <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
        <div class="summary-row total"><span>Total</span><span>$${(subtotal + shipping).toFixed(2)}</span></div>`;
}

function placeOrder() {
    cart = [];
    saveCart();
    updateCartBadge();
    showToast('🎉 Order placed! Thank you for shopping with LUXE.', 'success');
    setTimeout(() => navigate('account'), 1500);
}

// =============================================
// AUTH — Login / Register / Logout
// (Form Validation with addEventListener-style events)
// =============================================
function doLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const flash    = document.getElementById('login-flash');

    // Validation
    if (!email || !password) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Please fill in all fields.</div>';
        return;
    }
    if (!isValidEmail(email)) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Please enter a valid email address.</div>';
        return;
    }
    if (password.length < 6) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Password must be at least 6 characters.</div>';
        return;
    }

    // Simulate authentication
    currentUser = {
        email,
        firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
    };
    localStorage.setItem('luxe_user', JSON.stringify(currentUser));
    flash.innerHTML = '';
    showToast(`Welcome back, ${currentUser.firstName}!`, 'success');
    navigate('home');
}

function doRegister() {
    const fname   = document.getElementById('reg-fname').value.trim();
    const lname   = document.getElementById('reg-lname').value.trim();
    const email   = document.getElementById('reg-email').value.trim();
    const password= document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const flash   = document.getElementById('register-flash');

    // Full validation
    if (!fname || !lname || !email || !password || !confirm) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Please fill in all fields.</div>';
        return;
    }
    if (!isValidEmail(email)) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Please enter a valid email address.</div>';
        return;
    }
    if (password.length < 8) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Password must be at least 8 characters.</div>';
        return;
    }
    if (!/[A-Z]/.test(password)) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Password must contain at least one uppercase letter.</div>';
        return;
    }
    if (!/[0-9]/.test(password)) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Password must contain at least one number.</div>';
        return;
    }
    if (password !== confirm) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Passwords do not match.</div>';
        return;
    }

    currentUser = { email, firstName: fname, lastName: lname };
    localStorage.setItem('luxe_user', JSON.stringify(currentUser));
    flash.innerHTML = '';
    showToast(`Welcome to LUXE, ${fname}!`, 'success');
    navigate('home');
}

function doLogout() {
    currentUser = null;
    localStorage.removeItem('luxe_user');
    showToast('You have been signed out.', 'success');
    navigate('home');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderAccount() {
    const greeting = document.getElementById('account-greeting');
    if (greeting && currentUser) {
        greeting.textContent = `Welcome back, ${currentUser.firstName || currentUser.email}!`;
    }
    const fname = document.getElementById('profile-fname');
    const lname = document.getElementById('profile-lname');
    const email = document.getElementById('profile-email');
    if (currentUser) {
        if (fname) fname.value = currentUser.firstName || '';
        if (lname) lname.value = currentUser.lastName  || '';
        if (email) email.value = currentUser.email     || '';
    }
}

function saveProfile() {
    const fname = document.getElementById('profile-fname').value.trim();
    const lname = document.getElementById('profile-lname').value.trim();
    const email = document.getElementById('profile-email').value.trim();

    if (!fname || !email) {
        document.getElementById('account-flash').innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> First name and email are required.</div>';
        return;
    }
    if (currentUser) {
        currentUser.firstName = fname;
        currentUser.lastName  = lname;
        currentUser.email     = email;
        localStorage.setItem('luxe_user', JSON.stringify(currentUser));
    }
    document.getElementById('account-flash').innerHTML = '<div class="flash flash-success"><i class="fa-solid fa-circle-check"></i> Profile updated successfully!</div>';
}

function switchTab(tab, el) {
    document.getElementById('tab-orders').style.display  = tab === 'orders'  ? 'block' : 'none';
    document.getElementById('tab-profile').style.display = tab === 'profile' ? 'block' : 'none';
    document.querySelectorAll('.account-nav a').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
}

// =============================================
// CONTACT FORM
// =============================================
function submitContact() {
    const fname   = document.getElementById('contact-fname').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const flash   = document.getElementById('contact-flash');

    if (!fname || !email || !message) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Please fill in all required fields.</div>';
        return;
    }
    if (!isValidEmail(email)) {
        flash.innerHTML = '<div class="flash flash-error"><i class="fa-solid fa-circle-xmark"></i> Please enter a valid email address.</div>';
        return;
    }

    flash.innerHTML = '<div class="flash flash-success"><i class="fa-solid fa-circle-check"></i> Thank you! We\'ll get back to you within 24 hours.</div>';
    document.getElementById('contact-fname').value   = '';
    document.getElementById('contact-lname').value   = '';
    document.getElementById('contact-email').value   = '';
    document.getElementById('contact-subject').value = '';
    document.getElementById('contact-message').value = '';
}

// =============================================
// NEWSLETTER
// =============================================
function subscribeNewsletter() {
    const email = document.getElementById('newsletter-email').value.trim();
    if (!email) return;
    if (!isValidEmail(email)) { showToast('Please enter a valid email.', 'error'); return; }
    showToast('Thanks for subscribing! 🎉', 'success');
    document.getElementById('newsletter-email').value = '';
}

// =============================================
// TOAST NOTIFICATION  (DOM injection)
// =============================================
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.style.background = type === 'success' ? '#1a1a1a' : '#e05252';
    toast.style.color = '#fff';
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-xmark'}"></i> ${msg}`;
    requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}

// =============================================
// MOBILE MENU  (Event: click → DOM toggle)
// =============================================
function toggleMobileMenu() {
    const nav    = document.querySelector('.nav-links');
    const isOpen = nav.style.display === 'flex';
    nav.style.cssText = isOpen
        ? ''
        : 'display:flex;flex-direction:column;position:absolute;top:100%;left:0;width:100%;background:#fff;padding:20px 5%;gap:16px;box-shadow:0 10px 30px rgba(0,0,0,0.1);z-index:800;';
}

// =============================================
// LIVE CLOCK  (setInterval → DOM update every 1s)
// =============================================
function updateClock() {
    const now      = new Date();
    const time     = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date     = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const topClock    = document.getElementById('live-clock');
    const footerClock = document.getElementById('footer-clock');
    if (topClock)    topClock.textContent    = `${date}  •  ${time}`;
    if (footerClock) footerClock.textContent = time;
}
updateClock();
setInterval(updateClock, 1000);   // JS Concept: setInterval (Clock DOM Event)

// =============================================
// LOADER  (Event: window load)
// =============================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.querySelector('.loader');
        if (loader) loader.classList.add('hidden');
    }, 600);
});

// =============================================
// SCROLL REVEAL  (IntersectionObserver — DOM Events)
// =============================================
function initReveal() {
    const els      = document.querySelectorAll('.reveal:not(.visible)');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => observer.observe(el));
}

// =============================================
// KEYBOARD ACCESSIBILITY  (addEventListener — keydown)
// =============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu on Escape
        document.querySelector('.nav-links').style.cssText = '';
    }
});

// =============================================
// SCROLL HEADER SHADOW  (addEventListener — scroll)
// =============================================
window.addEventListener('scroll', () => {
    const header = document.getElementById('site-header');
    if (header) {
        header.style.boxShadow = window.scrollY > 20
            ? '0 4px 20px rgba(0,0,0,0.1)'
            : 'none';
    }
});

// =============================================
// INIT on DOM Ready
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderHomeProducts();
    initReveal();
});
