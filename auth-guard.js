/*
 * AjahFi client-side auth gate.
 * NOTE: This is a demo gate only — it just checks a flag saved in the browser.
 * It is NOT real security. Replace this with a real token/session check once
 * the backend is connected (e.g. validate a JWT with the API).
 *
 * Included at the top of every protected page's <head> so it runs before the
 * dashboard renders and redirects to the login page when not signed in.
 */
(function () {
    try {
        if (!localStorage.getItem('ajahfi_auth')) {
            window.location.replace('login.html');
        }
    } catch (e) {
        window.location.replace('login.html');
    }
})();
