// interceptor to auto get new access token when old expires
// and when refresh token expires - redirect to login
import useAuthStore from "../../store/authStore";

const api = async (url, options = {}) => {
    const authStore = useAuthStore.getState(); // Get current state outside React component

    // Add authorization header if access token exists and is not already set
    if (authStore.accessToken && !options.headers?.Authorization) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${authStore.accessToken}`,
        };
    }

    // Default to include cookies for all requests
    options.credentials = options.credentials || "include"; 

    let response = await fetch(url, options);

    // If the response is 401 Unauthorized, it's not a token refresh endpoint itself,
    // and it's not already a retry attempt.
    if (response.status === 401 && !url.includes('/token/') && !options._isRetry) {
        try {
            console.log("Access token expired. Attempting to refresh...");
            const newAccessToken = await authStore.getNewAccessToken(); // Try to get a new token
            console.log("Access token refreshed. Retrying original request...");

            // *** CHANGED PART START ***

            // Create a new options object for the retry request to avoid mutation.
            const retryOptions = {
                ...options, // Copy all original options (method, body, etc.)
                headers: {
                    ...options.headers, // Copy original headers
                    'Authorization': `Bearer ${newAccessToken}`, // Overwrite with the new token
                },
                _isRetry: true, // Mark this as a retry to prevent infinite loops
            };
            
            response = await fetch(url, retryOptions); // Retry the request with the new options

            // *** CHANGED PART END ***

        } catch (error) {
            console.error("Refresh token failed, redirecting to login:", error);
            authStore.logout(); // Clear state and user data
            
            // The ProtectedRoutes component will handle the UI redirect.
            // Throw an error to stop the promise chain of the original caller.
            throw new Error("Authentication session expired. Please log in again.");
        }
    }

    return response;
};

export default api;