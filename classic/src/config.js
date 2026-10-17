// Site-wide settings. Edit these before going live.
module.exports = {
  // Public URL of the site, used for canonical links, hreflang and the sitemap (no trailing slash).
  siteUrl: 'https://www.tersun.com',

  languages: ['en', 'de', 'sq'],
  defaultLanguage: 'en',

  company: {
    name: 'TERSUN',
    tagline: 'Beyond Outdoor Living',
    // TODO: replace with the real contact details.
    email: 'info@tersun.com',
    phone: '+383 00 000 000',
    address: 'Prishtinë, Kosovë',
    social: {
      instagram: '',
      facebook: '',
      linkedin: ''
    }
  },

  // Where configurator and contact requests are sent.
  // Leave empty to fall back to opening the visitor's e-mail client (mailto:).
  // Works with any endpoint that accepts a JSON POST, e.g. Formspree (https://formspree.io/f/xxxx),
  // Web3Forms, Basin or your own backend.
  formEndpoint: ''
};
