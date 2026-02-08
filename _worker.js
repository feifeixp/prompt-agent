/**
 * Cloudflare Worker for serving static assets with environment variable support
 * This replaces the static assets mode to enable environment variable configuration
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API proxy for environment variables
    // This allows the frontend to access environment variables securely
    if (url.pathname === '/api/config') {
      return new Response(JSON.stringify({
        VITE_DEEPSEEK_API_KEY: env.VITE_DEEPSEEK_API_KEY || '',
        VITE_OPENROUTER1_API_KEY: env.VITE_OPENROUTER1_API_KEY || '',
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Serve static assets from the dist directory
    try {
      // Get the asset from the assets binding
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
};

