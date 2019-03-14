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
    .ivu-table-cell {
        padding-left: 18px;
        padding-right: 18px;
    }
    .ivu-table-small td {
        height: 35px;
    }
    .ivu-table .demo-table-info-row td{
        background-color: #9D9D9D;
        // color: #fff;
    }
    .ivu-table .demo-table-error-row td{
        background-color: #D0D0D0;
        // color: #fff;
    }
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .demo-spin-col{
        height: 100px;
        position: relative;
        border: 1px solid #eee;
    }
    @import '../../styles/common.less';
    @import '../Order/components/table.less';
</style>
<template>
    <div>
        <Row>
            <Col span="4">
                <Card>
                    <div slot="title">
                        <Select v-model="model1" @on-change="envSelect" placeholder="请选择操作环境..." label-in-value>
                            <Option value="pre">预发布</Option>
                            <Option value="prod">正式环境</Option>
                        </Select>
                    </div>
                    <div class="edittable-self-con" style="overflow: auto ">
                            <template>
                                <Tree :data="allResult" :expand="true" @on-select-change="selectNode"></Tree>
                            </template>

                    </div>
                </Card>
            </Col>
            <Col span="20" class="padding-left-10">
                <Card>
                    <div slot="title">
                        <Row>
                            <Col span="10">
                              <h3 v-if="currentEnv"> 当前执行环境【{{currentEnv}}】 </h3>
                              <br>
                              <h3 v-if="currentResult[0]">操作模块【{{currentResult[0].service}}】</h3>
                            </Col>
                            <Col span="2">
                            </Col>
                        </Row>
                    </div>
                    <div>
                        <Row v-if="currentEnv">
                            <Col span="13">
                                <Button @click="handleSelectAll(selectAllorNot = !selectAllorNot)" icon="md-expand">全选反选</Button>
                                <!--<Button @click="handleSelectAll(false)" icon="ios-contract">取消全选</Button>-->
                               <Button @click="moduleSet" type="info" icon="md-cube">设置节点状态</Button>
                              <Button @click="versionUpdate" type="primary" icon="md-cube">版本更新</Button>
                                <Button @click="syndiConsul" type="warning" icon="md-sync">同步consul数据</Button>
                              <Button @click="verChange" type="success" icon="md-sync">版本修改</Button>
                            </Col>
                            <Col span="2" offset="2">
                                <Select v-model="model2" placeholder="请选择主从..." @on-change="masterSlave">
                                    <Option value="主">显示主</Option>
                                    <Option value="从">显示从</Option>
                                    <Option value="all">全部显示</Option>
                                </Select>
                            </Col>
                            <Col span="4" offset="1">
                                <Input v-model="searchCol">
                                    <span slot="prepend"><Icon type="search"></Icon></span>
                                </Input>
                            </Col>
                            <Col span="2">
                                <Button type="default" @click="searchTable">查询</Button>
                            </Col>
                       </Row>
                    </div>
                    <br>
                    <div v-for="content in ModuleContent">
                           <div><Checkbox @on-change="checkPerMinion($event, content)"></Checkbox>{{content.minion_id}}</div>
                           <Table :row-class-name="rowClassName" border ref="selection" :columns="ModuleColumns" :data="content.kids"  :loading="loading"></Table>
                           <br/>
                        <Spin fix v-if="loading">
                            <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                            <div>正在修改状态...</div>
                        </Spin>
                    </div>
                </Card>
            </Col>
        </Row>
        <Modal
                v-model="modal1"
                title="模块操作"
                width="860"
                @on-ok="sumbitModule">
            <Form :model="forItem" :label-width="120">
                <FormItem label="所选模块">
                     <span v-for="val in selectServer">
                        {{val.rpc_port}}【{{val.ms}}】
                     </span>
                </FormItem>
                <FormItem label="操作类型">
                    <RadioGroup type="button" v-model="setType" >
                        <Radio label="log"></Radio>
                        <Radio label="state"></Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="操作内容" v-if="setType === 'log'">
                    <RadioGroup type="button" v-model="setContent">
                        <Radio label="info"></Radio>
                        <Radio label="debug"></Radio>
                        <Radio label="error"></Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="操作内容" v-if="setType === 'state'">
                      <RadioGroup v-model="setContent">
                          <Radio label="RUN"></Radio>
                          <Radio label="RETIRE"></Radio>
                          <Radio label="TEST"></Radio>
                      </RadioGroup>
                </FormItem>
            </Form>
        </Modal>

      <Modal
        v-model="verUpdateModal"
        title="版本修改"
        width="860"
        @on-ok="newVerSubmit">
        <Form :model="verUpdateItem" :label-width="120">
          <FormItem label="老版本号">
            <Input v-model="verUpdateItem.old_version" placeholder="老版本号" disabled></Input>
          </FormItem>
          <FormItem label="新版本号">
            <Input v-model="verUpdateItem.new_version" placeholder="请输入新版本号"></Input>
          </FormItem>
        </Form>
      </Modal>

      <Modal
        v-model="versionUpdateModal"
        title="版本更新"
        width="860">
        <Form :model="updatenewItem" :label-width="120">
          <FormItem label="所选模块">
                     <span v-for="val in selectServer">
                        {{val.rpc_port}}【{{val.ms}}】
                     </span>
          </FormItem>
          <FormItem label="版本号">
            <Input v-model="updatenewItem.version" placeholder="请输入版本号"></Input>
          </FormItem>
          <FormItem label="动作类型">
                    <Select v-model="updatenewItem.action_id" @on-change="selectActionType">
                      <Option v-for="item in actionList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>
          </FormItem>
          <div v-for="(val, index) in updatenewItem.steps">
            <FormItem :label="'第' + (index + 1) + '作业名称'">
                   {{val.name}}
            </FormItem>
            <FormItem :label="'第' + (index + 1) + '步执行参数'">
              <Input v-model="val.clp" placeholder="请输入这个步骤需要执行的参数"></Input>
            </FormItem>
            <FormItem :label="val.name + '.'+ vl " v-for="(index, vl) in val.pillar">
              <Input v-model="val.pillar[vl]" placeholder="请输入这个步骤需要执行的参数"></Input>
            </FormItem>

          </div>
        </Form>
        <div slot="footer">
               <Button type="info" @click="verUpdate('review')">预览</Button>
               <Button type="warning" @click="verUpdate('save')">保存</Button>
               <Button type="primary" @click="verUpdate('sumbit')">提交</Button>
        </div>
      </Modal>

    </div>
