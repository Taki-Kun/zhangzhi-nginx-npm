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
              <div slot="title">
                <i-button type="primary" @click="editPro('add')" icon="md-add">&nbsp增加</i-button>
                <i-button type="success" @click="editPro('edit')" icon="md-create">&nbsp修改</i-button>
                <i-button type="error" @click="delPro" icon="md-close-circle">&nbsp删除</i-button>
              </div>
              <div class="edittable-self-con">
                  <Scroll height="550">
                               <Tree :data="baseData" @on-select-change="selectPro" empty-text="数据加载中..."></Tree>
                   </Scroll>
              </div>
            </Card>

      </Col>


      <Col span="20" class="padding-left-10">
        <Card>
          <p slot="title">
            <Icon type="ios-redo"></Icon>
            {{typeName}}

          </p>
          <div class="edittable-table-height-con" style="height: 650px;overflow: auto ">

            <template>
              <Form :model="formItemRole" :label-width="80" v-if="currentNode == 'role'">
                <FormItem label="角色名称">
                  <Input v-model="formItemRole.name" style="width: 800px" disabled></Input>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
                <template>
                    <FormItem label="主机:">
                      <Select v-model="formItemRole.hosts" style="width: 800px" filterable multiple disabled>
                        <Option v-for="host in hostList" :value="host.id" :key="host.id">{{ host.instance_id }} 《========》 {{ host.instance_name }}</Option>
                      </Select>
                    </FormItem>
                    <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                    <br>
                </template>
                <FormItem label="首字母缩写">
                  <Input v-model="formItemRole.acronym" style="width: 800px" disabled></Input>
                </FormItem>
              </Form>

              <Form :model="formItemPro" :label-width="80" v-if="currentNode == 'project'">
                <FormItem label="项目名称">
                  <Input v-model="formItemPro.name" style="width: 800px" disabled></Input>
                </FormItem>
                <FormItem label="首字母缩写">
                  <Input v-model="formItemPro.acronym" style="width: 800px" disabled></Input>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
              </Form>
            </template>
          </div>

        </Card>
      </Col>
    </Row>


    <Modal v-model="editInfodModal" :width="800" @on-ok="actionPro">
      <h3 slot="header" style="color:#2D8CF0">{{ actionName }}</h3>
      <Form :model="formItemRole" :label-width="120" label-position="right" v-if="currentNode == 'role'">
        <FormItem label="角色名称:">
          <Input v-model='formItemRole.name' placeholder="请输入节点名称"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="主机:">
          <Select v-model="formItemRole.hosts" filterable multiple>
            <Option v-for="host in hostList" :value="host.id" :key="host.id">{{ host.instance_id }} 《========》 {{ host.instance_name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="首字母缩写">
          <Input v-model="formItemRole.acronym"></Input>
        </FormItem>
      </Form>

      <Form :model="formItemPro" :label-width="120" label-position="right" v-if="currentNode == 'project'">
        <FormItem label="项目名称:">
          <Input v-model='formItemPro.name' placeholder="请输入节点名称"></Input>
        </FormItem>
        <FormItem label="首字母缩写">
          <Input v-model="formItemPro.acronym"></Input>
        </FormItem>
      </Form>
    </Modal>


    <Modal v-model="addInfodModal" :width="800" @on-ok="actionPro">
      <h3 slot="header" style="color:#2D8CF0">{{ actionName }}</h3>
      <Form :model="formItemRole" :label-width="120" label-position="right">
        <FormItem label="添加对象:">
          <RadioGroup v-model="addchoose" type="button" size="large">
            <Radio label="project">项目</Radio>
            <Radio label="role">角色</Radio>
          </RadioGroup>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="新增名称:">
          <Input v-model='formItem.name' placeholder="请输入节点名称"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="首字母缩写">
          <Input v-model="formItem.acronym"></Input>
        </FormItem>
      </Form>
    </Modal>

    <Modal width="1360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>字段详情</span>
      </p>
      <div style="text-align:center">
      </div>
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
        hostList: [], // 主机集合
        formItemRole: {
          id: 0,
          name: '',
          hosts: '',
          acronym: ''
        },
        formItemPro: {
          id: 0,
          name: '',
          acronym: ''
        },
        baseData: [],
        currentNode: '', // 当前的点击所选项目或角色
        editInfodModal: false,
        typeName: '请选择左边的项目或者角色查看详情', // 选择项目或者角色
        actionName: '',
        formItem: {
          id: 0,
          name: '',
          hosts: '',
          acronym: ''
        },
        addInfodModal: false, // 增加模态框
        addchoose: 'role',
        addurl: 'project'
      }
    },
    methods: {
      actionPro () {
        if (this.actionName === '增加') {
          if (this.addchoose === 'role') {
            if (this.currentNode === 'role') {
              this.formItem = {'name': this.formItem.name, 'project_id': this.formItemRole.project_id, 'acronym': this.formItem.acronym, 'host_ids': '', 'desc': 'test'}
            } else if (this.currentNode === 'project') {
              console.log(this.currentNode)
              this.formItem = {'name': this.formItem.name, 'project_id': this.formItemPro.id, 'acronym': this.formItem.acronym, 'host_ids': '', 'desc': 'test'}
            }
          } else {
            this.formItem = {'name': this.formItem.name}
          }
          this.addurl = `${util.url}/${this.addchoose}/edit/`
        } else if (this.actionName === '修改') {
          if (this.currentNode === 'role') {
            this.formItem = {'id': this.formItemRole.id, 'name': this.formItemRole.name, 'project_id': this.formItemRole.project_id, 'acronym': this.formItemRole.acronym, 'host_ids': this.formItemRole.hosts, 'desc': 'test'}
          } else if (this.currentNode === 'project') {
            this.formItem = this.formItemPro
          }
          this.addurl = `${util.url}/${this.currentNode}/edit/`
        }
        axios.post(this.addurl, this.formItem)
          .then(res => {
            if (res.data.code === 20000) {
              this.proinit()
              this.$Message.info('操作成功');
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
      },
      delPro () {
        if (this.currentNode === 'role') {
          this.formItem = this.formItemRole
        } else if (this.currentNode === 'project') {
          this.formItem = this.formItemPro
        }
        this.$Modal.confirm({
          title: '删除提醒',
          content: '<p>是否删除</p>',
          onOk: () => {
            axios.post(`${util.url}/delete/`, {'resource': this.currentNode, 'id': this.formItem.id})
              .then(res => {
                if (res.data.code === 20000) {
                  this.proinit()
                  this.$Message.info('删除成功');
                  this.currentNode = ''
                } else {
                  util.err_notice(res.data.msg)
                }
              }).catch(error => {
              util.ajanxerrorcode(this, error)
            })
          }
      })
      },
      editPro (action) {
        if (this.currentNode.length === 0) {
          util.err_notice('请选择项目或者角色进行添加或者修改！！')
          return false
        }
        if (action === 'add') {
          this.actionName = '增加'
          this.addInfodModal = true
        } else if (action === 'edit') {
          this.actionName = '修改'
          this.editInfodModal = true
        }
      },
      selectPro (vl) {
          if (vl[0] && vl[0].id) {
            this.typeName = '【' + vl[0].name + '】相关详情'
            if (vl[0].top === true) {
              this.currentNode = 'project'
              this.formItemPro = vl[0]
            } else {
              this.currentNode = 'role'
              this.formItemRole = vl[0]
              this.getrole(vl[0].id)   // 获取主机信息
            }
          } else {
            this.currentNode = ''
          }
      },
      getrole (roleid) {
        axios.get(`${util.url}/role/${roleid}/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.hostList = res.data.data.candidate_hosts
              this.formItemRole.hosts = res.data.data.host_ids
            }
          }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
      },
      proinit () {
        axios.post(`${util.url}/projects/?p=role`)
          .then(res => {
            if (res.data.code === 20000) {
              for (var i = 0; i < res.data.data.length; i++) {
                  res.data.data[i]['expand'] = 'true'
                  for (var g = 0; g < res.data.data[i].children.length; g++) {
                      delete (res.data.data[i].children[g].children)
                  }
              }
            }
              const basemainData = {
                  expand: true,
                  title: '业务列表',
                  children: [],
                  top: 1
              }
              basemainData['children'] = res.data.data
              this.baseData = [basemainData]
          }).catch(error => {
          util.err_notice(error)
          util.ajanxerrorcode(this, error)
        })
      },
      hostinit () {
        axios.get(`${util.url}/hosts/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.hostList = res.data.data
            }
          }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
      }
    },
    mounted () {
      this.proinit()
      this.hostinit()
    }
  }
</script>
