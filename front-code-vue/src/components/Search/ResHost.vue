<style lang="less">
  .word {
    font-size: 14px;
    width: 100%;
    word-wrap: break-word;
    word-break: break-all;
    height: 500px;
    overflow: auto;
  }
  a:hover {
    color: #ff9900;
  }
  a:active {
    color: #ff6600;
  }
  .edittable-self-con {
    height: 100%;
  }
  @import '../../styles/common.less';
  @import '../Order/components/table.less';
</style>
<template>
  <div>
    <Row>
      <Col span="4">
        <Card>
          <p slot="title">
            <Icon type="ios-redo"></Icon>
            主机管理
          </p>
          <div class="edittable-self-con" style="overflow: auto ">
            <!--<Form :label-width="80">

            </Form>-->
            <Scroll height="550">
              <template>
                <Tree :data="baseData" @on-check-change="selectPro" show-checkbox empty-text="数据加载中..."></Tree>
              </template>
            </Scroll>

          </div>
        </Card>
      </Col>
      <Col span="20" class="padding-left-10">
        <Card>
          <Row>
            <Col span="3">
              <h4><Icon type="ios-monitor-outline"></Icon>&nbsp所选业务服务器</h4>
            </Col>
            <Col span="4" offset="15">
              <Input v-model="searchCol">
                <span slot="prepend"><Icon type="search"></Icon></span>
              </Input>
            </Col>
            <Col span="2">
              <Button type="default" @click="searchTable">查询</Button>
            </Col>
          </Row>
          <br>
          <div class="edittable-table-height-con" style="height: 650px;overflow: auto ">

            <Table :loading="loading" ref="selection" border :columns="columns1" :data="data1" @on-selection-change="selectHost"></Table>
            <br>
            <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

          </div>

        </Card>
      </Col>
    </Row>

  </div>