</template>
<script>
    import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
    import util from '../../libs/util'
    import axios from 'axios'
    import expandRow from './grayTable-expand.vue';
    export default {
        components: {
            ICol, expandRow
        },
        name: 'grayAction',
        data () {
            return {
                selectAllorNot: false,
                verUpdateModal: false,
                verUpdateItem: {
                    env: '',
                    old_version: '',
                    new_version: ''
                },
                actionList: [],
                versionUpdateModal: false,
                currentResult: [],
                loading: false,
                modal1: false,
                setContent: '',
                setType: '',
                searchCol: '',
                model1: '',
                model2: '',
                allResult: [],
                data1: [],
                currentEnv: '',
                currentModule: '',
                selectServer: [],
                updatenewItem: {
                   version: ''
                },
                forItem: {
                    env: '',
                    nodes: [],
                    type: '',
                    value: ''
                },
                selectID: [],
                value1: false,
                ModuleColumns: [
                    {
                        type: 'expand',
                        width: 50,
                        render: (h, params) => {
                            return h(expandRow, {
                                props: {
                                    row: params.row
                                }
                            })
                        }
                    },
                    {
                        // type: 'selection',
                        width: 60,
                        align: 'center',
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: params.row.selectNode
                                },
                                on: {
                                     'on-change': (val) => {
                                         // this.ModelContent = val
                                         this.selectChange(val, params)
                                     }
                                }
                               })
                        }
                    },
                    {
                        title: 'rpc_port',
                        key: 'rpc_port'
                    },
                    {
                        title: 'run_state',
                        key: 'run_state'
                    },
                    {
                        title: 'log_level',
                        key: 'log_level'
                    },
                    {
                        title: 'ms',
                        key: 'ms'
                    },
                    {
                        title: 'health_port',
                        key: 'health_port'
                    },
                  {
                    title: 'status',
                    key: 'status',
                    render: (h, params) => {
                      const row = params.row;
                      if (row.status === 'passing') {
                        var color = 'success'
                      } else {
                        color = 'danger'
                      }
                      return h('Tag', {
                        props: {
                          type: 'dot',
                          color: color
                        }
                      }, row.status)
                    }
                  }
                ],
                ModuleContent: []
            }
        },
        watch: {
            setType: function (val) {
                this.setContent = ''
            },
            setContent: function (val) {
                this.forItem.type = this.setType
                this.forItem.value = val
            }
        },
        methods: {
          verChange () {
                this.verUpdateModal = true
                this.verUpdateItem.old_version = this.currentResult[0].version
              },
            newVerSubmit () {
               this.loading = true
               axios.post(`${util.stage}/version/forward/`, {env: this.forItem.env, old_version: this.verUpdateItem.old_version, new_version: this.verUpdateItem.new_version})
                 .then(res => {
                   if (res.data.code === 20000) {
                     this.loading = false
                     this.$Message.success('操作成功')
                     this.initNode(this.forItem.env)
                   } else {
                     util.err_notice(res.data.msg)
                   }
                 }).catch(error => {
                 util.err_notice(error)
                 util.err_notice('后端报错，请找后端开发人员')
               })
             },
             axiosParmas (urlParams, postData, ifInfo = false) {
               this.loading = true
               axios.post(urlParams, postData)
                 .then(res => {
                   if (res.data.code === 20000) {
                     this.loading = false
                     this.$Message.success('操作成功')
                     if (ifInfo) {
                       this.$Modal.info({
                         title: '预览信息',
                         content: '<pre>' + res.data.data + '</pre>',
                         width: 1000
                       })
                     }
                   } else {
                     util.err_notice(res.data.msg)
                   }
                   this.versionUpdateModal = false
                 }).catch(error => {
                 util.err_notice(error)
                 util.err_notice('后端报错，请找后端开发人员')
               })
             },
          verUpdate (action) {
               let postData = {env: this.forItem.env, service: this.currentResult[0].service, nodes: this.forItem.nodes, action_id: this.updatenewItem.action_id, version: this.updatenewItem.version, steps: this.updatenewItem.steps}
               if (action === 'review') {
                     this.axiosParmas(`${util.stage}/preview/`, postData, true)
               } else if (action === 'save') {
                     this.axiosParmas(`${util.stage}/vu/create/`, postData)
               } else if (action === 'sumbit') {
                      this.axiosParmas(`${util.stage}/do/`, postData)
               }
          },
          selectActionType (vl) {
                let tmpList = []
                for (let ee of this.actionList) {
                      if (ee.id === vl) {
                          tmpList = ee
                      }
                }
                // 组织数据结构
                this.updatenewItem = {
                     action_id: '',
                     steps: [],
                     name: '',
                     version: this.updatenewItem.version
                }
                this.updatenewItem.action_id = vl
                for (let tt of tmpList.steps) {
                   let tempDict = {}
                   for (let gg of tt.keys) {
                         tempDict[gg] = ''
                   }
                   this.updatenewItem.steps.push({clp: '', action_id: tt.id, pillar: tempDict, name: tt.name})
                }
           },
            versionUpdate () {
              this.moduleSet(false)
              if (this.selectServer.length === 0) {
                return false
              }
              this.versionUpdateModal = true
            },
            checkPerMinion (vl, content) {
                // 部分全选
              let tempResult = this.deepClone(this.ModuleContent)
              for (let gg of tempResult[this.ModuleContent.indexOf(content)].kids) {
                      gg.selectNode = vl
              }
              this.ModuleContent = tempResult
            },
            selectChange (vl, params) {
                if (this.ModuleContent.length >= 1) {
                    for (let gg of this.ModuleContent) {
                        for (let vv of gg.kids) {
                          if (vv.id === params.row.id) {
                              vv.selectNode = vl
                          }
                        }
                    }
                }
             },
            initNode (env) {
                axios.get(`${util.stage}/nodes/?env=${env}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                               res.data.data[0].expand = true
                               this.allResult = res.data.data
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('后端报错，请找后端开发人员')
                })
            },
            handleSelectAll (status) {
                let tempContent = this.deepClone(this.ModuleContent)
                for (let content of tempContent) {
                    for (let ii of content.kids) {
                            ii.selectNode = status
                    }
                }
                this.ModuleContent = tempContent
            },
            envSelect (vl) {
                this.initNode(this.model1)
                this.forItem.env = this.model1
                this.currentEnv = vl.label
                this.ModuleContent = []
            },
            selectNode (vl, ifsearch = true) {
                if (vl.length !== 0) {
                    this.currentResult = JSON.parse(JSON.stringify(vl))
                    this.ModuleContent = vl[0].kids
                   if (ifsearch) {
                     this.model2 = 'all'
                   } else {
                     this.searchCol = ''
                   }
                }
            },
            moduleSet (ifsetnode = true) {
                this.selectServer = []
                this.forItem.nodes = []
                for (let content of this.ModuleContent) {
                    for (let ii of content.kids) {
                            if (ii.selectNode === true) {
                                this.selectServer.push(ii)
                                this.forItem.nodes.push(ii.id)
                            }
                    }
                }
                if (this.selectServer.length === 0) {
                    util.err_notice('请选择模块后进行操作！！')
                    return false
                }
                if (ifsetnode) {
                   this.modal1 = true
                }
            },
            syndiConsul () {
                this.loading = true
                axios.get(`${util.stage}/consul_sync/?env=${this.forItem.env}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.loading = false
                            // this.model1 = 'pre'
                            this.initNode(this.forItem.env)
                            this.ModuleContent = this.allResult[this.currentModule]
                            this.model2 = 'all'
                            this.searchCol = ''
                            this.$Message.success('同步成功')
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            },
        getType (obj) {
        // tostring会返回对应不同的标签的构造函数
        var toString = Object.prototype.toString;
        var map = {
            '[object Boolean]': 'boolean',
            '[object Number]': 'number',
            '[object String]': 'string',
            '[object Function]': 'function',
            '[object Array]': 'array',
            '[object Date]': 'date',
            '[object RegExp]': 'regExp',
            '[object Undefined]': 'undefined',
            '[object Null]': 'null',
            '[object Object]': 'object'
        };
        if (obj instanceof Element) {
            return 'element';
        }
        return map[toString.call(obj)];
    },
    rowClassName (row, index) {
                if (row.ms === '主') {
                    return 'demo-table-info-row';
                } else if (row.ms === '从') {
                    return 'demo-table-error-row';
                }
                return '';
            },
      deepClone (data) {
        var type = this.getType(data);
        var obj;
        if (type === 'array') {
            obj = [];
        } else if (type === 'object') {
            obj = {};
        } else {
            // 不再具有下一层次
            return data;
        }
        if (type === 'array') {
            for (var i = 0, len = data.length; i < len; i++) {
                obj.push(this.deepClone(data[i]));
            }
        } else if (type === 'object') {
            for (var key in data) {
                obj[key] = this.deepClone(data[key]);
            }
        }
        return obj;
          },
            masterSlave (vl) {
                this.loading = true
                this.selectNode(this.currentResult, false)
                let allList = this.deepClone(this.ModuleContent)
                if (vl !== 'all') {
                    for (let gg of allList) {
                        let tempList = []
                        for (let ii of gg.kids) {
                             if (ii.ms === vl) {
                               tempList.push(ii)
                           }
                        }
                        gg.kids = tempList
                    }
                    this.ModuleContent = allList
                }
                this.loading = false
            },
            searchTable () {
                this.selectNode(this.currentResult)
                let tempContent = this.deepClone(this.ModuleContent)
                if (this.searchCol) {
                    for (let ll of tempContent) {
                        let tempList = []
                        for (let gg of ll.kids) {
                            if (gg.rpc_port.includes(this.searchCol)) {
                                tempList.push(gg)
                            }
                        }
                        ll.kids = tempList
                    }
                }
                this.ModuleContent = this.deepClone(tempContent)
                this.model2 = 'all'
            },
            sumbitModule () {
               axios.post(`${util.stage}/operate/`, this.forItem)
                    .then(res => {
                        if (res.data.code === 20000) {
                          this.$Message.success('操作成功！点击【同步consul数据】刷新状态')
                          this.syndiConsul()
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('后端报错，请找后端开发人员')
                })
            },
          initActionType () {
            axios.get(`${util.stage}/action/list/`)
              .then(res => {
                if (res.data.code === 20000) {
                  this.actionList = res.data.data
                } else {
                  util.err_notice(res.data.msg)
                }
              }).catch(error => {
              util.err_notice(error)
              util.err_notice('后端报错，请找后端开发人员')
            })
          }
        },
        mounted () {
          this.initActionType()
        }
    }
</script>
