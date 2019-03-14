<style lang="less">
  @import '../../styles/common.less';
  @import '../Order/components/table.less';

  .demo-spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
  }
</style>
<template>
  <div>
    <Col span="6">
      <Card>
        <p slot="title">
          <Icon type="load-b"></Icon>
          添加数据库
        </p>
        <div class="edittable-testauto-con">
          <Form ref="formValidate" :model="formItem" :label-width="100" :rules="ruleInline">
            <FormItem label="选择项目" prop="project_id">
              <Select v-model="formItem.project_id" filterable>
                <Option v-for="p in allproject" :value="p.id">{{p.title}}</Option>
              </Select>
            </FormItem>
            <Form-item label="连接名称:" prop="name">
              <Input v-model="formItem.name" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="数据库地址:" prop="host">
              <Input v-model="formItem.host" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="端口:" prop="port">
              <Input v-model="formItem.port" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="用户名:" prop="account">
              <Input v-model="formItem.account" placeholder="请输入"></Input>
            </Form-item>
            <Form-item label="密码:" prop="passwd">
              <Input v-model="formItem.passwd" placeholder="请输入" type="password"></Input>
            </Form-item>
            <Button type="success" style="margin-left: 5%" @click="add()" >确定</Button>
            <Button type="warning" style="margin-left: 5%" @click="del()">重置</Button>
          </Form>
        </div>
      </Card>
    </Col>
    <Col span="18" class="padding-left-10">
      <Card>
        <p slot="title">
          <Icon type="ios-crop-strong"></Icon>
          数据库详情表
        </p>
        <div class="edittable-con-1">
          <Table :columns="columns" :data="rowdata" height="550"></Table>
        </div>
        <br>
        <Page :total="pagenumber" show-elevator :page-size="10" ref="totol"></Page>
      </Card>
    </Col>
    <Modal v-model="delbaseModal" :width="500">
      <h3 slot="header" style="color:#2D8CF0">删除数据库</h3>
      <Form :label-width="100" label-position="right">
        <FormItem label="数据库连接名">
          <Input v-model="delbasename" readonly="readonly"></Input>
        </FormItem>
        <FormItem label="请输入数据库连接名">
          <Input v-model="delconfirmbasename" placeholder="请确认数据库连接名"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="delbaseModal = false">取消</Button>
        <Button type="primary">删除</Button>
      </div>
    </Modal>

    <Modal v-model="baseinfo" :width="500" okText="保存" @on-ok="update_base">
      <h3 slot="header" style="color:#2D8CF0">数据库连接信息</h3>
      <Form :label-width="100" label-position="right">
        <FormItem label="选择项目">
          <Select v-model="editbaseinfo.project_id" filterable>
            <Option v-for="p in allproject" :value="p.id">{{p.title}}</Option>
          </Select>
        </FormItem>
        <FormItem label="连接名称:">
          <Input v-model="editbaseinfo.name"></Input>
        </FormItem>
        <FormItem label="数据库地址:">
          <Input v-model="editbaseinfo.host"></Input>
        </FormItem>
        <FormItem label="端口:">
          <Input v-model="editbaseinfo.port"></Input>
        </FormItem>
        <FormItem label="用户名:">
          <Input v-model="editbaseinfo.account"></Input>
        </FormItem>
        <FormItem label="密码:">
          <Input v-model="editbaseinfo.passwd" type="password"></Input>
        </FormItem>
      </Form>
    </Modal>

  </div>
