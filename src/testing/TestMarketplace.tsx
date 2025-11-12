// src/pages/TestMarketplace.js
import React, { useState, useEffect } from 'react';
import {
  authAPI,
  vendorAPI,
  productCategoryAPI,
  productAPI,
  cartAPI,
  orderAPI,
  profileAPI,
  categoryAPI,

} from './apiService';

const TestMarketplace = () => {
  // State management
  const [activeTab, setActiveTab] = useState('auth');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);

  // Form states
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendor',
    phone: ''
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [vendorForm, setVendorForm] = useState({
    companyName: '',
    description: '',
    gstNumber: '',
    panNumber: '',
    enableServices: true,
    enableProducts: false,
    serviceCategories: [],
    productCategories: [],
    serviceAreas: ['Mumbai', 'Delhi', 'Bangalore'],
    productSettings: {
      allowCOD: true,
      shippingCharge: 0,
      freeShippingAbove: 500,
      returnPolicy: '7 days return policy'
    }
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    price: '',
    inventory: '',
    specifications: '{}',
    tags: ''
  });

  const [cartForm, setCartForm] = useState({
    productId: '',
    variantId: '',
    quantity: 1
  });

  const [orderForm, setOrderForm] = useState({
    shippingAddress: {
      name: '',
      phone: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: ''
    },
    paymentMethod: 'cod'
  });

  // Display message
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle form changes
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleVendorChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setVendorForm({ ...vendorForm, [name]: checked });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setVendorForm({
        ...vendorForm,
        [parent]: {
          ...vendorForm[parent],
          [child]: value
        }
      });
    } else {
      setVendorForm({ ...vendorForm, [name]: value });
    }
  };

  const handleProductChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleCartChange = (e) => {
    // UPDATED: Reset variant when product changes
    if (e.target.name === 'productId') {
      setCartForm({
        ...cartForm,
        [e.target.name]: e.target.value,
        variantId: '' // Reset variant when product changes
      });
    } else {
      setCartForm({ ...cartForm, [e.target.name]: e.target.value });
    }
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrderForm({
        ...orderForm,
        [parent]: {
          ...orderForm[parent],
          [child]: value
        }
      });
    } else {
      setOrderForm({ ...orderForm, [name]: value });
    }
  };

  // Auth functions
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register(registerForm);
      const { token, refreshToken } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      setCurrentUser(response.data.data.user);
      showMessage('success', 'Registration successful!');
      setActiveTab('vendor');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(loginForm);
      const { token, refreshToken } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      setCurrentUser(response.data.data.user);
      showMessage('success', 'Login successful!');

      // Check if user has vendor profile
      try {
        const vendorResponse = await vendorAPI.getProfile();
        setVendorProfile(vendorResponse.data.data.vendor);
        setActiveTab('dashboard');
      } catch (vendorError) {
        setActiveTab('vendor');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authAPI.logout(refreshToken);

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      setCurrentUser(null);
      setVendorProfile(null);
      showMessage('success', 'Logged out successfully!');
      setActiveTab('auth');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Logout failed');
    }
  };

  // Vendor functions
  const handleCreateVendorProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await vendorAPI.createProfile(vendorForm);
      setVendorProfile(response.data.data.vendor);
      showMessage('success', 'Vendor profile created successfully!');
      setActiveTab('dashboard');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create vendor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableProductCapability = async () => {
    setLoading(true);

    try {
      const response = await vendorAPI.enableProductCapability({
        categories: vendorForm.productCategories,
        settings: vendorForm.productSettings
      });

      setVendorProfile(response.data.data.vendor);
      showMessage('success', 'Product capability enabled successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to enable product capability');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableProductCapability = async () => {
    setLoading(true);

    try {
      const response = await vendorAPI.disableProductCapability();
      setVendorProfile(response.data.data.vendor);
      showMessage('success', 'Product capability disabled successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to disable product capability');
    } finally {
      setLoading(false);
    }
  };

  // Product functions
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('category', productForm.category);
      formData.append('sku', productForm.sku);
      formData.append('specifications', productForm.specifications);
      formData.append('tags', productForm.tags);

      // Create a simple variant
      formData.append('variants', JSON.stringify([{
        name: 'Default',
        price: productForm.price,
        inventory: productForm.inventory,
        attributes: {}
      }]));

      const response = await productAPI.createProduct(formData);
      showMessage('success', 'Product created successfully!');

      // Reset form
      setProductForm({
        name: '',
        description: '',
        category: '',
        sku: '',
        price: '',
        inventory: '',
        specifications: '{}',
        tags: ''
      });

      // Refresh products list
      fetchProducts();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Cart functions
  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await cartAPI.addToCart(cartForm);
      showMessage('success', 'Item added to cart successfully!');
      fetchCart();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  // Order functions
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await orderAPI.createOrder(orderForm);
      showMessage('success', 'Order created successfully!');
      fetchOrders();
      fetchCart(); // Refresh cart to clear it
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  // Profile functions
  const handleSwitchCapability = async (capability) => {
    setLoading(true);

    try {
      const response = await profileAPI.switchCapability(capability);
      setCurrentUser(response.data.data.user);
      showMessage('success', `Switched to ${capability} capability successfully!`);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to switch capability');
    } finally {
      setLoading(false);
    }
  };

  // Fetch functions
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProductCategories = async () => {
    try {
      const response = await productCategoryAPI.getCategories();
      setProductCategories(response.data.data.categories);
    } catch (error) {
      console.error('Failed to fetch product categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      setProducts(response.data.data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data.data.cart);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await profileAPI.getUserProfile();
      setCurrentUser(response.data.data.user);
      setVendorProfile(response.data.data.vendorProfile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
      fetchCategories();
      fetchProductCategories();
      fetchProducts();
      fetchCart();
      fetchOrders();
    } else {
      fetchCategories();
      fetchProductCategories();
      fetchProducts();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace Testing Page</h1>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {message.text}
          </div>
        )}

        {/* User Info */}
        {currentUser && (
          <div className="bg-white p-4 rounded-md shadow mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Logged in as: {currentUser.name}</h2>
                <p className="text-gray-600">Email: {currentUser.email}</p>
                <p className="text-gray-600">Role: {currentUser.role}</p>
                {currentUser.activeCapability && (
                  <p className="text-gray-600">Active Capability: {currentUser.activeCapability}</p>
                )}
              </div>
              <div className="flex space-x-2">
                {vendorProfile && (
                  <div className="flex space-x-2">
                    {vendorProfile.capabilities.services.enabled && (
                      <button
                        onClick={() => handleSwitchCapability('services')}
                        className={`px-4 py-2 rounded-md ${currentUser.activeCapability === 'services'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                          }`}
                      >
                        Services
                      </button>
                    )}
                    {vendorProfile.capabilities.products.enabled && (
                      <button
                        onClick={() => handleSwitchCapability('products')}
                        className={`px-4 py-2 rounded-md ${currentUser.activeCapability === 'products'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                          }`}
                      >
                        Products
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {(!currentUser && (
              <button
                onClick={() => setActiveTab('auth')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'auth'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Authentication
              </button>
            ))}

            {currentUser && !vendorProfile && (
              <button
                onClick={() => setActiveTab('vendor')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'vendor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Vendor Profile
              </button>
            )}

            {currentUser && vendorProfile && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'products'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Products
                </button>

                <button
                  onClick={() => setActiveTab('cart')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'cart'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Cart
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Orders
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 rounded-md shadow">
          {/* Authentication Tab */}
          {activeTab === 'auth' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Authentication</h2>

              {!currentUser ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Register Form */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Register</h3>
                    <form onSubmit={handleRegister}>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={registerForm.name}
                          onChange={handleRegisterChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={registerForm.email}
                          onChange={handleRegisterChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={registerForm.password}
                          onChange={handleRegisterChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={registerForm.role}
                          onChange={handleRegisterChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="vendor">Vendor</option>
                          <option value="org_owner">Organization Owner</option>
                          <option value="facility_manager">Facility Manager</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                          Phone
                        </label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={registerForm.phone}
                          onChange={handleRegisterChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                      >
                        {loading ? 'Registering...' : 'Register'}
                      </button>
                    </form>
                  </div>

                  {/* Login Form */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Login</h3>
                    <form onSubmit={handleLogin}>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loginEmail">
                          Email
                        </label>
                        <input
                          type="email"
                          id="loginEmail"
                          name="email"
                          value={loginForm.email}
                          onChange={handleLoginChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loginPassword">
                          Password
                        </label>
                        <input
                          type="password"
                          id="loginPassword"
                          name="password"
                          value={loginForm.password}
                          onChange={handleLoginChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div>
                  <p>You are already logged in as {currentUser.name}</p>
                  <button
                    onClick={handleLogout}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Vendor Profile Tab */}
          {activeTab === 'vendor' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Create Vendor Profile</h2>

              <form onSubmit={handleCreateVendorProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={vendorForm.companyName}
                      onChange={handleVendorChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gstNumber">
                      GST Number
                    </label>
                    <input
                      type="text"
                      id="gstNumber"
                      name="gstNumber"
                      value={vendorForm.gstNumber}
                      onChange={handleVendorChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="panNumber">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      id="panNumber"
                      name="panNumber"
                      value={vendorForm.panNumber}
                      onChange={handleVendorChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={vendorForm.description}
                      onChange={handleVendorChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Capabilities
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableServices"
                        name="enableServices"
                        checked={vendorForm.enableServices}
                        onChange={handleVendorChange}
                        className="mr-2"
                      />
                      <label htmlFor="enableServices" className="mr-4">Services</label>

                      <input
                        type="checkbox"
                        id="enableProducts"
                        name="enableProducts"
                        checked={vendorForm.enableProducts}
                        onChange={handleVendorChange}
                        className="mr-2"
                      />
                      <label htmlFor="enableProducts">Products</label>
                    </div>
                  </div>

                  {vendorForm.enableProducts && (
                    <div className="mb-4 col-span-2">
                      <h3 className="text-lg font-medium mb-2">Product Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="allowCOD">
                            Allow COD
                          </label>
                          <input
                            type="checkbox"
                            id="allowCOD"
                            name="allowCOD"
                            checked={vendorForm.productSettings.allowCOD}
                            onChange={handleVendorChange}
                            className="mr-2"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shippingCharge">
                            Shipping Charge
                          </label>
                          <input
                            type="number"
                            id="shippingCharge"
                            name="shippingCharge"
                            value={vendorForm.productSettings.shippingCharge}
                            onChange={handleVendorChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="freeShippingAbove">
                            Free Shipping Above
                          </label>
                          <input
                            type="number"
                            id="freeShippingAbove"
                            name="freeShippingAbove"
                            value={vendorForm.productSettings.freeShippingAbove}
                            onChange={handleVendorChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="returnPolicy">
                            Return Policy
                          </label>
                          <input
                            type="text"
                            id="returnPolicy"
                            name="returnPolicy"
                            value={vendorForm.productSettings.returnPolicy}
                            onChange={handleVendorChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {loading ? 'Creating...' : 'Create Vendor Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Vendor Dashboard</h2>

              {vendorProfile && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Company Information</h3>
                    <p><strong>Company Name:</strong> {vendorProfile.companyName}</p>
                    <p><strong>Description:</strong> {vendorProfile.description || 'Not provided'}</p>
                    <p><strong>GST Number:</strong> {vendorProfile.gstNumber || 'Not provided'}</p>
                    <p><strong>PAN Number:</strong> {vendorProfile.panNumber || 'Not provided'}</p>
                    <p><strong>Verification Status:</strong> {vendorProfile.verificationStatus}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Capabilities</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Services</span>
                          <span className={`px-2 py-1 rounded text-xs ${vendorProfile.capabilities.services.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {vendorProfile.capabilities.services.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        {vendorProfile.capabilities.services.enabled && (
                          <div>
                            <p><strong>Categories:</strong> {vendorProfile.capabilities.services.categories.length} categories</p>
                            <p><strong>Service Areas:</strong> {vendorProfile.capabilities.services.serviceAreas.join(', ')}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Products</span>
                          <span className={`px-2 py-1 rounded text-xs ${vendorProfile.capabilities.products.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {vendorProfile.capabilities.products.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        {vendorProfile.capabilities.products.enabled && (
                          <div>
                            <p><strong>Categories:</strong> {vendorProfile.capabilities.products.categories.length} categories</p>
                            <p><strong>Allow COD:</strong> {vendorProfile.capabilities.products.settings.allowCOD ? 'Yes' : 'No'}</p>
                            <p><strong>Shipping Charge:</strong> ₹{vendorProfile.capabilities.products.settings.shippingCharge}</p>
                            <p><strong>Free Shipping Above:</strong> ₹{vendorProfile.capabilities.products.settings.freeShippingAbove}</p>
                            <p><strong>Return Policy:</strong> {vendorProfile.capabilities.products.settings.returnPolicy}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      {!vendorProfile.capabilities.products.enabled && (
                        <button
                          onClick={handleEnableProductCapability}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          {loading ? 'Enabling...' : 'Enable Product Capability'}
                        </button>
                      )}

                      {vendorProfile.capabilities.products.enabled && (
                        <button
                          onClick={handleDisableProductCapability}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          {loading ? 'Disabling...' : 'Disable Product Capability'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
                    <p><strong>Overall Rating:</strong> {vendorProfile.ratings.overall.toFixed(1)}/5</p>
                    <p><strong>Service Rating:</strong> {vendorProfile.ratings.services.average.toFixed(1)}/5 ({vendorProfile.ratings.services.count} reviews)</p>
                    <p><strong>Product Rating:</strong> {vendorProfile.ratings.products.average.toFixed(1)}/5 ({vendorProfile.ratings.products.count} reviews)</p>
                    <p><strong>Completed Projects:</strong> {vendorProfile.completedProjects}</p>
                    <p><strong>Total Products Sold:</strong> {vendorProfile.totalProductsSold}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Products</h2>

              {vendorProfile && vendorProfile.capabilities.products.enabled ? (
                <div className="space-y-6">
                  {/* Create Product Form */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Create Product</h3>
                    <form onSubmit={handleCreateProduct}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productName">
                            Product Name
                          </label>
                          <input
                            type="text"
                            id="productName"
                            name="name"
                            value={productForm.name}
                            onChange={handleProductChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sku">
                            SKU
                          </label>
                          <input
                            type="text"
                            id="sku"
                            name="sku"
                            value={productForm.sku}
                            onChange={handleProductChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                            Category
                          </label>
                          <select
                            id="category"
                            name="category"
                            value={productForm.category}
                            onChange={handleProductChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                          >
                            <option value="">Select a category</option>
                            {productCategories.map(category => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                            Price
                          </label>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={productForm.price}
                            onChange={handleProductChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="inventory">
                            Inventory
                          </label>
                          <input
                            type="number"
                            id="inventory"
                            name="inventory"
                            value={productForm.inventory}
                            onChange={handleProductChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
                            Tags
                          </label>
                          <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={productForm.tags}
                            onChange={handleProductChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="tag1, tag2, tag3"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={productForm.description}
                          onChange={handleProductChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          rows="3"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        {loading ? 'Creating...' : 'Create Product'}
                      </button>
                    </form>
                  </div>

                  {/* Products List */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Your Products</h3>
                    {products.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SKU
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Inventory
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {products.map(product => (
                              <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{product.sku}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">₹{product.variants[0]?.price || 0}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{product.variants[0]?.inventory || 0}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                    }`}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>No products found. Create your first product above.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Product capability is not enabled.</p>
                  <button
                    onClick={handleEnableProductCapability}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {loading ? 'Enabling...' : 'Enable Product Capability'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>

              {cart && cart.items.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cart.items.map(item => (
                          <tr key={item._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-500">Variant: {item.variant.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">₹{item.price}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{item.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">₹{item.price * item.quantity}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-medium">Subtotal: ₹{cart.totalAmount}</p>
                    {cart.discountAmount > 0 && (
                      <p className="text-lg font-medium">Discount: ₹{cart.discountAmount}</p>
                    )}
                    <p className="text-xl font-bold">Total: ₹{cart.totalAmount - cart.discountAmount}</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Your cart is empty.</p>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Browse Products
                  </button>
                </div>
              )}

              {/* Add to Cart Form */}
              <div className="mt-8 border-t pt-8">
                <h3 className="text-lg font-medium mb-3">Add Item to Cart</h3>
                <form onSubmit={handleAddToCart}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productId">
                        Product
                      </label>
                      <select
                        id="productId"
                        name="productId"
                        value={cartForm.productId}
                        onChange={handleCartChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="variantId">
                        Variant
                      </label>
                      <select
                        id="variantId"
                        name="variantId"
                        value={cartForm.variantId}
                        onChange={handleCartChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option value="">Select a variant</option>
                        {products.find(p => p._id === cartForm.productId)?.variants?.map(variant => (
                          <option key={variant._id} value={variant._id}>
                            {variant.name} - ₹{variant.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={cartForm.quantity}
                        onChange={handleCartChange}
                        min="1"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>

                    <div className="mb-4 flex items-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                      >
                        {loading ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Orders</h2>

              {/* Create Order Form */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Create Order</h3>
                <form onSubmit={handleCreateOrder}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="shippingAddress.name"
                        value={orderForm.shippingAddress.name}
                        onChange={handleOrderChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                        Phone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="shippingAddress.phone"
                        value={orderForm.shippingAddress.phone}
                        onChange={handleOrderChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="addressLine1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="shippingAddress.addressLine1"
                        value={orderForm.shippingAddress.addressLine1}
                        onChange={handleOrderChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="shippingAddress.city"
                        value={orderForm.shippingAddress.city}
                        onChange={handleOrderChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="shippingAddress.state"
                        value={orderForm.shippingAddress.state}
                        onChange={handleOrderChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postalCode">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="shippingAddress.postalCode"
                        value={orderForm.shippingAddress.postalCode}
                        onChange={handleOrderChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={orderForm.paymentMethod}
                        onChange={handleOrderChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="cod">Cash on Delivery</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !cart || cart.items.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {loading ? 'Creating...' : 'Create Order'}
                  </button>
                </form>
              </div>

              {/* Orders List */}
              <div>
                <h3 className="text-lg font-medium mb-3">Your Orders</h3>
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">₹{order.totalAmount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No orders found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestMarketplace;