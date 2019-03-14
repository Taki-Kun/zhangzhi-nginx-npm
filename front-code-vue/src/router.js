import Index from './Main.vue'

export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: resolve => {
        require(['./Login.vue'], resolve)
    }
}
export const version = {
    path: '/version',
    name: 'version',
    meta: {
        title: 'version - 版本号'
    },
    component: resolve => {
        require(['./main_components/version.vue'], resolve)
    }
}
export const locking = {
    path: '/locking',
    name: 'locking',
    component: resolve => {
        require(['./main_components/locking-page.vue'], resolve)
    }
}

export const page404 = {
    path: '/*',
    name: 'error_404',
    meta: {
        title: '404-页面不存在'
    },
    component: resolve => {
        require(['./components/Error/404.vue'], resolve)
    }
}

export const page401 = {
    path: '/401',
    meta: {
        title: '401-权限不足'
    },
    name: 'error_401',
    component: resolve => {
        require(['./components/Error/401.vue'], resolve)
    }
}

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error_500',
    component: resolve => {
        require(['./components/Error/500.vue'], resolve)
    }
}

export const appRouter = [
    {
        path: '/',
        icon: 'md-home',
        name: 'main',
        title: '首页',
        component: Index,
        redirect: '/home',
        children: [
            {
                path: 'home',
                title: '首页',
                name: 'home_index',
                component: resolve => {
                    require(['./components/home/home.vue'], resolve)
                }
            },
            {
                path: 'ownspace',
                title: '个人中心',
                name: 'ownspace_index',
                component: resolve => {
                    require(['./components/Myself/own-space.vue'], resolve)
                }
            },
            {
                path: 'message',
                title: '消息中心',
                name: 'message_index',
                component: resolve => {
                    require(['./components/Myself/message.vue'], resolve)
                }
            }
        ]
    },
  {
    path: '/buyServer',
    icon: 'ios-cart-outline',
    name: 'host-buy',
    title: '购买机器',
    component: Index,
    children: [
      {
        path: '/server-config',
        name: 'host-conf',
        title: '机器配置',
        'icon': 'md-cog',
        component: resolve => {
          require(['./components/BuyServer/ServerConfig.vue'], resolve)
        }
      },
      {
        path: '/server-apply',
        name: 'host-order',
        title: '申请机器',
        'icon': 'logo-freebsd-devil',
        component: resolve => {
          require(['./components/BuyServer/ServerApply.vue'], resolve)
        }
      },
      {
        path: '/server-order',
        name: 'host-deal',
        title: '工单审核',
        'icon': 'md-paper',
        component: resolve => {
          require(['./components/BuyServer/ServerOrder.vue'], resolve)
        }
      },
      {
        path: '/server-buydetail',
        name: 'server-buydetail',
        title: '买机器详细',
        'icon': 'md-paper',
        component: resolve => {
          require(['./components/BuyServer/serverBuyDetail.vue'], resolve)
        }
      }
    ]
  },
    {
        path: '/asset',
        icon: 'ios-cube',
        name: 'asset',
        title: '资源管理',
        component: Index,
        children: [
            {
                path: '/role',
                name: 'role',
                title: '业务管理',
                'icon': 'ios-albums',
                component: resolve => {
                    require(['./components/Search/ResGame.vue'], resolve)
                }
            },
            {
                path: '/host',
                name: 'host',
                title: '主机管理',
                'icon': 'ios-desktop',
                component: resolve => {
                    require(['./components/Search/ResHost.vue'], resolve)
                }
            },
            {
                path: '/slb',
                name: 'slb',
                title: 'SLB管理',
                'icon': 'md-git-merge',
                component: resolve => {
                    require(['./components/Search/freeSLB.vue'], resolve)
                }
            },
            {
                path: '/firewall',
                name: 'firewall',
                title: '安全管理',
                'icon': 'md-lock',
                component: resolve => {
                    require(['./components/Search/seGroup.vue'], resolve)
                }
            },
            {
                path: '/chanfirewall',
                name: 'chanfirewall',
                title: '修改配置规则',
                'icon': 'ios-medkit',
                component: resolve => {
                    require(['./components/Search/chanFirewall.vue'], resolve)
                }
            },
            {
                path: '/idle',
                name: 'idle',
                title: '空闲主机',
                'icon': 'ios-funnel-outline',
                component: resolve => {
                    require(['./components/Search/freeServer.vue'], resolve)
                }
            },
            {
                path: '/webssh',
                name: 'webssh',
                title: 'webssh',
                'icon': 'md-laptop',
                component: resolve => {
                    require(['./components/Search/HostSSH.vue'], resolve)
                }
            }
        ]
    },
    {
        path: '/salt',
        icon: 'ios-create-outline',
        name: 'salt',
        title: '作业系统',
        component: Index,
        children: [
            {
                path: '/debug',
                name: 'debug',
                title: '快速命令执行',
                'icon': 'md-plane',
                component: resolve => {
                    require(['./components/homework/saltExec.vue'], resolve)
                }
            },
            {
                path: '/script-do',
                name: 'script-do',
                title: '快速脚本执行',
                'icon': 'ios-plane',
                component: resolve => {
                    require(['./components/homework/scriptExec.vue'], resolve)
                }
            },
            {
                path: '/cmd',
                name: 'cmd',
                title: '命令管理',
                'icon': 'md-paper',
                component: resolve => {
                    require(['./components/homework/saltCommend.vue'], resolve)
                }
            },
            {
                path: '/salt-detail',
                name: 'salt-detail',
                title: '执行详细',
                'icon': 'person',
                component: resolve => {
                    require(['./components/homework/saltDetail.vue'], resolve)
                }
            },
            {
                path: '/script-detail',
                name: 'script-detail',
                title: '脚本执行详细',
                'icon': 'person',
                component: resolve => {
                    require(['./components/homework/scriptDetail.vue'], resolve)
                }
            },
            {
                path: '/run',
                name: 'run',
                title: '作业调度',
                'icon': 'ios-share',
                component: resolve => {
                    require(['./components/homework/useHomeWork.vue'], resolve)
                }
            },
            {
                path: '/script',
                name: 'script',
                title: '脚本管理',
                'icon': 'ios-closed-captioning',
                component: resolve => {
                    require(['./components/homework/scriptManage.vue'], resolve)
                }
            },
            {
                path: '/job',
                name: 'job',
                title: '新建作业',
                'icon': 'md-create',
                component: resolve => {
                    require(['./components/homework/createHomework.vue'], resolve)
                }
            },
            {
                path: '/script-log',
                name: 'script-log',
                title: '脚本记录',
                'icon': 'ios-map-outline',
                component: resolve => {
                    require(['./components/homework/scriptHistory.vue'], resolve)
                }
            },
            {
                path: '/job-log',
                name: 'job-log',
                title: '历史记录',
                'icon': 'md-calendar',
                component: resolve => {
                    require(['./components/homework/saltHistory.vue'], resolve)
                }
            }
        ]
    },
    {
        path: '/database',
        icon: 'logo-buffer',
        name: 'dbms',
        title: '数据库',
        component: Index,
        children: [
            {
                path: '/db',
                name: 'db',
                title: '数据库管理',
                'icon': 'logo-buffer',
                component: resolve => {
                    require(['./components/Database/MamagementBase.vue'], resolve)
                }
            },
            {
                path: '/sql-tpl',
                name: 'sql-tpl',
                title: 'SQL模板',
                'icon': 'ios-list-box',
                component: resolve => {
                    require(['./components/Database/sqlDemo.vue'], resolve)
                }
            },
            {
                path: '/sql',
                name: 'sql',
                title: 'SQL查询',
                'icon': 'md-male',
                component: resolve => {
                    require(['./components/Database/QuerySQL.vue'], resolve)
                }
            },
            {
                path: '/sql-log',
                name: 'sql-log',
                title: 'SQL日志',
                'icon': 'ios-copy-outline',
                component: resolve => {
                    require(['./components/Database/DatabaseLog.vue'], resolve)
                }
            }
        ]
    },
    {
        path: '/cdn',
        icon: 'md-ionic',
        name: 'cdn',
        title: 'CDN',
        component: Index,
        children: [
            {
                path: '/cdn-refresh',
                name: 'cdn-refresh',
                title: 'CDN刷新',
                'icon': 'ios-refresh',
                component: resolve => {
                    require(['./components/CDNRefresh/CDNAction.vue'], resolve)
                }
            },
            {
                path: '/upload',
                name: 'upload',
                title: '文件上传',
                'icon': 'ios-cloud-upload-outline',
                component: resolve => {
                    require(['./components/CDNRefresh/FileAction.vue'], resolve)
                }
            },
            {
                path: '/cdn-log',
                name: 'cdn-log',
                title: 'CDN日志',
                'icon': 'ios-photos-outline',
                component: resolve => {
                    require(['./components/CDNRefresh/CDNLog.vue'], resolve)
                }
            }
        ]
    },
    {
        path: '/stage',
        icon: 'ios-pie-outline',
        name: 'stage',
        title: '灰度更新',
        component: Index,
        children: [
            {
                path: '/stage-list',
                name: 'stage-list',
                title: '灰度操作',
                'icon': 'ios-speedometer',
                component: resolve => {
                    require(['./components/gray/grayAction.vue'], resolve)
                }
            },
          {
            path: '/stage-vu',
            name: 'stage-vu',
            title: '更新类型',
            'icon': 'md-boat',
            component: resolve => {
              require(['./components/gray/grayActionType.vue'], resolve)
            }
          },
          {
            path: '/stage-vu-job',
            name: 'stage-vu-job',
            title: '更新作业',
            'icon': 'md-book',
            component: resolve => {
              require(['./components/gray/grayJob.vue'], resolve)
            }
          },
            {
                path: '/stage-logs',
                name: 'stage-logs',
                title: '灰度日志',
                'icon': 'ios-map',
                component: resolve => {
                    require(['./components/gray/grayHistory.vue'], resolve)
                }
            }
        ]
    },
    {
        path: '/pipe',
        icon: 'md-pulse',
        name: 'pipe',
        title: '工作流',
        component: Index,
        children: [
            {
                path: '/workflow',
                name: 'workflow',
                title: '流程列表',
                'icon': 'md-reorder',
                component: resolve => {
                    require(['./components/WorkFlow/historylistName.vue'], resolve)
                }
            },
            {
                path: '/stream-list',
                name: 'stream-list',
                title: '流程模板',
                'icon': 'md-pie',
                component: resolve => {
                    require(['./components/WorkFlow/workFlowList.vue'], resolve)
                }
            },
            {
                path: '/stream-new',
                name: 'stream-new',
                title: '新建工作流',
                'icon': 'logo-googleplus',
                component: resolve => {
                    require(['./components/WorkFlow/addNewWorkList.vue'], resolve)
                }
            },
            {
                path: '/execWorkList',
                name: 'execWorkList',
                title: '工作流执行',
                'icon': 'android-drafts',
                component: resolve => {
                    require(['./components/WorkFlow/execWorkList.vue'], resolve)
                }
            },
            {
                path: '/fileAction',
                name: 'fileAction',
                title: '文件上传oss',
                'icon': 'android-drafts',
                component: resolve => {
                    require(['./components/CDNRefresh/FileAction.vue'], resolve)
                }
            }
        ]
    },
    {
        path: '/admin',
        icon: 'md-people',
        name: 'admin',
        title: '用户管理',
        component: Index,
        children: [
            {
                path: '/project',
                name: 'project',
                title: '项目管理',
                'icon': 'ios-photos',
                component: resolve => {
                    require(['./components/Search/DataBaseDic.vue'], resolve)
                }
            },
            {
                path: '/user',
                name: 'user',
                title: '用户管理',
                'icon': 'ios-person',
                component: resolve => {
                    require(['./components/Search/userAndGroup.vue'], resolve)
                }
            },
            {
                path: '/im',
                name: 'im',
                title: '临时通知',
                'icon': 'ios-mail-open',
                component: resolve => {
                    require(['./components/Search/imessage.vue'], resolve)
                }
            }
        ]
    }
]

export const MainRoute = [
    loginRouter,
    locking,
    ...appRouter,
    version,
    page404,
    page401,
    page500
]
