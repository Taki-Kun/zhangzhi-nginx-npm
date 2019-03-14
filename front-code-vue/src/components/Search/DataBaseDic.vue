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
        项目列表
      </p>
      <div class="edittable-self-con" style="overflow: auto ">
        <!--<Form :label-width="80">

        </Form>-->
        <div class="tree">
          <template>
            <Tree :data="baseData" @on-select-change="selectPro"></Tree>
          </template>
        </div>

      </div>
    </Card>
    </Col>
    <Col span="20" class="padding-left-10">
    <Card>
      <div slot="title">
        <p slot="title" v-if="proName.length == 0 || proName == '业务项'">
          请选择左边的具体项目
        </p>
        <i-button v-if="proName.length != 0 && proName != '业务项'" type="info" size="small" @click="addGroup">添加用户组</i-button>

      </div>
      <div class="edittable-table-height-con" style="overflow: auto">

        <i-table v-if="proName.length != 0 && proName != '业务项'" border :loading="loading" :columns="columns1" :data="data1"></i-table>

      </div>

    </Card>
    </Col>
  </Row>


  <Modal v-model="editInfodModal" :width="800" @on-ok="actionGroup">
    <h3 slot="header" style="color:#2D8CF0">{{ groupText }}</h3>
    <Form :label-width="120" label-position="right">
      <FormItem label="组名:">
        <Input v-model='groupdetail' placeholder="输入组名称"></Input>
      </FormItem>
      <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
      <br>
      <FormItem label="所属项目:" v-if="addgroup == false">
        <RadioGroup v-model="button1" v-for="pro in proList" type="button">
          <Radio :label="pro.id">{{ pro.name }}</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="拥有权限:">
        <Select v-model="privs" multiple style="width:460px">
          <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </FormItem>
    </Form>
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
  name: 'DataBaseDic',
  data () {
    return {
      loading: false,
      privs: [],
      button1: '',
      proList: [{'id': 3, 'name': 'test3'}, {'id': 4, 'name': 'test4'}, {'id': 5, 'name': 'test5'}],
      groupText: '',
      baseData: [{
        expand: true,
        title: '业务项',
        children: ''
      }],
        cityList: [
            {
                value: 'New York',
                label: 'New York'
            },
            {
                value: 'London',
                label: 'London'
            },
            {
                value: 'Sydney',
                label: 'Sydney'
            },
            {
                value: 'Ottawa',
                label: 'Ottawa'
            },
            {
                value: 'Paris',
                label: 'Paris'
            },
            {
                value: 'Canberra',
                label: 'Canberra'
            }
        ],
      columns1: [
        {
          title: 'id',
          key: 'id'
        },
        {
          title: '组名',
          key: 'name'
        },
        {
          title: 'Action',
          key: 'action',
          width: 150,
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
                    this.show(params.index)
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
                    this.remove(params.index)
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      data1: [],
      editInfodModal: false,
      groupdetail: '',
      groupIndex: 0,
      addgroup: false,
      proName: '',
      proId: ''
    }
  },

  methods: {
    addGroup () {
      if (this.proName.length === 0 || this.proName === '业务项') {
        this.$Modal.error({
          title: '添加组提醒',
          content: '<p>请选择相应的项目添加组！！</p>'
        })
      } else {
        this.groupText = '新增【' + this.proName + '】对应的权限和组名'
        this.editInfodModal = true
        this.addgroup = true
        this.groupdetail = ''
        this.privs = []
      }
    },
    selectPro (vl) {
      if (vl[0]) {
        this.proName = vl[0].title
        this.proId = vl[0].id
        this.groupinit(this.proId)
      }
    },
    show (index) {
      this.groupText = '权限和组名修改'
      this.addgroup = false
      this.editInfodModal = true
      this.groupIndex = index
      this.button1 = this.proId
      this.groupdetail = this.data1[this.groupIndex].name
      this.privs = this.data1[this.groupIndex].privs
    },
    remove (index) {
      this.$Modal.confirm({
        title: '删除提醒',
        content: '<p>是否删除【' + this.data1[index].name + '】</p>',
        onOk: () => {
          axios.post(`${util.url}/delete/`, {'resource': 'group', 'id': this.data1[index].id}).then(res => {
            if (res.data.code === 20000) {
              this.data1.splice(index, 1);
              this.$Message.info('删除成功');
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
            util.ajanxerrorcode(this, error)
          })
        }
      });
    },
    actionGroup () {
        let addgData = {}
        if (!this.addgroup) {
          addgData.id = this.data1[this.groupIndex].id
          addgData.project_id = this.button1
        } else {
          addgData.project_id = this.proId
        }
        addgData.name = this.groupdetail
        addgData.privs = this.privs
        axios.post(`${util.url}/priv_group/edit/`, addgData)
          .then(res => {
            if (res.data.code === 20000) {
              if (this.addgroup) {
                this.data1.push(res.data.data)
              } else {
                this.groupinit(this.proId)
              }
              this.$Message.info('操作成功')
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
    },
    proinit () {
      axios.post(`${util.url}/projects/`)
        .then(res => {
          if (res.data.code === 20000) {
            for (var i = 0; i < res.data.data.length; i++) {
              delete (res.data.data[i].children)
            }
            this.baseData[0].children = res.data.data
            this.proList = res.data.data
          } else {
              util.err_notice(res.data.msg)
          }
        }).catch(error => {
        util.ajanxerrorcode(this, error)
      })
    },
    groupinit (proid) {
      this.loading = true
      axios.get(`${util.url}/project/` + proid + '/')
        .then(res => {
          if (res.data.code === 20000) {
            this.data1 = res.data.data.priv_groups
            this.loading = false
          } else {
              util.err_notice(res.data.msg)
          }
        }).catch(error => {
        util.ajanxerrorcode(this, error)
      })
    },
    privileges () {
        axios.get(`${util.url}/privileges/`)
            .then(res => {
                if (res.data.code === 20000) {
                    console.log(res.data.data)
                    for (var i = 0; i < res.data.data.length; i++) {
                        res.data.data[i]['value'] = res.data.data[i].id
                        res.data.data[i]['label'] = res.data.data[i].name
                    }
                    this.cityList = res.data.data
                } else {
                    util.err_notice(res.data.msg)
                }
            }).catch(error => {
            util.ajanxerrorcode(this, error)
        })
      }
  },
  mounted () {
    this.proinit()
    this.privileges()
  }
}
</script>