</template>
<script>
  import '../../assets/tablesmargintop.css'
  import axios from 'axios'
  import util from '../../libs/util'
  import ICol from '../../../node_modules/iview/src/components/grid/col'

  export default {
    components: {
      ICol
    },
    name: 'sqlist',
    data () {
      return {
        columns: [
           {
               title: '项目',
               key: 'user',
               render: (h, params) => {
                   return h('div', [
                       h('strong', params.row.project.name)
                   ]);
               }
           },
          {
            title: '连接名称',
            key: 'name'
          },
          {
            title: '数据库地址',
            key: 'host'
          },
          {
            title: '用户名',
            key: 'account'
          },
          {
            title: '操作',
            key: 'action',
            width: 300,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    type: 'info'
                  },
                  on: {
                    click: () => {
                      this.edit_tab(params.index)
                    }
                  }
                }, '查看信息'),
                h('Button', {
                  style: {
                    marginLeft: '8px'
                  },
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.deldatabases(params.row)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        rowdata: [],
        modal: false,
        // 添加数据库信息
        formItem: {
          name: '',
          host: '',
          account: '',
          passwd: '',
          port: '3306',
          project_id: ''
        },
        // 添加表单验证规则
        ruleInline: {
          name: [{
            required: true,
            message: '请填写连接名称',
            trigger: 'blur'
          }],
          host: [{
            required: true,
            message: '请填写连接地址',
            trigger: 'blur'
          }],
          account: [{
            required: true,
            message: '请填写用户名',
            trigger: 'blur'
          }],
          port: [{
            required: true,
            message: '请填写端口',
            trigger: 'blur'
          }],
          passwd: [{
            required: true,
            message: '请填写密码',
            trigger: 'blur'
          }],
          project_id: [{
              required: true,
              message: '请选择项目',
              trigger: 'blur'
          }]
        },
        delbaseModal: false,
        delbasename: '',
        delconfirmbasename: '',
        pagenumber: 1,
        addDingding: false,
        dingdingbeforetext: '',
        dingdingaftertext: '',
        dingname: '',
        dingdingid: null,
        tmp_id: null,
        diclist: [],
        baseinfo: false,
        editbaseinfo: {},
        allproject: ''
      }
    },
    methods: {
        add () {
            axios.post(`${util.url}/db/edit/`, this.formItem)
                .then(res => {
                    if (res.data.code === 20000) {
                        this.dataInit()
                        this.$Message.info('操作成功')
                    } else {
                        util.err_notice(res.data.msg)
                    }
                }).catch(error => {
                util.err_notice(error)
            })
        },
        del () {
            this.modal = false
            this.formItem = {}
        },
        dataInit () {
            axios.get(`${util.url}/db/list/`)
                .then(res => {
                    if (res.data.code === 20000) {
                        console.log(res.data.data)
                        this.rowdata = res.data.data
                    } else {
                        util.err_notice(res.data.msg)
                    }
                }).catch(error => {
                util.err_notice(error)
            })
        },
        edit_tab (vl) {
            console.log(vl)
            this.baseinfo = true
            this.editbaseinfo = this.rowdata[vl]
        },
        deldatabases (vl) {
          this.$Modal.confirm({
            title: '删除提醒',
            content: '<p>是否删除连接【' + vl.name + '】</p>',
            onOk: () => {
              axios.get(`${util.url}/db/${vl.id}/delete/`)
                      .then(res => {
                        if (res.data.code === 20000) {
                          this.dataInit()
                        } else {
                          util.err_notice(res.data.msg)
                        }
                      }).catch(error => {
                util.err_notice(error)
                util.err_notice('内部错误，请找后端管理员')
              })
            }
          });
        },
        update_base () {
            axios.post(`${util.url}/db/edit/`, this.editbaseinfo)
                .then(res => {
                    if (res.data.code === 20000) {
                        this.$Message.info('操作成功')
                    } else {
                        util.err_notice(res.data.msg)
                    }
                    this.dataInit()
                }).catch(error => {
                util.err_notice(error)
            })
        },
        proInit () {
            axios.get(`${util.url}/projects/?p=db`)
                .then(res => {
                    if (res.data.code === 20000) {
                        this.allproject = res.data.data
                    } else {
                        util.err_notice(res.data.msg)
                    }
                }).catch(error => {
                util.err_notice(error)
            })
        }
    },
    mounted () {
      this.dataInit()
      this.proInit()
    }
  }
</script>
