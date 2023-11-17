const productsContainer = document.getElementById('products-list');
const loaderBtn = document.getElementById('loader-btn');
const loaderImg = document.getElementById('loader-img');
let page = 1;

async function getProducts() {
    const res = await fetch(`page2.php?page=${page}`);
    return res.text();
}

async function showProducts() {
    const products = await getProducts();
    if (products) {
        productsContainer.insertAdjacentHTML('beforeend', products);
    } else {
        loaderBtn.classList.add('d-none');
    }
}

function getCart(setCart = false) {
    const cartStorage = localStorage.getItem('cart');

    if (setCart) {
        localStorage.setItem('cart', JSON.stringify(setCart));
    }

    return cartStorage ? JSON.parse(cartStorage) : {};
}

function add2Cart(product) {
    const id = product.id;
    if (id in cart) {
        // console.log(cart[id]['qty'], id);
        cart[id]['qty'] += 1;
    } else {
        cart[id] = product;
        cart[id]['qty'] = 1;
    }
    getCart(cart);
}

const cart = getCart();

// Add listener for add product
productsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add2cart')) {
        e.preventDefault();
        e.target.classList.add('animate__rubberBand');
        // console.log(JSON.parse(e.target.dataset.product));
        add2Cart(JSON.parse(e.target.dataset.product));
        setTimeout(() => {
            e.target.classList.remove('animate__rubberBand');
        }, 1000);
    }
});

loaderBtn.addEventListener('click', () => {
    loaderImg.classList.add('d-inline-block');
    setTimeout(() => {
         page++;
         showProducts();
         loaderImg.classList.remove('d-inline-block');
    }, 1000);
});
