/**
 * 运行时配置管理
 * 从 Cloudflare Worker 获取环境变量
 */

let configCache = null;
let configPromise = null;

/**
 * 获取运行时配置
 * @returns {Promise<{OPENROUTER_API_KEY: string, DEEPSEEK_API_KEY: string}>}
 */
export async function getConfig() {
  // 如果已经有缓存，直接返回
  if (configCache) {
    return configCache;
  }

  // 如果正在请求中，返回同一个 Promise
  if (configPromise) {
    return configPromise;
  }

  // 开始新的请求
  configPromise = (async () => {
    try {
      console.log('[Config] Environment:', import.meta.env.MODE, 'PROD:', import.meta.env.PROD);

      // 在生产环境（Cloudflare Workers）中从 API 获取配置
      if (import.meta.env.PROD) {
        console.log('[Config] Fetching config from /api/config...');
        const response = await fetch('/api/config');
        console.log('[Config] Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }

        const config = await response.json();
        console.log('[Config] Received config:', {
          hasOpenRouterKey: !!config.OPENROUTER_API_KEY,
          hasDeepSeekKey: !!config.DEEPSEEK_API_KEY,
          openRouterKeyLength: config.OPENROUTER_API_KEY?.length || 0,
        });

        configCache = config;
        return config;
      }

      // 在开发环境中使用 Vite 的环境变量
      console.log('[Config] Using dev environment variables');
      configCache = {
        OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER1_API_KEY || '',
        DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
      };
      console.log('[Config] Dev config:', {
        hasOpenRouterKey: !!configCache.OPENROUTER_API_KEY,
        hasDeepSeekKey: !!configCache.DEEPSEEK_API_KEY,
      });
      return configCache;
    } catch (error) {
      console.error('[Config] Failed to load config:', error);
      // 返回空配置作为降级方案
      configCache = {
        OPENROUTER_API_KEY: '',
        DEEPSEEK_API_KEY: '',
      };
      return configCache;
    } finally {
      configPromise = null;
    }
  })();

  return configPromise;
}

/**
 * 清除配置缓存（用于测试或重新加载）
 */
export function clearConfigCache() {
  configCache = null;
  configPromise = null;
}

