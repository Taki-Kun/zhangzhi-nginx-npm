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
          更新作业列表
        </p>
        <Row>
          <Col span="24">

            <Table :loading="loading" border :columns="colums" :data="data1" stripe ref="selection"
            ></Table>

          </Col>
        </Row>
      </Card>
    </Row>

    <Modal v-model="grayInfodModal" :width="1000">
      <h3 slot="header" style="color:#2D8CF0">详情</h3>
      <Form :model="formItem" :label-width="250" label-position="right">
        <FormItem label="版本号:">
          <Input v-model='formItem.version' placeholder="请输入版本号"></Input>
        </FormItem>
        <div v-for="(val, index) in currenttasks">
          <FormItem :label="'第' + (index + 1) + '步 【' + val.action.name + '】'">
            <Input v-model="val.args" placeholder="请输入这个步骤需要执行的参数"></Input>
          </FormItem>
          <FormItem :label="val.action.name + '.'+ vl " v-for="(vl, index) in val.action.keys">
            <Input v-model="val.action.pillardict[vl]" placeholder="请输入这个步骤需要执行的参数"></Input>
          </FormItem>
          <FormItem :label="'第' + (index + 1) + '步【' + val.action.name + '】所选服务器'">
            <div v-for="s in val.minions">{{s}}</div>
          </FormItem>
        </div>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="sumbitUpdateArgs()">快速调度</Button>
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
        formItem: {
           version: ''
        },
        data1: [],
        loading: false,
        grayInfodModal: false,
        currenttasks: [],
        colums: [
          {
            title: 'id',
            key: 'id',
            width: 100
          },
          {
            title: '环境',
            key: 'env'
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
            title: '名称',
            key: 'name'
          },
          {
            title: '服务',
            key: 'service'
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
                }, '详情'),
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
      detail (vl) {
        this.currenttasks = vl.tasks
        for (var i = 0; i < this.currenttasks.length; i++) {
          this.currenttasks[i]['args'] = ''
          let keyList = this.currenttasks[i].action.keys
          this.currenttasks[i].action.pillardict = {}
          if (keyList.length === 0) {
            this.currenttasks[i].action.pillardict = {}
          } else {
            for (var h = 0; h < this.currenttasks[i].action.keys.length; h++) {
              let hkey = this.currenttasks[i].action.keys[h]
              this.currenttasks[i].action['pillardict'][hkey] = ''
            }
          }
        }
        this.grayInfodModal = true
      },
      remove (vl) {
        this.$Modal.confirm({
          title: '删除提醒',
          content: '<p>是否删除灰度更新作业【' + vl.name + '】</p>',
          onOk: () => {
            this.loading = true
            axios.get(`${util.stage}/vu/delete/?id=${vl.id}`)
              .then(res => {
                if (res.data.code === 20000) {
                  this.$Message.success('操作成功')
                  this.initGrayJob()
                  this.loading = false
                } else {
                  util.err_notice(res.data.msg)
                }
              }).catch(error => {
              util.err_notice(error)
            })
          }
        });
      },
      initGrayJob () {
        this.loading = true
        axios.get(`${util.stage}/vu/list/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.data1 = res.data.data
              this.loading = false
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      sumbitUpdateArgs () {
        let clplist = []
        let pillarlist = []
        for (let g = 0; g < this.currenttasks.length; g++) {
          clplist.push(this.currenttasks[g].args)
          pillarlist.push(this.currenttasks[g].pillardict)
        }
        this.loading = true
        axios.post(`${util.stage}/vu/do/`, {version: this.formItem.version, clp_list: clplist, pillar_list: pillarlist})
          .then(res => {
            if (res.data.code === 20000) {
              this.loading = false
              this.$Message.success('操作成功')
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      }
    },
    mounted () {
      this.initGrayJob()
    }
  }
</script>
