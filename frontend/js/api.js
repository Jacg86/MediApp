// ================================================================
//  API Client — Módulo central para comunicación con el backend
//  Maneja tokens JWT, errores y fetch automatizado
// ================================================================

const API_BASE = 'http://localhost:3000/api';

const API = {
    /**
     * Obtener headers con token JWT si existe
     */
    _getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('mediapp_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    /**
     * Procesar respuesta del servidor
     */
    async _handleResponse(response) {
        const data = await response.json();

        if (response.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('mediapp_token');
            localStorage.removeItem('mediapp_usuario');
            if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                window.location.href = '/index.html';
            }
            throw new Error(data.message || 'Sesión expirada');
        }

        if (!response.ok) {
            const error = new Error(data.message || 'Error en la solicitud');
            error.data = data;
            error.status = response.status;
            throw error;
        }

        return data;
    },

    /**
     * GET request
     */
    async get(endpoint) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    },

    /**
     * POST request
     */
    async post(endpoint, body) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify(body),
        });
        return this._handleResponse(response);
    },

    /**
     * PUT request
     */
    async put(endpoint, body) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: this._getHeaders(),
            body: JSON.stringify(body),
        });
        return this._handleResponse(response);
    },

    /**
     * DELETE request
     */
    async delete(endpoint) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    },
};

// ── Helpers de autenticación ─────────────────────────────────────

function guardarSesion(token, usuario) {
    localStorage.setItem('mediapp_token', token);
    localStorage.setItem('mediapp_usuario', JSON.stringify(usuario));
}

function obtenerUsuario() {
    const data = localStorage.getItem('mediapp_usuario');
    return data ? JSON.parse(data) : null;
}

function cerrarSesion() {
    localStorage.removeItem('mediapp_token');
    localStorage.removeItem('mediapp_usuario');
    window.location.href = '/index.html';
}

function estaAutenticado() {
    return !!localStorage.getItem('mediapp_token');
}

function requiereAuth() {
    if (!estaAutenticado()) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}
