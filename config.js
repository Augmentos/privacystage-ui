/* ===========================================================================
   PrivacyStage: site configuration
   Edit these values. Nothing secret lives here (the Paddle client token is a
   PUBLISHABLE token, safe for the browser). Your Ed25519 PRIVATE key and the
   key-minting webhook live on a server (see PADDLE_SETUP.md in the app repo, not
   this one — never commit it here).
   =========================================================================== */
window.PRIVACYSTAGE_CONFIG = {
  paddle: {
    /* "sandbox" while testing, "production" when live. */
    environment: "sandbox",

    /* Paddle client-side token (starts with "test_" or "live_").
       Paddle dashboard → Developer tools → Authentication → Client-side tokens. */
    token: "__PADDLE_CLIENT_TOKEN__",

    /* The price you created in Paddle for PrivacyStage (starts with "pri_"). */
    priceId: "__PADDLE_PRICE_ID__",
  },

  /* Where the "Download the free trial" buttons point (your notarized .dmg). */
  downloadUrl: "https://github.com/Augmentos/privacystage-ui/releases/latest/download/PrivacyStage.dmg",

  /* Optional: URL Paddle sends the buyer to after a successful payment.
     Leave as-is to use the bundled success page. */
  successUrl: "success.html",
};
