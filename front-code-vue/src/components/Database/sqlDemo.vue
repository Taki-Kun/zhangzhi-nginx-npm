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
                        <i-button type="primary" icon="cube" @click="addsql">添加SQL模板</i-button>
                      </Col>
                      <Col span="4" offset="16">
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

                        <Table border :loading="loading" :columns="colums" :data="data1" stripe ref="selection"></Table>
                        <br>
                        <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

                    </Col>
                </Row>
            </Card>
        </Row>

        <Modal v-model="sqlInfodModal" :width="800" @on-ok="actionSQL">
            <h3 slot="header" style="color:#2D8CF0">SQL添加模板</h3>
            <Form :model="sqlObj" :label-width="120" label-position="right">
                <FormItem label="名称:">
                    <Input v-model='sqlObj.name' placeholder="请输入名称"></Input>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
                <FormItem label="功能说明:">
                    <Input v-model='sqlObj.desc' placeholder="请输入功能说明"></Input>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
                <FormItem label="连接:">
                    <Select v-model="sqlObj.db_id" @on-change="Connection_Name" placeholder="请选择连接名...">
                        <Option v-for="(val, key, index) in datalist" :key="val.id" :value="val.id">{{val.project.name}}《===》{{val.name}}</Option>
                    </Select>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
                <!--<FormItem label="数据库名称:">
                    <Select v-model="sqlObj.db_name" placeholder="请先选择连接名再选择数据库名...">
                        <Option v-for="(val, index) in databaselist" :key="val" :value="val">{{val}}</Option>
                    </Select>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>-->
                <FormItem label="是否限制人员查看">
                    <i-switch v-model="sqlObj.mac" size="large">
                        <span slot="open">是</span>
                        <span slot="close">否</span>
                    </i-switch>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
                <div v-if="sqlObj.mac">
                <FormItem label="限制查看人员">
                    <Select v-model="sqlObj.user_ids" multiple filterable placeholder="可输入名称进行搜索">
                        <Option v-for="item in allUser" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
                </div>
                <FormItem label="sql语句:">
                    <Input v-model='sqlObj.sql' type="textarea" :autosize="{minRows: 10,maxRows: 10}" placeholder="请输入sql模板，需要包括[[p]]"></Input>
                </FormItem>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
            </Form>
        </Modal>

        <Modal v-model="execAgainModal" :width="800" @on-ok="keyExec">
            <h3 slot="header" style="color:#2D8CF0">注意：【{{sqlObj.desc}}】</h3>
            <Form :label-width="120" label-position="right">
                <template v-for="(val, key, index) in keydict">
                   <FormItem :label="key">
                       <Input v-model='keydict[key]' placeholder="请输入相应的key值"></Input>
                   </FormItem>
                </template>
            </Form>
        </Modal>

    </div>
</template>



