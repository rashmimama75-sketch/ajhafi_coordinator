/*
 * AjahFi API layer — single place that talks to the backend.
 * Change API_BASE here if the backend URL ever changes.
 */
(function (global) {
    'use strict';

    var API_BASE = 'https://backend-goat.onrender.com';

    var TOKEN_KEY = 'ajahfi_token';
    var PROFILE_KEY = 'ajahfi_auth';

    var AjahFiAPI = {
        base: API_BASE,

        // --- token helpers ---
        getToken: function () {
            try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
        },
        setToken: function (token) {
            try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
        },
        setProfile: function (obj) {
            try { localStorage.setItem(PROFILE_KEY, JSON.stringify(obj)); } catch (e) {}
        },
        getProfile: function () {
            try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) { return null; }
        },
        clearSession: function () {
            try {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(PROFILE_KEY);
            } catch (e) {}
        },
        isLoggedIn: function () {
            return !!this.getToken();
        },

        // Turn a "/media/xxx.jpg" path from the API into a full URL.
        mediaUrl: function (path) {
            if (!path) { return ''; }
            if (/^https?:\/\//.test(path)) { return path; }
            return this.base + (path.charAt(0) === '/' ? path : '/' + path);
        },

        // --- core request ---
        // opts: { method, body, auth (default true) }
        request: function (path, opts) {
            opts = opts || {};
            var method = opts.method || 'GET';
            var auth = opts.auth !== false;
            var headers = { 'Content-Type': 'application/json' };

            if (auth) {
                var t = this.getToken();
                if (t) { headers['Authorization'] = 'Bearer ' + t; }
            }

            var self = this;
            return fetch(this.base + path, {
                method: method,
                headers: headers,
                body: opts.body ? JSON.stringify(opts.body) : undefined
            }).then(function (res) {
                // Session expired / not authorised → back to login
                if (res.status === 401) {
                    self.clearSession();
                    if (!/login\.html$/.test(window.location.pathname)) {
                        window.location.replace('login.html');
                    }
                    throw new Error('Session expired. Please sign in again.');
                }
                return res.json().catch(function () { return null; }).then(function (data) {
                    if (!res.ok) {
                        var msg = data && (data.detail || data.reason || data.message);
                        if (msg && typeof msg !== 'string') { msg = JSON.stringify(msg); }
                        throw new Error(msg || ('Request failed (HTTP ' + res.status + ')'));
                    }
                    return data;
                });
            });
        },

        get: function (path) {
            return this.request(path, { method: 'GET' });
        },
        post: function (path, body, opts) {
            opts = opts || {};
            opts.method = 'POST';
            opts.body = body;
            return this.request(path, opts);
        },

        // --- auth convenience ---
        login: function (mobileNumber, password, role) {
            var self = this;
            return this.post('/auth/login_password', {
                mobile_number: mobileNumber,
                password: password,
                role: role || 'co'
            }, { auth: false }).then(function (data) {
                if (data && data.status === 'success' || (data && data.access_token)) {
                    self.setToken(data.access_token);
                }
                return data;
            });
        },
        logout: function () {
            var self = this;
            return this.post('/auth/logout', {}).catch(function () {}).then(function () {
                self.clearSession();
            });
        }
    };

    global.AjahFiAPI = AjahFiAPI;
})(window);
