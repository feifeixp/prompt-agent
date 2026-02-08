/**
 * 用户认证工具函数
 * 基于验证码的手机号/邮箱登录
 */

const AUTH_STORAGE_KEY = 'seedance-auth'

// API 基础路径 - 根据文档使用正确的路径
const API_BASE = 'https://story.neodomain.cn/user/login'

/**
 * 发送验证码
 * @param {string} contact - 手机号或邮箱
 * @returns {Promise<{success: boolean, errCode?: string, errMessage?: string}>}
 */
export async function sendVerificationCode(contact) {
  const res = await fetch(`${API_BASE}/send-unified-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact }),
  })
  return res.json()
}

/**
 * 统一登录（验证码登录）
 * @param {string} contact - 手机号或邮箱
 * @param {string} code - 6位验证码
 * @param {string} [invitationCode] - 邀请码（可选）
 * @returns {Promise<{success: boolean, data?: object, errCode?: string, errMessage?: string}>}
 */
export async function login(contact, code, invitationCode) {
  const body = { contact, code }
  if (invitationCode) body.invitationCode = invitationCode

  console.log('登录请求参数:', body) // 调试日志
  console.log('登录请求 URL:', `${API_BASE}/unified-login`) // 调试日志

  const res = await fetch(`${API_BASE}/unified-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const result = await res.json()
  console.log('登录响应:', result) // 调试日志

  return result
}

/**
 * 验证手机号格式
 * @param {string} value
 * @returns {boolean}
 */
export function isPhone(value) {
  return /^1[3-9]\d{9}$/.test(value)
}

/**
 * 验证邮箱格式
 * @param {string} value
 * @returns {boolean}
 */
export function isEmail(value) {
  return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)
}

/**
 * 验证联系方式（手机号或邮箱）
 * @param {string} value
 * @returns {boolean}
 */
export function isValidContact(value) {
  return isPhone(value) || isEmail(value)
}

/**
 * 保存认证信息到 localStorage
 * @param {object} authData - 包含 authorization, userId, email, mobile, nickname, avatar, status
 */
export function saveAuth(authData) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
}

/**
 * 从 localStorage 获取认证信息
 * @returns {object|null}
 */
export function getStoredAuth() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/**
 * 清除认证信息
 */
export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

/**
 * 检查是否已认证
 * @returns {boolean}
 */
export function isAuthenticated() {
  const auth = getStoredAuth()
  return !!(auth && auth.authorization)
}

/**
 * 获取用户会员信息
 * @returns {Promise<{isMember: boolean, membershipInfo?: object, error?: string}>}
 */
export async function getMembershipInfo() {
  const auth = getStoredAuth()

  if (!auth || !auth.authorization) {
    console.log('会员检查: 未登录')
    return { isMember: false, error: 'Not authenticated' }
  }

  // 注意：登录接口返回的 status 是账号状态（0-未激活, 1-正常, 2-禁用）
  // 不是会员状态！所有正常用户都是 status: 1
  // 真正的会员状态需要通过 /agent/user/points/info API 获取

  console.log('会员检查: 开始请求 API')
  console.log('会员检查: Token', auth.authorization)

  try {
    // 根据 OSS-STS令牌接口文档，后端使用 accessToken 请求头
    const res = await fetch('https://story.neodomain.cn/agent/user/points/info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accessToken': auth.authorization
      }
    })

    const result = await res.json()
    console.log('会员检查: API 响应', result)

    if (result.success && result.data?.membershipInfo) {
      const { membershipInfo } = result.data
      // 判断是否为会员：
      // 1. levelCode 不是 'BASIC'（BASIC 是免费用户）
      // 2. statusDesc 不是 '免费用户'
      // 3. 或者 membershipType 存在且大于 0（1=月付, 2=年付）
      const isMember = (
        membershipInfo.levelCode !== 'BASIC' &&
        membershipInfo.statusDesc !== '免费用户' &&
        membershipInfo.status === 1
      ) || (
        membershipInfo.membershipType && membershipInfo.membershipType > 0
      )
      console.log('会员检查: 会员状态（来自API）', isMember, membershipInfo)
      return { isMember, membershipInfo }
    }

    // API 调用失败，默认为非会员
    console.log('会员检查: API 调用失败，默认为非会员')
    return { isMember: false, error: result.errMessage || 'API failed' }
  } catch (e) {
    console.error('会员检查: 请求异常', e)
    // 发生异常，默认为非会员
    return { isMember: false, error: e.message }
  }
}

