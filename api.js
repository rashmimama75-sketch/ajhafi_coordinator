/*
 * AjahFi API layer — single place that talks to the backend.
 * Change API_BASE here if the backend URL ever changes.
 */
(function (global) {
    'use strict';

    var API_BASE = 'https://ajahfi.goatbank.co';

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
        // opts: { method, body, auth (default true), retries }
        // Automatically retries transient failures (network errors / 502-504),
        // which is what happens while a sleeping Render backend is waking up.
        request: function (path, opts) {
            opts = opts || {};
            var method = opts.method || 'GET';
            var auth = opts.auth !== false;
            var self = this;

            // Only auto-retry safe (GET) requests on network errors, so a POST
            // that may already have been processed is never sent twice. All
            // requests retry on explicit 502/503/504 (server not ready yet).
            var isGet = method === 'GET';
            var maxRetries = (opts.retries != null) ? opts.retries : 4;
            var backoff = [1500, 3000, 5000, 8000]; // ms between attempts

            function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

            function attempt(n) {
                var headers = { 'Content-Type': 'application/json' };
                if (auth) {
                    var t = self.getToken();
                    if (t) { headers['Authorization'] = 'Bearer ' + t; }
                }
                return fetch(self.base + path, {
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
                    // Server waking up / temporarily unavailable → retry
                    if ((res.status === 502 || res.status === 503 || res.status === 504) && n < maxRetries) {
                        return wait(backoff[Math.min(n, backoff.length - 1)]).then(function () { return attempt(n + 1); });
                    }
                    return res.json().catch(function () { return null; }).then(function (data) {
                        if (!res.ok) {
                            var msg = data && (data.detail || data.reason || data.message);
                            if (msg && typeof msg !== 'string') { msg = JSON.stringify(msg); }
                            throw new Error(msg || ('Request failed (HTTP ' + res.status + ')'));
                        }
                        return data;
                    });
                }, function (netErr) {
                    // Network-level failure (offline, or backend still cold)
                    if (isGet && n < maxRetries) {
                        return wait(backoff[Math.min(n, backoff.length - 1)]).then(function () { return attempt(n + 1); });
                    }
                    throw new Error('Could not reach the server. It may be waking up — please wait a moment and refresh.');
                });
            }

            return attempt(0);
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

    // --- Fill the header name/photo from the logged-in coordinator profile ---
    function initHeaderProfile() {
        if (!AjahFiAPI.getToken()) { return; }
        AjahFiAPI.get('/coordinator/profile').then(function (p) {
            if (!p) { return; }
            if (p.full_name) {
                document.querySelectorAll('.profile-name').forEach(function (el) {
                    el.textContent = p.full_name.trim();
                });
            }
            if (p.photo) {
                var url = AjahFiAPI.mediaUrl(p.photo);
                document.querySelectorAll('.profile-trigger img, .avatar-img, .profile-avatar').forEach(function (img) {
                    if (img.tagName === 'IMG') { img.src = url; }
                });
            }
        }).catch(function () { /* header is cosmetic; ignore failures */ });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderProfile);
    } else {
        initHeaderProfile();
    }
})(window);
