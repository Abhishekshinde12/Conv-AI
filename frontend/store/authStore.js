import { create } from 'zustand'

let isRefreshing = false; // Flag to prevent multiple refresh token calls simultaneously
let refreshPromise = null; // Store the promise of the refresh token call

const useAuthStore = create((set, get) => ({

    // auth details
    // refreshToken: null, # setted as an Http Only Cookie 
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isAuthLoading: true,

    // Helper to sync user details to localStorage
    _setUserAndPersist: (userData) => {
        set({ user: userData });
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    },

    // register function to handle the registration of new user
    register: async ({ first_name, last_name, email, password, user_type }) => {
        try {
            const url = `/auth/user_register/`
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ first_name, last_name, email, password, user_type })
            })
            if (!response.ok) throw new Error("Registration Failed")
            return response
        }
        catch (error) {
            console.log(error)
            throw error
        }
    },

    // to login the users
    // as user still not authenticate --> no cookie set ---> so no need to send cookie
    login: async ({ email, password }) => {
        try {
            const url = `/auth/token/`
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (!response.ok) {
                const errorData = await response.json(); // Attempt to parse error message
                throw new Error(errorData.detail || "Login Failed")
            }
            
            const data = await response.json()

            // Use helper function
            // Store user in state and localStorage
            get()._setUserAndPersist(data.user); 

            set({
                user: {...data.user},
                accessToken: data.access_token,
                isAuthenticated: true
            })

            return response
        }
        catch (error) {
            console.log(error)
            throw error
        }
    },

    // Function to get new access token when old one expires
    getNewAccessToken: async () => {
        
        // if multiple calls comes, and we are already processing one
        // return the earlier promise itself
        if (isRefreshing && refreshPromise) {
            return refreshPromise;
        }

        // else - making first refresh call
        // mark by isRefreshing = True
        isRefreshing = true;
        
        // here we send the cookies 
        refreshPromise = (async () => {
            try {
                const url = `/auth/token/refresh/`
                const response = await fetch(url, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include" // tells browser to include cookies, auth headers, etc.
                });

                if (!response.ok) {
                    throw new Error("Failed refreshing token")
                }

                const data = await response.json()
                set({ accessToken: data.access_token, isAuthenticated: true });

                return data.access_token
            }
            catch (error) {
                console.error("Error refreshing token:", error);
                get()._setUserAndPersist(null); // Clear user from state and localStorage
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false
                });
                throw error
            }
            finally {
                isRefreshing = false; // is auth done, set to false
                refreshPromise = null; // clearing promise
            }
        })();
        // started refresh promise immediately and returning it
        return refreshPromise;
    },

    // to initialize the auth when a page refresh happens
    // the user comes back online
    initializeAuth: async () => {
        const { getNewAccessToken, isAuthenticated } = get();

        // If already authenticated or loading, no need to initialize
        if (isAuthenticated && get().user && !get().isAuthLoading) {
            set({ isAuthLoading: false });
            return;
        }

        set({ isAuthLoading: true });

        try {
            await getNewAccessToken(); // This will update accessToken and isAuthenticated
            // If getNewAccessToken succeeded, now retrieve user from localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                get()._setUserAndPersist(JSON.parse(storedUser)); // Set user from localStorage to the state
            } else {
                // This scenario means refresh token worked, but no user data was stored.
                // It's a valid state if you only store user on explicit login
                // or if refresh token endpoint doesn't return user.
                // We just let isAuthenticated guide it.
            }
        } catch (error) {
            console.log("No valid refresh token found or refresh failed. User needs to log in.");
            get()._setUserAndPersist(null); // Clear user
            set({ accessToken: null, isAuthenticated: false });
        } finally {
            set({ isAuthLoading: false });
        }
    },

    // as we are logging out so no need to provide acess token here
    logout: async () => {
        try {

            const url = `/auth/logout/`
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error("Logout Failed on Server.")
            }
            
            // Clear user from state and localStorage
            get()._setUserAndPersist(null);

            set({
                user: null,
                accessToken: null,
                isAuthenticated: false
            });

            return response
        }
        catch (error) {
            console.error("Error in loggint out : ", error);
            // Clear state and localStorage anyway on error for security
            get()._setUserAndPersist(null);
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false
            });
            throw error
        }
    },
}))


export default useAuthStore;