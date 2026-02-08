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
      // 在生产环境（Cloudflare Workers）中从 API 获取配置
      if (import.meta.env.PROD) {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const config = await response.json();
        configCache = config;
        return config;
      }
      
      // 在开发环境中使用 Vite 的环境变量
      configCache = {
        OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER1_API_KEY || '',
        DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
      };
      return configCache;
    } catch (error) {
      console.error('Failed to load config:', error);
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

