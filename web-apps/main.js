const tg = window.Telegram.WebApp;
const productsContainer = document.getElementById('products-list');
const loaderBtn = document.getElementById('loader-btn');
const loaderImg = document.getElementById('loader-img');
const cartTable = document.querySelector('.table');

let page = 1;
tg.ready();
tg.expand();

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

loaderBtn.addEventListener('click', () => {
    loaderImg.classList.add('d-inline-block');
    setTimeout(() => {
         page++;
         showProducts()
             .then(() => productQty(cart));

         loaderImg.classList.remove('d-inline-block');
    }, 1000);
});

function getCart(setCart = false) {
    if (setCart) {
        localStorage.setItem('cart', JSON.stringify(setCart));
    }
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : {};
}

function add2Cart(product, cart) {
    let id = product.id;
    if (id in cart) {
        // console.log(cart[id]['qty'], id);
        cart[id]['qty'] += 1;
    } else {
        cart[id] = product;
        cart[id]['qty'] = 1;
    }

    init(cart);
}

function getCartSum(items) {
    let cartSum = Object.entries(items).reduce(function (total, values) {
        const [key, value] = values;
        return total + (value['qty'] * value['price']);
    }, 0);
    document.querySelector('.cart-sum').innerText = (cartSum / 100) + '$';
    return cartSum;
}

function productQty(items) {
    document.querySelectorAll('.product-cart-qty').forEach(item => {
        let id = item.dataset.id;
        if (id in items) {
            item.innerText = items[id]['qty'];
        } else {
            item.innerText = '';
        }
    })
}

function cartContent(items) {
    let cartTableBody = document.querySelector('.table tbody');
    let cartEmpty = document.querySelector('.empty-cart');
    let qty = Object.keys(items).length;

    if (qty) {
        tg.MainButton.show();
        tg.MainButton.setParams({
            text: `CHECKOUT: ${getCartSum(items) / 100}$`,
            color: '#d7b300'
        });

        cartTable.classList.remove('d-none');
        cartEmpty.classList.remove('d-block');
        cartEmpty.classList.add('d-none');

        cartTableBody.innerHTML = '';
        Object.keys(items).forEach(key => {
            cartTableBody.innerHTML += `
                                <tr class="align-middle animate__animated">
                                    <th scope="row">${key}</th>
                                    <td><img src="img/${items[key]['img']}" class="cart-img" alt=""></td>
                                    <td>${items[key]['title']}</td>
                                    <td>${items[key]['qty']}</td>
                                    <td>${items[key]['price']}</td>
                                    <td data-id="${key}"><button class="btn del-item">🗑</button></td>
                                </tr>
                                `;
        });
    } else {
        tg.MainButton.hide();
        cartTableBody.innerHTML = '';
        cartTable.classList.add('d-none');
        cartEmpty.classList.remove('d-none');
        cartEmpty.classList.add('d-block');
    }
}

function init(cart) {
    getCartSum(cart);
    productQty(cart);
    cartContent(cart);
}

// Init app
init(getCart());

// Add listener for add product
productsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add2cart')) {
        e.preventDefault();
        e.target.classList.add('animate__rubberBand');
        // console.log(JSON.parse(e.target.dataset.product));
        add2Cart(JSON.parse(e.target.dataset.product), getCart());
        setTimeout(() => {
            te.target.classList.remove('animate__rubberBand');
        }, 1000);
    }
});

// Add listener for remove product
cartTable.addEventListener('click', (e) => {
    const target = e.target.closest('.del-item');

    if (target) {
        const id = target.parentElement.dataset.id;
        target.parentElement.parentElement.classList.add('animate__zoomOut');
        setTimeout(() => {
            const cart = getCart();
            delete cart[id];
            init(cart);
        }, 500);
    }
});

tg.MainButton.onClick(() => {
    fetch('../index.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            query_id: tg.initDataUnsafe.query_id,
            user: tg.initDataUnsafe.user,
            cart: getCart(),
            total_sum: getCartSum(getCart()),
        }),
    })
        .then(res => res.json())
        .then(data => {
            if (data?.res) {
                tg.close();
                return;
            }

            alert(data.answer);
        });
});
