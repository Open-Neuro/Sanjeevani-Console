
const LOCAL_URL = 'http://localhost:8000/api/v1';
const DEPLOYED_URL = 'https://sanjeevani-engine.onrender.com/api/v1';

/**
 * Returns the base URL for the API.
 * Priority: 
 * 1. localStorage override (SANJEEVANI_API_URL)
 * 2. Vite env config (VITE_API_BASE_URL)
 * 3. Deployed render URL fallback
 */
export const getApiBaseUrl = (): string => {
    const override = localStorage.getItem('SANJEEVANI_API_URL')?.trim();
    if (override) return override;

    const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
    if (envUrl) return envUrl;

    return DEPLOYED_URL;
};

export const getConfiguredApiBaseUrl = (): string => DEPLOYED_URL;

export const isUsingLocal = (): boolean => {
    return getApiBaseUrl().includes('localhost') || getApiBaseUrl().includes('127.0.0.1');
};

export const switchToLocal = () => {
    localStorage.setItem('SANJEEVANI_API_URL', LOCAL_URL);
    window.location.reload();
};

export const switchToDeployed = () => {
    localStorage.removeItem('SANJEEVANI_API_URL');
    window.location.reload();
};
