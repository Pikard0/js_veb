'use strict';

let state = {
    products: [],
    filterBy: null,
    sortBy: null
};

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);
const getCurrentTime = () => new Date().getTime();

const addProduct = (products, productData) => [...products, { ...productData, id: generateId(), createdAt: getCurrentTime(), updatedAt: getCurrentTime() }];

const deleteProduct = (products, id) => products.filter(p => p.id !== id);

const updateProduct = (products, id, updatedData) =>
    products.map(p => p.id === id ? { ...p, ...updatedData, updatedAt: getCurrentTime() } : p);

const calculateTotalPrice = (products) => products.reduce((sum, p) => sum + Number(p.price), 0);

const filterProducts = (products, category) => category ? products.filter(p => p.category === category) : products;

const sortProducts = (products, sortBy) => {
    if (!sortBy) return products;
    const copy = [...products];
    if (sortBy === 'price') return copy.sort((a, b) => a.price - b.price);
    if (sortBy === 'created') return copy.sort((a, b) => b.createdAt - a.createdAt);
    if (sortBy === 'updated') return copy.sort((a, b) => b.updatedAt - a.updatedAt);
    return copy;
};


const DOM = {
    list: document.getElementById('productList'),
    emptyMsg: document.getElementById('emptyMessage'),
    totalPrice: document.getElementById('totalPrice'),
    modal: document.getElementById('productModal'),
    form: document.getElementById('productForm'),
    snackbar: document.getElementById('snackbar'),
    modalTitle: document.getElementById('modalTitle')
};

const showSnackbar = (message) => {
    DOM.snackbar.textContent = message;
    DOM.snackbar.classList.add('show');
    setTimeout(() => DOM.snackbar.classList.remove('show'), 3000);
};

const renderProducts = () => {
    const processedProducts = sortProducts(filterProducts(state.products, state.filterBy), state.sortBy);

    DOM.list.innerHTML = '';
    DOM.emptyMsg.style.display = processedProducts.length === 0 ? 'block' : 'none';
    DOM.totalPrice.textContent = `${calculateTotalPrice(processedProducts).toFixed(2)} ₴`;

    processedProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <small>ID: ${product.id}</small>
                <h3>${product.name}</h3>
                <p><strong>Ціна:</strong> ${product.price} ₴</p>
                <p><strong>Категорія:</strong> ${product.category}</p>
                <div class="product-actions">
                    <button class="primary-btn edit-btn">Редагувати</button>
                    <button class="danger-btn delete-btn">Видалити</button>
                </div>
            </div>
        `;

        card.querySelector('.delete-btn').addEventListener('click', () => {
            card.classList.add('removing');
            setTimeout(() => {
                state.products = deleteProduct(state.products, product.id);
                showSnackbar(`Товар успішно видалено!`);
                renderProducts();
            }, 350);
        });

        card.querySelector('.edit-btn').addEventListener('click', () => {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productImage').value = product.image;
            DOM.modalTitle.textContent = 'Редагувати товар';
            DOM.modal.classList.remove('hidden');
        });

        DOM.list.appendChild(card);
    });
};

DOM.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        price: Number(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value
    };

    if (id) {
        state.products = updateProduct(state.products, id, productData);
        showSnackbar(`Товар оновлено: [${id}] ${productData.name}`);
    } else {
        state.products = addProduct(state.products, productData);
        showSnackbar('Товар успішно додано!');
    }

    DOM.modal.classList.add('hidden');
    DOM.form.reset();
    renderProducts();
});

document.getElementById('openAddModalBtn').addEventListener('click', () => {
    DOM.form.reset();
    document.getElementById('productId').value = '';
    DOM.modalTitle.textContent = 'Додати товар';
    DOM.modal.classList.remove('hidden');
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
    DOM.modal.classList.add('hidden');
});

document.querySelectorAll('.filter-btn:not(.reset-btn)').forEach(btn => {
    btn.addEventListener('click', (e) => {
        state.filterBy = e.target.dataset.category;
        renderProducts();
    });
});
document.getElementById('resetFilterBtn').addEventListener('click', () => {
    state.filterBy = null;
    renderProducts();
});

document.querySelectorAll('.sort-btn:not(.reset-btn)').forEach(btn => {
    btn.addEventListener('click', (e) => {
        state.sortBy = e.target.dataset.sort;
        renderProducts();
    });
});
document.getElementById('resetSortBtn').addEventListener('click', () => {
    state.sortBy = null;
    renderProducts();
});

renderProducts();