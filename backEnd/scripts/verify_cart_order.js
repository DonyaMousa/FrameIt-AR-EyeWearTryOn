const http = require('http');

// Configuration
const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

// Test Data
const validProduct = {
    productId: 'REPLACE_WITH_VALID_PRODUCT_ID',
    quantity: 1
};
const userCredentials = {
    email: 'test@example.com', // Ensure this user exists
    password: 'password123'
};

let token = '';

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('Starting Verification...');

    // 1. Login to get token
    console.log('\nLogging in...');
    const loginRes = await request({
        hostname: HOST,
        port: PORT,
        path: '/api/users/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, userCredentials);

    if (loginRes.statusCode !== 200) {
        console.error('Login failed. Ensure user exists.', loginRes.body);
        return;
    }
    token = loginRes.body.data.token;
    console.log('Login successful. Token acquired.');

    // 2. Add to Cart
    console.log('\nAdding to Cart...');
    // Note: You need a valid product ID. Fetching products first might be better.
    // Fetch products
    const productsRes = await request({
        hostname: HOST,
        port: PORT,
        path: '/api/products',
        method: 'GET'
    });

    if (productsRes.statusCode !== 200 || productsRes.body.products.length === 0) {
        console.error('Cannot fetch products or no products found.');
        return;
    }

    const product = productsRes.body.products[0];
    console.log(`Using product: ${product.name} (${product._id})`);

    const addToCartRes = await request({
        hostname: HOST,
        port: PORT,
        path: '/api/cart',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, { productId: product._id, quantity: 1 });

    console.log('Add to Cart Status:', addToCartRes.statusCode);
    if (addToCartRes.statusCode === 200) {
        console.log('Item added/updated in cart.');
    } else {
        console.log('Error adding to cart:', addToCartRes.body);
    }

    // 3. Place Order
    console.log('\nPlacing Order...');
    const placeOrderRes = await request({
        hostname: HOST,
        port: PORT,
        path: '/api/orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    console.log('Place Order Status:', placeOrderRes.statusCode);
    if (placeOrderRes.statusCode === 201) {
        console.log('Order placed successfully.');
        console.log('Order ID:', placeOrderRes.body._id);
    } else {
        console.log('Error placing order:', placeOrderRes.body);
    }
}

runTests().catch(console.error);
