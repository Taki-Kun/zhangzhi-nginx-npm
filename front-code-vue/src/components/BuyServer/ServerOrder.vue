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
      <Card>
        <p slot="title">
          <Icon type="ios-redo"></Icon>
          工单审核
        </p>
        <Row>
          <Col span="24">

            <Table :loading="loading" border :columns="colums" :data="data1" stripe ref="selection"
            ></Table>
            <br>
            <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

          </Col>
        </Row>
      </Card>
    </Row>

    <Modal v-model="auditModal" :width="800" :mask-closable="false">
      <h3 slot="header" style="color:#2D8CF0">审核工单</h3>
      <Form :model="formItem" :label-width="120" label-position="right">
          <FormItem label="选择区域">
                <Select v-model="formItem.region" filterable @on-change="selRegion">
                  <Option v-for="item in regionList" :value="item.region_id" :key="item.id">【{{item.region_id}}】{{ item.name }}</Option>
                </Select>
          </FormItem>
          <FormItem label="选择zone">
            <Select v-model="formItem.zone" filterable @on-change="selZone">
              <Option v-for="item in zoneList" :value="item.zone_id" :key="item.id">【{{item.zone_id}}】{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="选择VPC">
            <Select v-model="formItem.vpc_id" filterable @on-change="subSel">
              <Option v-for="item in vpcList" :value="item.vpc_id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
        <FormItem label="选择子网">
          <Select v-model="formItem.subnet_id" filterable>
            <Option v-for="item in subnetList" :value="item.subnet_id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>
          <FormItem label="选择安全组">
            <Select v-model="formItem.group_id" filterable>
              <Option v-for="item in groupList" :value="item.group_id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <div v-for="(val, index) in component_data">
             <FormItem :label="'选择组件' + (index + 1)">
               <Row>
                 <Col span="18">
                   <Select v-model="val.action_id" filterable @on-change="selJob(val.action_id, index)">
                     <Option v-for="commend in jobList" :value='commend.id' :key="commend.id">【{{commend.project.name ? commend.project.name : '公共模块'}}】{{commend.name}}—{{commend.func}}</Option>
                   </Select>
                 </Col>
                 <Col span="4" offset="1">
                   <Button type="default" @click="handleRemove(index)" icon="md-remove">删除</Button>
                 </Col>
               </Row>
               </FormItem>
            <div v-for="(val2, key, index) in val.pillar">
                <FormItem :label="'【' + key + '】'">
                  <Input v-model="val.pillar[key]" placeholder="请输入运行时参数" style="width: 370px"></Input>
                </FormItem>
             </div>
          </div>
           <FormItem>
             <Row>
               <Col span="12">
                 <Button type="dashed" long @click="actionAdd" icon="md-add">添加组件</Button>
               </Col>
             </Row>
           </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="subAudit()">提交</Button>
      </div>
    </Modal>

    <Modal v-model="rejectInfodModal" :width="1050">
      <h3 slot="header" style="color:#2D8CF0">驳回提醒</h3>
      <Form :label-width="120" label-position="right">
           <FormItem label="驳回原因">
             <Input v-model="rejectCause" type="textarea" :autosize="{minRows: 6,maxRows: 8}" placeholder="请填写驳回原因..."></Input>
           </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="rejectAudit()">提交</Button>
      </div>
    </Modal>

    <Modal v-model="twoConfirmModal" :width="1000" v-if="currentResult.tpl" :mask-closable="false">
      <h3 slot="header" style="color:#2D8CF0">确认购买</h3>
      <Alert>
        机器配置参数
        <template slot="desc"><h3>模板名称：{{currentResult.tpl.name}}&nbsp&nbsp cpu: {{currentResult.tpl.cpu}}核&nbsp&nbsp  内存：{{currentResult.tpl.mem}}G&nbsp&nbsp  数据盘大小：{{currentResult.tpl.data_disk_size}}G&nbsp&nbsp  带宽：{{currentResult.tpl.bandwidth}}M</h3></template>
      </Alert>
      <Alert type="warning">
        区域VPC参数
        <template slot="desc"><h3>区域：{{formItem.region}}&nbsp&nbsp zone：{{formItem.zone}}&nbsp&nbsp vpc：{{formItem.vpc_id}}&nbsp&nbsp 子网：{{formItem.subnet_id}}&nbsp&nbsp 安全组：{{formItem.group_id}}&nbsp&nbsp</h3></template>
      </Alert>
      <div slot="footer">
        <Button type="primary" @click="twoConfirm()">确认</Button>
      </div>
    </Modal>


  </div>
</template>



<script>
  import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
  import util from '../../libs/util'
  import axios from 'axios'
  import expandRow from './BuyTable-expand.vue'
  export default {
    components: {
      ICol, expandRow
    },
    name: 'cdnLog',
    data () {
      return {
        twoConfirmModal: false,
        rejectCause: '',
        currentResult: '',
        rejectInfodModal: false,
        auditModal: false,
        loading: true,
        vpcList: [],
        zoneList: [],
        groupList: [],
        jobList: [],
        currentProjectId: '',
        totalPage: 0,
        subnetList: [],
        pillar: {},
        currentId: '',
        component_data: [
          {
            action_id: 20,
            pillar: {dataoverwrite: ''}
          }
        ],
        formItem: {
           region: '',
           zone: '',
           subnet_id: '',
           vpc_id: '',
           group_id: ''
        },
        regionList: [],
        colums: [
          {
            type: 'expand',
            width: 50,
            render: (h, params) => {
              return h(expandRow, {
                props: {
                  row: params.row.logs
                }
              })
            }
          },
          {
            title: 'id',
            key: 'id',
            width: 100
          },
         {
           title: '项目',
           key: 'project',
           render: (h, params) => {
             return h('div', [
               h('strong', params.row.project.name)
             ]);
           }
         },
          {
            title: '业务',
            key: 'role',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.role.name)
              ]);
            }
          },
          {
            title: '配置名称',
            key: 'role',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.tpl.name)
              ]);
            }
          },
          {
            title: '申请人',
            key: 'role',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.src_user.name)
              ]);
            }
          },
          {
            title: '审核人',
            key: 'role',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.dst_user.name)
              ]);
            }
          },
          {
            title: '申请时间',
            key: 'role',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.created_time)
              ]);
            }
          },
          {
            title: '状态',
            key: 'status',
            render: (h, params) => {
              const row = params.row;
              const color = row.status === 0 ? 'warning' : row.status === 1 ? 'info' : row.status === 2 ? 'info' : row.status === -1 ? 'danger' : row.status === 3 ? 'info' : row.status === 4 ? 'info' : row.status === -2 ? 'danger' : 'success'
              const text = row.status === 0 ? '未审核' : row.status === 1 ? '通过' : row.status === 2 ? '购买中' : row.status === -1 ? '驳回' : row.status === 3 ? '初始化' : row.status === 4 ? '安装组件' : row.status === -2 ? '失败' : '完成'
              return h('Tag', {
                props: {
                  type: 'dot',
                  color: color
                }
              }, text);
            }
          },
          {
            title: 'Action',
            key: 'action',
            width: 200,
            align: 'center',
            render: (h, params) => {
              const row = params.row
              let ifButtonReject = ''
              let ifButtonaudit = ''
              // let ifButtondetail = ''
              if (row.status === 0) {
                ifButtonReject = h('Button', {
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.reject(params.row)
                    }
                  }
                }, '驳回')
                ifButtonaudit = h('Button', {
                    props: {
                      type: 'default',
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.show(params.row)
                      }
                    }
                  }, '审核')
              }
              let ifButtondetail = h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.detail(params.row)
                    }
                  }
                }, '详情')
              return h('div', [ifButtonaudit, ifButtonReject, ifButtondetail]);
            }
          }
        ],
        data1: []
      }
    },
    methods: {
      twoConfirm () {
           this.loading = true
           this.formItem['component_data'] = this.component_data
           axios.post(`${util.applyserver}/host_order/${this.currentId}/confirm/`, this.formItem)
             .then(res => {
               if (res.data.code === 20000) {
                 // this.orderListInit()
                 // this.$Message.info('操作成功')
                 this.$router.push({name: 'server-buydetail', params: {result: this.currentResult}})
               } else {
                 this.$Modal.error({
                   title: '错误',
                   content: res.data.msg
                 });
               }
               this.twoConfirmModal = false
               this.loading = false
             }).catch(error => {
             util.err_notice(error)
           })
      },
      selZone () {
        this.formItem.vpc_id = ''
        this.formItem.subnet_id = ''
      },
      detail (vl) {
        this.$router.push({name: 'server-buydetail', params: {result: vl}})
      },
      rejectAudit () {
        axios.post(`${util.applyserver}/host_order/${this.currentId}/reject/`, {reason: this.rejectCause})
          .then(res => {
            if (res.data.code === 20000) {
              this.$Message.info('操作成功！！')
              this.orderListInit()
              this.rejectInfodModal = false
            } else {
              this.$Modal.error({
                title: '错误',
                content: res.data.msg
              });
            }
          }).catch(error => {
          util.err_notice(error)
          util.err_notice('后端报错，请找后端开发人员')
        })
      },
      reject (vl) {
         this.rejectInfodModal = true
         this.currentId = vl.id
      },
      handleRemove (index) {
          this.component_data.splice(index, 1)
      },
      actionAdd () {
           this.component_data.push({action_id: '', pillar: {}})
      },
      selJob (vl, vlindex) {
        this.component_data[vlindex].pillar = {}
        for (var i of this.jobList) {
          if (vl === i.id) {
            for (var h of i.keys) {
              this.component_data[vlindex].pillar[h] = ''
            }
          }
        }
      },
      subSel (vl) {
        this.formItem.subnet_id = ''
        this.subnetList = []
         for (let vv of this.vpcList) {
             if (vv.vpc_id === vl) {
               for (let ss of vv.subnets) {
                  if (ss.zone_id === this.formItem.zone) {
                    this.subnetList.push(ss)
                  }
               }
             }
         }
      },
      selRegion (vl) {
           this.formItem.vpc_id = ''
           this.formItem.group_id = ''
           this.formItem.subnet_id = ''
           for (let vv of this.regionList) {
             if (vv.region_id === vl) {
               this.zoneList = vv.zones
             }
           }
           this.vpcGet(this.currentProjectId, vl)
           this.securityGet(this.currentProjectId, vl)
      },
      subAudit () {
        this.auditModal = false
        this.twoConfirmModal = true
      },
      changePage (page) {
        this.orderListInit(page * 10 - 10, 10)
      },
      show (vl) {
        this.currentResult = vl
        this.currentProjectId = vl.project.id
        this.currentId = vl.id
        this.auditModal = true
        this.jobGet(vl.project.id)
        this.component_data = [
          {
            action_id: 20,
            pillar: {dataoverwrite: ''}
          }
        ]
        this.formItem = {
            region: '',
            zone: '',
            subnet_id: '',
            vpc_id: '',
            group_id: ''
        }
      },
      orderListInit (start = 0, end = 10) {
        this.loading = true
        axios.get(`${util.applyserver}/host_order/list/?offset=${start}&limit=${end}`)
          .then(res => {
            if (res.data.code === 20000) {
              this.data1 = res.data.data
              this.totalPage = res.data.count
            } else {
              util.err_notice(res.data.msg)
            }
            this.loading = false
          }).catch(error => {
          util.err_notice(error)
        })
      },
      regionInit () {
        axios.get(`${util.url}/region/list/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.regionList = res.data.data
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      vpcGet (projectId, regionId) {
        axios.get(`${util.url}/vpc/list/?project=${projectId}`)
          .then(res => {
            if (res.data.code === 20000) {
              this.vpcList = res.data.data
              let vpctmpList = []
              for (let vv of this.vpcList) {
                if (vv.region_id === regionId) {
                  vpctmpList.push(vv)
                }
              }
              this.vpcList = vpctmpList
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      securityGet (projectId, regionId) {
        axios.get(`${util.url}/security_group/list/?project=${projectId}`)
          .then(res => {
            if (res.data.code === 20000) {
              this.groupList = res.data.data
              let groupList = []
              for (let vv of this.groupList) {
                if (vv.region_id === regionId) {
                    groupList.push(vv)
                }
              }
              this.groupList = groupList
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      jobGet (projectId) {
        axios.get(`${util.url}/job/actions/?project=${projectId}`)
          .then(res => {
            if (res.data.code === 20000) {
               this.jobList = res.data.data
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      }
    },
    mounted () {
      this.orderListInit()
      this.regionInit()
    }
  }
</script>
