# Vue-Reading
基于Vue+element-ui+express开发的读书管理后台

## 前端
- Vue 
- Element-ui 
- vue-element-admin
## 后端
- Node
- Express
- MySQL数据库

## 1. vue-element-admin的路由和权限控制

### 已经获取到token：
- 访问`/login`:重定向到`/`
- 访问`/login?redirect=/xxx`,重定向到`/xxx`
- 访问`/login`以外的路由，直接访问`/xxx`

### 未获取到token:
- 访问`/login`，直接访问`/login`
- 访问`/login`以外的路由，如访问`/dashboard`,实际访问路径为`/login？`
- 访问`/login`以外的路由：如访问`/dashboard`，实际访问路径为`/login?redirect=%2Fdashboard`，登录后会直接重定向`/dashborad`

### 路由逻辑源码
> permission 定义了全局路由守卫
```
router.beforeEach(async(to, from, next) => {
  // 启动进度条
  NProgress.start()

  // 修改页面标题
  document.title = getPageTitle(to.meta.title)

  // 从 Cookie 获取 Token
  const hasToken = getToken()

  // 判断 Token 是否存在
  if (hasToken) {
    // 如果当前路径为 login 则直接重定向至首页
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // 判断用户的角色是否存在
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      // 如果用户角色存在，则直接访问
      if (hasRoles) {
        next()
      } else {
        try {
          // 异步获取用户的角色
          const { roles } = await store.dispatch('user/getInfo')
          // 根据用户角色，动态生成路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          // 调用 router.addRoutes 动态添加路由
          router.addRoutes(accessRoutes)
          // 使用 replace 访问路由，不会在 history 中留下记录
          next({ ...to, replace: true })
        } catch (error) {
          // 移除 Token 数据
          await store.dispatch('user/resetToken')
          // 显示错误提示
          Message.error(error || 'Has Error')
          // 重定向至登录页面
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // 如果访问的 URL 在白名单中，则直接访问
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      // 如果访问的 URL 不在白名单中，则直接重定向到登录页面，并将访问的 URL 添加到 redirect 参数中
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 停止进度条
  NProgress.done()
})
```
### 动态路由源码分析
```
import { asyncRoutes, constantRoutes } from '@/router'

generateRoutes({ commit }, roles) {
  // 返回 Promise 对象
  return new Promise(resolve => {
    let accessedRoutes
    if (roles.includes('admin')) {
      // 如果角色中包含 admin，则直接跳过判断，直接将 asyncRoutes 全部返回
      accessedRoutes = asyncRoutes || []
    } else {
      // 如果角色中没有包含 admin，则调用 filterAsyncRoutes 过滤路由
      accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
    }
    // 将路由保存到 vuex 中
    commit('SET_ROUTES', accessedRoutes)
    resolve(accessedRoutes)
  })
}
```
### `SET_ROUTES`方法源码如下:
```
SET_ROUTES: (state, routes) => {
  // 将 routes 保存到 state 中的 addRoutes
  state.addRoutes = routes
  // 将 routes 集成到 src/router/index.js 的 constantRoutes 中
  state.routes = constantRoutes.concat(routes)
}
```
### 路由过滤的方法 `filterAsyncRoutes`源码如下：
```
/**
 * @params routes - 异步加载的路由
 * @params roles - 用户的角色，数组形式
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  // 遍历全部路由
  routes.forEach(route => {
    // 对路由进行浅拷贝，注意 children 不会拷贝，因为不需要对 children 进行判断，所以可以使用浅拷贝
    const tmp = { ...route }
    // 检查用户角色是否具备访问路由的权限
    if (hasPermission(roles, tmp)) {
      // 当路由具有访问权限时，判断路由是否具备 children 属性
      if (tmp.children) {
        // 当路由包含 children 时，对 children 迭代调用 filterAsyncRoutes 方法
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      // 当路由具有访问权限时，将 tmp 保存到 res 中
      res.push(tmp)
    }
  })

  return res
}
```
### 检验权限的方法 `hasPermission`
```
function hasPermission(roles, route) {
  // 检查路由是否包含 meta 和 meta.roles 属性
  if (route.meta && route.meta.roles) {
    // 判断 route.meta.roles 中是否包含用户角色 roles 中的任何一个权限，如果包含则返回 true，否则为 false
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    // 如果路由没有 meta 或 meta.roles 属性，则视为该路由不需要进行权限控制，所有用户对该路由都具有访问权限
    return true
  }
}
```
### 总结
- vue-element-admin 对所有访问的路由进行拦截
- 访问路由时会从cookie中获取Token，判断Token是否存在：
  - 如果Token存在，将根据用户角色生成动态路由，然后访问路由，生成对应的页面组件。这里有一个特例，即用户访问 `/login` 时会重定向至 `/` 路由；
  - 如果 Token不存在，则会判断路由是否在白名单中，如果在白名单中将直接访问，否则说明该路由需要登录才能访问，此时会将路由生成一个 redirect 参数传入 login 组件，实际访问的路由为：`/login?redirect=/xxx`。

### 关于动态路由和权限校验
- vue-element-admin将路由分为：constantRoutes和asyncRoutes
- 用户登录系统时，会动态生成路由，其中 constantRoutes 必然包含，asyncRoutes 会进行过滤；
- asyncRoutes过滤的逻辑是看路由下是否包含 meta 和 meta.roles 属性，如果没有该属性，所以这是一个通用路由，不需要进行权限校验；如果包含 roles 属性则会判断用户的角色是否命中路由中的任意一个权限，如果命中，则将路由保存下来，如果未命中，则直接将该路由舍弃；
- asyncRoutes 处理完毕后，会和 constantRoutes合并为一个新的路由对象，并保存到 vuex 的 permission/routes 中；
- 用户登录系统后，侧边栏会从 vuex 中获取 state.permission.routes，根据该路由动态渲染用户菜单。
