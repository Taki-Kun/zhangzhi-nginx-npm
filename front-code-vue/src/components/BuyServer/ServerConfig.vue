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
    pre {
        display: block;
        overflow: auto;
        color:#abb2bf;
        background:#282c34;
        padding: 5px 10px;
        border: 1px solid #eee;
        word-wrap:break-word;
    }
    .vertical-center-modal{
        display: flex;
        align-items: center;
        justify-content: center;

        .ivu-modal{
            top: 0;
        }
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
                            <i-button type="success" @click="addserver" icon="md-add-circle">添加配置</i-button>
                        </Col>
                        <!--<Col span="3" offset="9">
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
                        </Col>-->
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

        <Modal v-model="serverInfodModal" :width="1050" :mask-closable="false">
            <h3 slot="header" style="color:#2D8CF0">{{actionName}}</h3>
            <Form :model="formItem" :label-width="120" label-position="right">
                    <FormItem label="配置名称">
                        <Input v-model="formItem.name" placeholder="请输入机器配置名称..."></Input>
                    </FormItem>
                    <FormItem label="付费类型">
                      <RadioGroup v-model="formItem.charge_type" type="button">
                        <Radio label="PrePaid">包年包月</Radio>
                        <Radio label="PostPaid">按量付费</Radio>
                      </RadioGroup>
                    </FormItem>
                  <FormItem label="系列">
                    <RadioGroup v-model="configTypeval" type="button" @on-change="configtypeChange">
                      <Radio v-for="val in configTypeList" :label="val">{{val}}</Radio>
                    </RadioGroup>
                  </FormItem>
                    <FormItem label="配置">
                      <RadioGroup v-model="formItem.spec" type="button">
                         <Radio v-for="val in allspecifList" :label="val.spec" v-if="val.verbose === configTypeval">{{val.cpu}}核 {{val.mem}}G</Radio>
                      </RadioGroup>
                    </FormItem>
                     <FormItem label="镜像">
                       <RadioGroup v-model="formItem.image_id" type="button">
                         <Radio v-for="item in imageList" :label="item.image_id">{{item.os_name}}</Radio>
                       </RadioGroup>
                     </FormItem>
                    <FormItem label="数据盘类型">
                      <RadioGroup v-model="formItem.data_disk_type" type="button">
                        <Radio label="cloud">普通云盘</Radio>
                        <Radio label="cloud_efficiency">高效云盘</Radio>
                        <Radio label="cloud_ssd">SSD 云盘</Radio>
                        <Radio label="ephemeral_ssd">本地 SSD 盘</Radio>
                        <Radio label="cloud_essd">ESSD 云盘</Radio>
                      </RadioGroup>
                    </FormItem>
                    <FormItem label="数据盘大小">
                      <Slider v-model="formItem.data_disk_size" show-input style="width: 500px" :max="2048"></Slider>
                    </FormItem>
                    <FormItem label="带宽(M)">
                      <Slider v-model="formItem.bandwidth" show-input style="width: 500px"></Slider>
                    </FormItem>
            </Form>
            <div slot="footer">
                <Button type="primary" @click="sumbit()">提交</Button>
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
        name: 'serverManage',
        data () {
            return {
                actionName: '购买详情',
                imageList: [],
                configTypeList: [],
                configTypeval: '通用型',
                formItem: {
                      id: '',
                      name: '',
                      charge_type: 'PrePaid',
                      data_disk_type: 'cloud_efficiency',
                      data_disk_size: 0,
                      bandwidth: 100,
                      spec: '',
                      image_id: 'centos_6_09_64_20G_alibase_20180326.vhd',
                      os: 'linux'
                  },
                serverInfodModal: false,
                proList: [],
                model1: '',
                searchCol: '',
                loading: false,
                allspecifList: [],
                colums: [
                    {
                       title: 'ID',
                       key: 'id'
                    },
                    {
                        title: '模板名称',
                        width: 300,
                        key: 'name'
                    },
                  {
                    title: '操作系统',
                    key: 'flavor'
                  },
                  {
                    title: 'cpu',
                    key: 'cpu',
                    render: (h, params) => {
                        let cpu = ''
                        for (let gg of this.allspecifList) {
                            if (params.row.spec === gg.spec) {
                                cpu = gg.cpu
                      }
                      }
                      return h('div', [
                        h('strong', cpu)
                      ]);
                    }
                  },
                  {
                    title: '内存',
                    key: 'mem',
                    render: (h, params) => {
                      let mem = ''
                      for (let gg of this.allspecifList) {
                        if (params.row.spec === gg.spec) {
                          mem = gg.mem
                        }
                      }
                      return h('div', [
                        h('strong', mem)
                      ]);
                    }
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
                    title: '创建时间',
                    key: 'created_time'
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
                                      this.copy(params.row)
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
                ],
                data1: [],
                totalPage: 1
            }
        },
        methods: {
          copy (vl) {
               this.show(vl)
               this.formItem.id = ''
          },
          configtypeChange () {
             // 型号发生改变的时候触发,清空选项
             this.formItem.spec = ''
          },
            show (vl) {
                this.serverInfodModal = true
                this.formItem = {
                  bandwidth: vl.bandwidth,
                  charge_type: vl.charge_type,
                  data_disk_size: vl.data_disk_size,
                  data_disk_type: vl.data_disk_type,
                  flavor: vl.flavor,
                  id: vl.id,
                  image_id: vl.image_id,
                  is_valid: vl.is_valid,
                  os: vl.os,
                  name: vl.name,
                  spec: vl.spec}
            },
            remove (vl) {
                this.$Modal.confirm({
                    title: '删除提醒',
                    content: '<p>是否删除模板【' + vl.name + '】</p>',
                    onOk: () => {
                      axios.get(`${util.applyserver}/host_tpl/delete/?id=${vl.id}`)
                        .then(res => {
                          if (res.data.code === 20000) {
                            this.tmplConfigInit()
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
            addserver () {
                this.serverInfodModal = true
                this.formItem = {
                  id: '',
                  name: '',
                  charge_type: 'PrePaid',
                  data_disk_type: 'cloud_efficiency',
                  data_disk_size: 0,
                  bandwidth: 100,
                  spec: '',
                  image_id: 'centos_6_09_64_20G_alibase_20180326.vhd',
                  os: 'linux'
                }
                this.configTypeval = '通用型'
            },
            changePage () {
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
                  util.err_notice(this, error)
                })
            },
          imageInit () {
            axios.get(`${util.applyserver}/image/list/`)
              .then(res => {
                if (res.data.code === 20000) {
                  let imageRepeat = []
                  for (var ii of res.data.data) {
                        if ((ii.flavor === 'CentOS' || ii.flavor === 'Ubuntu') && !imageRepeat.includes(ii.os_name)) {
                              this.imageList.push(ii)
                              imageRepeat.push(ii.os_name)
                        }
                  }
                  this.imageList.reverse()
                } else {
                  util.err_notice(res.data.msg)
                }
              }).catch(error => {
              util.err_notice(this, error)
            })
          },
           getSpecif () {
             axios.get(`${util.applyserver}/specification/list/`)
               .then(res => {
                 if (res.data.code === 20000) {
                   this.allspecifList = res.data.data
                   this.allspecifList.forEach(mm => {
                     this.configTypeList.push(mm.verbose)
                   })
                   this.configTypeList = Array.from(new Set(this.configTypeList))
                 } else {
                   util.err_notice(res.data.msg)
                 }
               }).catch(error => {
               util.err_notice(this, error)
             })
           },
            filterPro () {
            },
            searchTable () {
            },
            tmplConfigInit () {
              axios.get(`${util.applyserver}/host_tpl/list/`)
                .then(res => {
                  if (res.data.code === 20000) {
                       this.data1 = res.data.data
                  } else {
                    util.err_notice(res.data.msg)
                  }
                }).catch(error => {
                util.err_notice(this, error)
              })
            },
            sumbit () {
              let flavor = ''
              for (var gg of this.imageList) {
                   if (gg.image_id === this.formItem.image_id) {
                         flavor = gg.flavor
                   }
              }
              if (!this.formItem.spec) {
                 util.err_notice('配置不能为空！！')
                 return false
              }
              this.formItem['flavor'] = flavor
              axios.post(`${util.applyserver}/host_tpl/edit/`, this.formItem)
                .then(res => {
                  if (res.data.code === 20000) {
                    this.$Message.success('操作成功')
                    this.serverInfodModal = false
                    this.tmplConfigInit()
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
          this.getSpecif()
          this.imageInit()
          this.tmplConfigInit()
        }
    }
</script>
