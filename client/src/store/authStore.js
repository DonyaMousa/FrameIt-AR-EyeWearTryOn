import { create } from "zustand";

// Simple persist using localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("auth-storage");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify({
      adminToken: state.adminToken,
      admin: state.admin,
      userToken: state.userToken,
      user: state.user,
    });
    localStorage.setItem("auth-storage", serializedState);
  } catch (err) {
    console.error("Error saving auth state:", err);
  }
};

const useAuthStore = create((set, get) => {
  // Load initial state from localStorage
  const initialState = loadState() || {
    adminToken: null,
    admin: null,
    userToken: null,
    user: null,
  };

  return {
    ...initialState,

    // Admin actions
    setAdminToken: (token) => {
      console.log(
        "Setting admin token:",
        token ? "Token set" : "Token cleared"
      );
      set({ adminToken: token });
      saveState(get());
    },
    setAdmin: (admin) => {
      set({ admin });
      saveState(get());
    },
    clearAdmin: () => {
      set({ adminToken: null, admin: null });
      saveState(get());
    },

    // User actions
    setUserToken: (token) => {
      set({ userToken: token });
      saveState(get());
    },
    setUser: (user) => {
      set({ user });
      saveState(get());
    },
    clearUser: () => {
      set({ userToken: null, user: null });
      saveState(get());
    },

    // Combined actions
    logout: () => {
      set({
        adminToken: null,
        admin: null,
        userToken: null,
        user: null,
      });
      saveState(get());
    },

    // Getters
    isAdminAuthenticated: () => {
      return get().adminToken !== null;
    },
    isUserAuthenticated: () => {
      return get().userToken !== null;
    },
    getToken: () => {
      const state = get();
      return state.adminToken || state.userToken;
    },
  };
});

export default useAuthStore;
