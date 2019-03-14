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
          <Icon type="md-laptop"></Icon>
          申请机器
        </p>
        <Row>
          <Col span="9" offset="5">
            <Form :model="formItem" :label-width="120">
              <FormItem label="所属项目">
                <Select v-model="formItem.project_id" filterable @on-change="choosePro">
                  <Option v-for="item in proList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem label="所属业务">
                <Select v-model="formItem.role_id" filterable>
                  <Option v-for="item in roleList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem label="选择配置">
                <Select v-model="formItem.tpl_id" filterable>
                  <Option v-for="item in tplList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem label="选择数量">
                 <InputNumber :max="5" :min="1" v-model="formItem.count" style="width:100%;"></InputNumber>
              </FormItem>
              <FormItem label="审核人">
                <Select v-model="formItem.dst_user_id" filterable placeholder="请选择运维人员...">
                  <Option v-for="item in userList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem label="抄送人">
                <Select v-model="formItem.cc_user_id" filterable placeholder="请选择负责人...">
                  <Option v-for="item in userList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem label="申请原因">
                <Input v-model="formItem.desc" type="textarea" :autosize="{minRows: 6,maxRows: 8}" placeholder="请填写申请原因..."></Input>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="sumbit">提交</Button>
              </FormItem>
            </Form>
          </col>
          <Spin size="large" fix v-if="spinShow"></Spin>
          <div v-if="spinShow">正在提交，请稍后...</div>
        </Row>
      </Card>
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
    name: 'FileAction',
    data () {
      return {
        spinShow: false,
        formItem: {
          role_id: '',
          project_id: '',
          count: 1,
          tpl_id: '',
          desc: '',
          dst_user_id: '',
          cc_user_id: ''
        },
        proList: [],
        roleList: [],
        tplList: [],
        userList: []
      }
    },
    methods: {
      choosePro (vl) {
         console.log(vl, 1111111111111111111111)
         for (let rr of this.proList) {
             if (rr.id === vl) {
                  this.roleList = rr.children
             }
         }
      },
      tmplConfigInit () {
        axios.get(`${util.applyserver}/host_tpl/list/`)
          .then(res => {
            if (res.data.code === 20000) {
                this.tplList = res.data.data
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(this, error)
        })
      },
      proinit () {
        axios.post(`${util.url}/projects/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.proList = res.data.data
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
      },
      userInit () {
        axios.get(`${util.url}/users/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.userList = res.data.data
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      sumbit () {
        this.spinShow = true
        axios.post(`${util.applyserver}/host_order/new/`, this.formItem)
          .then(res => {
            if (res.data.code === 20000) {
                  console.log(res.data.data, 111111111111111111111111111111111111)
                  this.$Modal.info({
                    title: '申请提醒',
                    content: '申请完成，已发送消息到相关用户！请等待审核人批准购买！'
                  });
                  this.spinShow = false
                  this.formItem = {
                    role_id: '',
                    project_id: '',
                    count: 1,
                    tpl_id: '',
                    desc: '',
                    dst_user_id: '',
                    cc_user_id: ''
                  }
            } else {
                 util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      }
    },
    mounted () {
      this.proinit()
      this.userInit()
      this.tmplConfigInit()
    }
  }
</script>
