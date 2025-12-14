import { create } from "zustand";

const useStore = create((set) => ({
  cart: [],
  wishlist: [],

  addToCart: (product) => {
    set((state) => {
      const existingItem = state.cart.find(
        (item) => item.id === product._id || item.id === product.id
      );
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        cart: [
          ...state.cart,
          {
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            images: product.images || [],
            quantity: 1,
          },
        ],
      };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    }));
  },

  updateCartQuantity: (productId, quantity) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  getCartTotal: () => {
    return useStore
      .getState()
      .cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  toggleWishlist: (product) => {
    set((state) => {
      const isInWishlist = state.wishlist.some(
        (item) => item.id === product._id || item.id === product.id
      );
      if (isInWishlist) {
        return {
          wishlist: state.wishlist.filter(
            (item) => item.id !== (product._id || product.id)
          ),
        };
      }
      return {
        wishlist: [
          ...state.wishlist,
          {
            id: product._id || product.id,
            name: product.name,
            price: product.price,
          },
        ],
      };
    });
  },

  isInWishlist: (productId) => {
    return useStore.getState().wishlist.some((item) => item.id === productId);
  },
}));

export default useStore;
