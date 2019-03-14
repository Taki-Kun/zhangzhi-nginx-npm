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
        <div slot="title">
          <Row>
               <Col span="2">
                 <i-button type="primary" icon="md-add" @click="addActionType">添加动作类型</i-button>
               </Col>
          </Row>
        </div>
        <Row>
          <Col span="24">

            <Table :loading="loading" border :columns="colums" :data="data1" stripe ref="selection"
            ></Table>

          </Col>
        </Row>
      </Card>
    </Row>

    <Modal v-model="actionInfodModal" :width="800">
      <h3 slot="header" style="color:#2D8CF0">动作类型</h3>
      <Form :model="actionObj" :label-width="120" label-position="right">
        <FormItem label="所属项目:">
          <!--<Input v-model='saltObj.project_id' placeholder="请输入功能名称"></Input>-->
          <Select v-model="actionObj.project_id">
            <Option v-for="item in proList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="动作名称:">
          <Input v-model='actionObj.name' placeholder="请输入功能名称"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="更新前是否退休:">
          <i-switch v-model="actionObj.hot_update" size="large">
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <div v-for="(val, key) in actionObj.steps">
            <FormItem :label="'执行步骤' + (key + 1)">
              <Select v-model="actionObj.steps[key]" filterable style="width: 82%">
                <Option v-for="commend in commendList" :value='commend.id' :key='commend.id'>【{{commend.project.name ? commend.project.name : '公共模块'}}】{{commend.name}}—{{commend.func}}</Option>
              </Select>
              <Button type="default" @click="handleRemove(key)" icon="md-remove">删除</Button>
            </FormItem>
          <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
          <br>
        </div>
        <FormItem>
          <Row>
            <Col span="12">
              <Button type="dashed" long @click="actionAdd" icon="md-add">添加步骤</Button>
            </Col>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
           <Button type="primary" @click="sumActionAdd">提交</Button>
      </div>
    </Modal>

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
    name: 'grayHistory',
    data () {
      return {
        data1: [],
        loading: false,
        actionInfodModal: false,
        commendList: [],
        actionObj: {
          project_id: '',
          name: '',
          hot_update: true,
          steps: [''
          ]
        },
        proList: [],
        colums: [
          {
            title: 'id',
            key: 'id',
            width: 100
          },
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '项目',
            key: 'name',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.project.name)
              ]);
            }
          },
          {
            title: '更新前是否退休',
            key: 'hot_update'
          },
          {
            title: '操作',
            key: 'hot_update',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
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
                }, '修改'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.row)
                    }
                  }
                }, '删除')
              ]);
            }
          }
        ]
      }
    },
    methods: {
      show (vl) {
        this.actionObj = JSON.parse(JSON.stringify(vl))
        this.actionObj.project_id = vl.project.id
        this.actionObj.steps = []
        vl.steps.forEach(value => this.actionObj.steps.push(value.id))
        this.actionInfodModal = true
      },
      remove (vl) {
        this.$Modal.confirm({
          title: '删除提醒',
          content: '<p>是否删除类型【' + vl.name + '】</p>',
          onOk: () => {
            axios.get(`${util.stage}/action/delete/?id=${vl.id}`)
              .then(res => {
                if (res.data.code === 20000) {
                  this.initActionList()
                  this.$Message.success('操作成功')
                } else {
                  util.err_notice(res.data.msg)
                }
              }).catch(error => {
              util.err_notice(this, error)
            })
          }
        });
      },
      sumActionAdd () {
        this.loading = true
        axios.post(`${util.stage}/action/edit/`, this.actionObj)
          .then(res => {
            if (res.data.code === 20000) {
              this.initActionList()
              this.$Message.info('操作成功！！')
            } else {
              util.err_notice(res.data.msg)
            }
            this.loading = false
            this.actionInfodModal = false
          }).catch(error => {
          util.err_notice(error)
        })
      },
      handleRemove (index) {
        this.actionObj.steps.splice(index, 1)
      },
      actionAdd () {
         this.actionObj.steps.push('')
      },
      addActionType () {
        this.actionObj = {
          project_id: '',
            name: '',
            hot_update: true,
            steps: [''
          ]
        }
        this.actionInfodModal = true
      },
      initActionList () {
        axios.get(`${util.stage}/action/list/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.data1 = res.data.data
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      initCommandList () {
        axios.get(`${util.url}/job/actions/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.commendList = res.data.data
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
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
               util.err_notice(error)
          })
      }
    },
    mounted () {
      this.initActionList()
      this.proinit()
      this.initCommandList()
    }
  }
</script>