<script>
    import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
    import util from '../../libs/util'
    import axios from 'axios'
    import Csv from '../../../node_modules/iview/src/utils/csv'
    import ExportCsv from '../../../node_modules/iview/src/components/table/export-csv'
    import expandRow from './dataTable-expand.vue';

    const exportcsv = function exportCsv (params) {
        if (params.filename) {
            if (params.filename.indexOf('.csv') === -1) {
                params.filename += '.csv'
            }
        } else {
            params.filename = 'table.csv'
        }
        let columns = []
        let datas = []
        if (params.columns && params.data) {
            columns = params.columns
            datas = params.data
        } else {
            columns = this.columns
            if (!('original' in params)) params.original = true
            datas = params.original ? this.data : this.rebuildData
        }

        let noHeader = false
        if ('noHeader' in params) noHeader = params.noHeader
        const data = Csv(columns, datas, params, noHeader)
        if (params.callback) params.callback(data)
        else ExportCsv.download(params.filename, data)
    }
    export default {
        components: {
            ICol, expandRow
        },
        name: 'DataBaseDic',
        data () {
            return {
                searchCol: '',
                loading: false,
                allsearchdata: [],
                columnsName: [],
                keydict: {},
                execAgainModal: false,
                databaselist: [],
                datalist: [],
                totalPage: 1,
                groupList: [],
                sqlInfodModal: false,
                name: '',
                sqlObj: {
                    id: '',
                    name: '',
                    desc: '',
                    db_id: '',
                    db_name: '',
                    sql: '',
                    user_ids: [],
                    mac: true
                },
                sqlDefaultObj: {
                    id: '',
                    name: '',
                    desc: '',
                    db_id: '',
                    db_name: '',
                    sql: '',
                    user_ids: [],
                    mac: true
                },
                allUser: [],
                colums: [
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
                        title: 'id',
                        width: 100,
                        key: 'id'
                    },
                    {
                        title: '名称',
                        key: 'name'
                    },
                    {
                        title: '功能说明',
                        width: 400,
                        key: 'desc'
                    },
                    {
                        title: '创建人',
                        key: 'desc',
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
                                        type: 'success',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.execsql(params.row)
                                        }
                                    }
                                }, '导出'),
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
                                            this.remove(params.index)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                data1: []
            }
        },
        methods: {
             searchTable () {
               console.log(this.searchCol, 1111111111111111)
               this.sqldemoinit(this.searchCol)
             },
            remove (vl) {
                this.$Modal.confirm({
                    title: '删除提醒',
                    content: '<p>是否删除</p>',
                    onOk: () => {
                        axios.get(`${util.url}/db/tpl/${this.data1[vl].id}/delete/`)
                            .then(res => {
                                if (res.data.code === 20000) {
                                    this.$Message.info('操作成功');
                                    this.sqldemoinit()
                                } else {
                                    util.err_notice(res.data.msg)
                                }
                            })
                            .catch(error => {
                                util.err_notice(error)
                            })
                    }
                });
            },
            Connection_Name (vl) {
                if (vl) {
                    this.databaselist = []
                    axios.post(`${util.url}/db/simple/`, {'db_id': vl})
                        .then(res => {
                            for (var a of res.data.data) {
                                this.databaselist.push(a['Database'])
                            }
                        })
                        .catch(error => {
                            util.err_notice(error)
                        })
                }
            },
            changePage (page) {
                // this.data1 = this.allsearchdata.slice(page * 10 - 10, page * 10)
                this.sqldemoinit(this.searchCol, page * 10 - 10, 10)
            },
            show (vl) {
                    // this.Connection_Name(vl.db.id)
                    this.sqlObj.db_id = vl.db.id
                    this.sqlInfodModal = true
                    this.sqlObj.id = vl.id
                    this.sqlObj.name = vl.name
                    this.sqlObj.desc = vl.desc
                    this.sqlObj.sql = vl.sql
                    this.sqlObj.mac = vl.mac
                    this.sqlObj.user_ids = []
                    for (let uu in vl.mac_users) {
                        this.sqlObj.user_ids.push(vl.mac_users[uu].id)
                    }
                    // this.sqlObj['db_name'] = vl.db_name
            },
            actionSQL () {
                axios.post(`${util.url}/db/tpl/edit/`, this.sqlObj)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.$Message.info('操作成功');
                            this.sqldemoinit()
                        } else {
                            this.$Message.info('修改失败');
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.ajanxerrorcode(this, error)
                })
            },
            addsql () {
                this.sqlObj = this.sqlDefaultObj
                for (let gg in this.sqlObj) {
                    if (gg === 'mac') {
                        this.sqlObj[gg] = false
                    } else {
                        this.sqlObj[gg] = ''
                    }
                }
                this.sqlInfodModal = true
            },
            sqlinit () {
                axios.get(`${util.url}/db/list/`)
                    .then(res => {
                        this.datalist = res.data.data
                    }).catch(error => {
                    util.ajanxerrorcode(this, error)
                })
            },
            execsql (vl) {
              this.execAgainModal = true
              this.sqlObj = vl
              this.keydict = {}
              for (var b of vl['keys']) {
                  this.keydict[b] = ''
              }
            },
            sqldemoinit (values = '', start = 0, end = 10) {
               this.loading = true
              if (values.length !== 0) {
                var searchValue = `&q=${values}`
              } else {
                searchValue = ''
              }
              axios.get(`${util.url}/db/tpl/list/?offset=${start}&limit=${end}&p=${searchValue}`)
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
                  this.loading = false
                })
            },
          exportdata () {
                exportcsv({
                    filename: '数据导出' + this.getDate(2),
                    original: false,
                    data: this.allsearchdata,
                    columns: this.columnsName
                })
            },
          keyExec () {
              this.loading = true
              this.columnsName = []
              this.allsearchdata = []
              axios.post(`${util.url}/db/tpl/execute/`, {'tpl_id': this.sqlObj.id, 'kv': this.keydict})
                  .then(res => {
                      if (res.data.code === 20000) {
                          for (let key of res.data.data.title) {
                              this.columnsName.push({'title': key, 'key': key, 'width': 200})
                          }
                          if (res.data.data.output.length !== 0) {
                              this.columnsName[0]['fixed'] = 'left'
                          }
                          this.allsearchdata = res.data['data'].output
                          this.exportdata()
                      } else {
                          util.err_notice(res.data.msg)
                      }
                      this.loading = false
                  }).catch(error => {
                  util.err_notice(error)
              })
          },
            userInit () {
                axios.get(`${util.url}/users/`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.allUser = res.data.data
                        }
                    }).catch(error => {
                    util.err_notice(error)
                })
            },
          getDate (format) {
              var now = new Date();
              var year = now.getFullYear(); // 得到年份
              var month = now.getMonth(); // 得到月份
              var date = now.getDate(); // 得到日期
              // var day = now.getDay(); // 得到周几
              var hour = now.getHours(); // 得到小时
              var minu = now.getMinutes(); // 得到分钟
              var sec = now.getSeconds(); // 得到秒
              month = month + 1;
              if (month < 10) month = '0' + month;
              if (date < 10) date = '0' + date;
              if (hour < 10) hour = '0' + hour;
              if (minu < 10) minu = '0' + minu;
              if (sec < 10) sec = '0' + sec;
              var time = '';
              // 精确到天
              if (format === 1) {
                  time = year + '-' + month + '-' + date;
              } else if (format === 2) {
                  // 精确到分
                  time = year + '年' + month + '月' + date + '日' + hour + '时' + minu + '分' + sec + '秒';
              }
              return time;
          }
        },
        mounted () {
            this.sqlinit()
            this.sqldemoinit()
            this.userInit()
        }
    }
</script>
