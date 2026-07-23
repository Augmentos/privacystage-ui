/* ===========================================================================
   PrivacyStage: site configuration
   Edit these values. Nothing secret lives here (the Paddle client token is a
   PUBLISHABLE token, safe for the browser). Your Ed25519 PRIVATE key and the
   key-minting webhook live on a server; see PADDLE_SETUP.md.
   =========================================================================== */
window.PRIVACYSTAGE_CONFIG = {
  paddle: {
    /* "sandbox" while testing, "production" when live. */
    environment: "production",

    /* Paddle client-side token (starts with "test_" or "live_").
       Paddle dashboard → Developer tools → Authentication → Client-side tokens. */
    token: "live_6806cbadd3ab9f42fa5d4c0c97d",

    /* The price you created in Paddle for PrivacyStage (starts with "pri_"). */
    priceId: "pri_01ky471rqnh879xck8va58t2j3",
  },

  /* Where the "Download the free trial" buttons point. This goes through the
     license Worker's /download route, which logs each hit (timestamp, country,
     referrer) then 302-redirects to the latest notarized .dmg on GitHub. Query
     download stats with: wrangler kv key list --binding LICENSES --prefix "dl:" */
  downloadUrl: "https://privacystage-license.kalipsomatters.workers.dev/download",

  /* Optional: URL Paddle sends the buyer to after a successful payment.
     Leave as-is to use the bundled success page. */
  successUrl: "success.html",
};
