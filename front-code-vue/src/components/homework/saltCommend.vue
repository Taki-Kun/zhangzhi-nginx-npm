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
            <Col span="3">
              <i-button type="success" @click="addcommend" icon="md-add-circle">添加模块</i-button>
            </Col>
            <Col span="3" offset="9">
              <Select v-model="model1" style="width:250px" @on-change="filterPro" filterable label-in-value placeholder="请选择相应项目">
                <Option v-for="item in proList" :value="item.id" :key="item.name">{{ item.name }}</Option>
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
        <Row>
          <Col span="24">

            <Table border :loading="loading" :columns="colums" :data="data1" stripe ref="selection"
            ></Table>
            <br>
            <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

          </Col>
        </Row>
      </Card>
    </Row>

    <Modal v-model="saltInfodModal" :width="800" @on-cancel="cancel">
      <h3 slot="header" style="color:#2D8CF0">{{actionName}}</h3>
      <Form ref="saltObj" :model="saltObj" :label-width="120" label-position="right">
        <FormItem label="所属项目:">
          <!--<Input v-model='saltObj.project_id' placeholder="请输入功能名称"></Input>-->
          <Select v-model="saltObj.project_id">
            <Option v-for="item in proList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="功能名称:" :rules="{required: true}" prop="name">
          <Input v-model='saltObj.name' placeholder="请输入功能名称"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="模块名称:" :rules="{required: true}" prop="func">
          <Input v-model='saltObj.func' placeholder="请输入模块名称"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>

        <FormItem label="参数:">
          <Input v-model='saltObj.args' placeholder="请输入参数，多个参数用【,】隔开"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem
                v-for="(item, index) in saltObj.keys"
                :label="'Pillar参数键'">
          <Row>
            <Col span="18">
              <Input type="text" v-model="saltObj.keys[index]" placeholder="请输入key值，运行时将会携带发送"></Input>
            </Col>
            <Col span="4" offset="1">
              <Button type="default" @click="handleRemove(index)">删除</Button>
            </Col>
          </Row>
        </FormItem>
        <FormItem>
          <Row>
            <Col span="12">
              <Button type="dashed" long @click="handleAdd" icon="md-add">加pillar的键</Button>
            </Col>
          </Row>
        </FormItem>
        <FormItem>
               <Button type="primary" @click="actionModel('saltObj')">提交</Button>
        </FormItem>
      </Form>
      <div slot="footer">
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
    name: 'DataBaseDic',
    data () {
      return {
       loading: true,
        model1: '',
        searchCol: '',
        proList: [],
        allsearchdata: [],
        totalPage: 1,
        actionName: '添加salt模块',
        startPage: 0,
        endPage: 10,
        saltObj: {
          id: '',
          name: '',
          func: '',
          args: '',
          keys: [],
          project_id: ''
        },
        saltdefaultObj: {
          id: '',
          name: '',
          func: '',
          args: '',
          keys: [],
          project_id: ''
        },
        colums: [
          {
            title: 'id',
            key: 'id',
            width: 100
          },
          {
              title: '所属项目',
              key: 'name',
              render: (h, params) => {
                  if (!params.row.project.name) {
                      return h('span', '公共模块')
                  } else {
                      return h('span', params.row.project.name)
                  }
              }
          },
          {
             title: '功能名称',
             key: 'name'
          },
          {
            title: '模块名称',
            key: 'func'
          },
          {
            title: '参数',
            key: 'args'
          },
          {
                title: '创建人',
                key: 'user',
                render: (h, params) => {
                    return h('div', [
                        h('strong', params.row.user.name)
                    ]);
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
                        type: 'default',
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
                }, '拷贝'),
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
                      this.show(params.index, true)
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
        saltInfodModal: false
      }
    },
    methods: {
      addcommend () {
        this.actionName = '添加salt模块'
        this.saltInfodModal = true
        this.saltObj = this.saltdefaultObj
      },
      show (index, noCopy = false) {
        if (!noCopy) {
            this.actionName = '拷贝salt模块'
        } else {
            this.actionName = '修改salt模块'
        }
        this.saltInfodModal = true
        this.saltObj = {id: this.data1[index].id,
            name: this.data1[index].name,
            func: this.data1[index].func,
            args: this.data1[index].args,
            keys: this.data1[index].keys,
            project_id: this.data1[index].project.id}
        // 区分，如果是拷贝命令的话需要清除ID
        if (!noCopy) {
          this.saltObj['id'] = ''
        }
      },
      remove (index) {
        this.$Modal.confirm({
          title: '删除提醒',
          content: '<p>是否删除</p>',
          onOk: () => {
             axios.get(`${util.url}/job/action/${this.data1[index].id}/delete/`)
               .then(res => {
                 if (res.data.code === 20000) {
                   this.data1.splice(index, 1)
                   this.$Message.info('操作成功')
                 } else {
                   util.err_notice(res.data.msg)
                 }
               }).catch(error => {
               util.err_notice(error)
             })
          }
        });
      },
      changePage (page) {
        // this.data1 = this.allsearchdata.slice(page * 10 - 10, page * 10)
          this.saltInit(this.searchCol, page * 10 - 10, 10, this.model1)
      },
      actionModel (name, copy = false) {
          this.$refs[name].validate((valid) => {
              if (valid || copy) {
                  if (this.saltObj.keys.length !== 0) {
                      this.saltObj.keys = this.saltObj.keys.filter(e => { return e === 0 || e }) // 过滤一些undefined或者空的数组
                  }
                  axios.post(`${util.url}/job/action/edit/`, this.saltObj)
                      .then(res => {
                          if (res.data.code === 20000) {
                              this.saltInit()
                              this.saltInfodModal = false
                              this.$Message.success('操作成功')
                          } else {
                              util.err_notice(res.data.msg)
                          }
                      }).catch(error => {
                      util.err_notice(error)
                  })
              } else {
                  this.$Message.error('验证错误!');
                  return false
              }
          })
      },
      proinit () {
          axios.post(`${util.url}/projects/?p=job-action`)
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
      saltInit (values = '', start = 0, end = 10, project = '') {
          this.loading = true
          if (values.length !== 0) {
              var searchValue = `&q=${values}`
          } else {
              searchValue = ''
          }
          if (project.length !== 0) {
              var searchPro = `&project=${project}`
          } else {
              searchPro = ''
          }
        axios.get(`${util.url}/job/actions/?offset=${start}&limit=${end}&p=${searchValue}${searchPro}`)
          .then(res => {
              this.data1 = res.data.data
              this.totalPage = res.data.count
            // this.data1 = this.allsearchdata.slice(0, 10)
              this.loading = false
          }).catch(error => {
          util.err_notice(error)
        })
      },
     handleAdd () {
         this.index++;
         this.saltObj.keys.push('');
     },
     handleRemove (index) {
         this.saltObj.keys.splice(index, 1)
     },
     cancel () {
         this.saltInfodModal = false
     },
     searchTable () {
          this.saltInit(this.searchCol, this.startPage, this.endPage, this.model1)
     },
     filterPro (vl) {
          // console.log(vl, this.model1)
          // this.searchCol = vl.label
          // this.searchTable()
         this.saltInit(this.searchCol, this.startPage, this.endPage, this.model1)
     }
    },
    mounted () {
      this.saltInit()
      this.proinit()
    }
  }
</script>
