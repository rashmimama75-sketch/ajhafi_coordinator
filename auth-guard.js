/*
 * AjahFi auth gate.
 * Checks for the backend access token saved at login. If it's missing, the
 * user isn't signed in, so we redirect to the login page before the dashboard
 * renders. (The token itself is validated by the backend on every API call;
 * a 401 there also bounces the user back to login — see api.js.)
 *
 * Included at the top of every protected page's <head>.
 */
(function () {
    try {
        if (!localStorage.getItem('ajahfi_token')) {
            window.location.replace('login.html');
        }
    } catch (e) {
        window.location.replace('login.html');
    }
})();