</template>
<script>
  import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
  import util from '../../libs/util'
  import axios from 'axios'
  export default {
    components: {
      ICol
    },
    name: 'DataBaseDic',
    data () {
      return {
        selectSecure: '',
        searchCol: '',
        loading: false,
        currentSelectRole: [],
        addHostList: [],
        changeInfodModal: false,
        allsearchdata: [],
        totalPage: 1,
        currentRole: [],
        button1: '运维组',
        userText: '',
        baseData: [],
        baseSelectData: [],
        columns1: [
          {
            title: '所属项目',
            key: 'project_name'
          },
          {
            title: '所属角色',
            key: 'role_name'
          },
          {
            title: '主机名',
            key: 'instance_name'
          },
          {
            title: 'cpu',
            key: 'cpu'
          },
          {
            title: '内存',
            key: 'mem'
          },
          {
            title: '内网IP',
            key: 'lan_ip'
          },
           {
                title: '状态',
                key: 'status',
                render: (h, params) => {
                    const row = params.row;
                    const color = row.status === 'Running' ? 'success' : 'error';
                    const text = row.status === 'Running' ? '正在运行' : '停止使用';
                    return h('Tag', {
                        props: {
                            type: 'dot',
                            color: color
                        }
                    }, text)
                }
            },
            {
                title: '安全组',
                render: (h, params) => {
                    let optionList = []
                    for (var pp of params.row.security_groups) {
                        optionList.push(h('Option', {
                            props: {
                                value: pp.id,
                                label: pp.name
                            }
                        }))
                    }
                    return h('Select', {
                        on: {
                            'on-change': (e) => {
                                this.secuPage(e, params.row.security_groups)
                            }
                        }
                    }, optionList);
                }
            },
          {
            title: 'Action',
            key: 'action',
            width: 200,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.inithost(params.row)
                    }
                  }
                }, '初始化'),
                h('Button', {
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.passwd(params.row)
                    }
                  }
                }, 'root密码')
              ]);
            }
          }
        ],
        data1: [],
        proDataSelect: []
      }
    },

    methods: {
        inithost (vl) {
          this.$Modal.confirm({
            title: '初始化',
            content: '<p>是否执行初始化</p>',
            onOk: () => {
              axios.get(`${util.applyserver}/host/${vl.id}/init/`).then(res => {
                if (res.data.code === 20000) {
                  this.$Message.info('操作成功')
                }
              })
            }
          });
        },
        passwd (vl) {
            axios.get(`${util.applyserver}/host/${vl.id}/passwd/`).then(res => {
                if (res.data.code === 20000) {
                  this.$Modal.confirm({
                    title: 'root密码',
                    content: '<p>' + res.data.data + '</p>'
                  });
                }
            })
        },
        selectRole (vl, vl2) {
          // console.log(vl, vl2)
        },
        // 点击“转移至空闲池或其它业务”时触发
        changPromodel (vl) {
            if (this.addHostList.length === 0) {
                util.err_notice('请选择服务器')
                return false
            }
            this.changeInfodModal = true
        },
        // 选择机器的时候触发的
        selectHost (vl) {
            this.addHostList = vl
            // console.log(vl)
        },
      changePage (page) {
        this.selectPro(this.currentSelectRole, '', this.searchCol, page * 10 - 10, 10)
      },
      selectPro (vl, vl2 = '', values = this.searchCol, start = 0, limit = 10) {
        this.loading = true
        if (values.length !== 0) {
            var searchValue = `&q=${values}`
        } else {
            searchValue = ''
        }
        this.currentSelectRole = vl
        this.currentRole = []
        for (var i = 0; i < vl.length; i++) {
          if (vl[i].top !== true) {
            this.currentRole.push(vl[i].id)
          }
        }
        axios.get(`${util.url}/role_hosts/?offset=${start}&limit=${limit}${searchValue}`, {params: {'role_id': JSON.stringify(this.currentRole)}}).then(res => {
          if (res.data.code === 20000) {
            this.data1 = res.data.data
            this.totalPage = res.data.count
            this.loading = false
          }
        }).catch(error => {
            util.err_notice(error)
          util.ajanxerrorcode(this, error)
        })
        console.log(values, 12222222222222222222222222222222222)
      },
      proinit () {
          axios.post(`${util.url}/projects/?p=role`)
              .then(res => {
               let defaultHostList = []
               if (res.data.code === 20000) {
                   for (var i = 0; i < res.data.data.length; i++) {
                       res.data.data[i]['expand'] = true
                       for (var g = 0; g < res.data.data[i].children.length; g++) {
                           delete (res.data.data[i].children[g].children)
                           defaultHostList.push(res.data.data[i].children[g])
                       }
                   }
                   this.defaultSelect(res.data.data)
                   this.baseData = [{
                       expand: true,
                       title: '业务列表',
                       children: res.data.data,
                       top: 1,
                       checked: true
                   }]
                   this.selectPro(defaultHostList)
               }
              }).catch(error => {
              util.err_notice(error)
              util.ajanxerrorcode(this, error)
          })
      },
      defaultSelect (vl) {
         // 组装数据结构
         for (var zz of vl) {
             if ('children' in zz) {
                 zz['checked'] = true
                 zz['value'] = zz['id']
                 zz['label'] = zz['name']
                 this.defaultSelect(zz['children'])
             } else {
                 zz['checked'] = true
                 zz['value'] = zz['id']
                 zz['label'] = zz['name']
             }
         }
      },
      changePro () {
        },
     searchTable () {
         this.selectPro(this.currentSelectRole, '', this.searchCol)
     },
     secuPage (vl, groups) {
         console.log(vl, groups, 11111111111111111111)
         for (let gg of groups) {
             if (vl === gg.id) {
               this.$router.push({name: 'chanfirewall', params: {result: gg}})
             }
         }
     }
    },
    mounted () {
      this.proinit()
    }
  }
</script>
