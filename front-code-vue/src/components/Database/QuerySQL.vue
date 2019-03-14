<style lang="less">
  @import '../../styles/common.less';
  @import '../Order/components/table.less';
  .tree {
    word-wrap: break-word;
    word-break: break-all;
    overflow-y: scroll;
    overflow-x: scroll;
    min-height: 600px;
  }
  #querySQL .ivu-table-cell {
      padding-left: 0px  !important;
      padding-right: 0px  !important;
  }
  #querySQL .ivu-table-small td {
      height: 22px  !important;
  }
  #sqlCheck .ivu-select-dropdown {
    width: inherit !important;
    max-height: 1000px !important;
    overflow: auto !important;
    margin: 5px 0 !important;
    padding: 5px 0 !important;
    background-color: #fff !important;
    -webkit-box-sizing: border-box !important;
    box-sizing: border-box !important;
    border-radius: 4px !important;
    -webkit-box-shadow: 0 1px 6px rgba(0,0,0,.2) !important;
    box-shadow: 0 1px 6px rgba(0,0,0,.2) !important;
    position: absolute !important;
    z-index: 900 !important;
  }
</style>
<style>
    pre {
        display: block;
        overflow: auto;
        #color:#abb2bf;
        #background:#282c34;
        padding: 5px 10px;
        #border: 1px solid #eee;
        word-wrap:break-word;
    }
</style>
<template>
  <div id="querySQL">
      <BackTop @on-click="backTop"></BackTop>
      <!--<Affix  :offset-top="100" @on-change="change">
          <div v-if="showAffix">
              <Input v-model="showSqlDetail" placeholder="点击字段展示详情" readonly></Input>
          </div>
      </Affix>-->
    <Row>
      <Col span="5" v-if="ifNohideLink">
        <Card>
          <div slot="title">
              <Row>
                  <Col span="9">
                        <h4><Icon type="logo-buffer" />&nbsp选择数据库表</h4>
                  </Col>
                  <Col span="4" offset="9">
                      <Button type="default" icon="arrow-left-a" size="small" @click.native="hideLink()">隐藏连接</Button>
                  </Col>
              </Row>
          </div>
              <Scroll height="700">
                <Tree :data="data1" :load-data="loadData" @on-select-change="Getbasename" @on-toggle-expand="choseName" empty-text="数据加载中..."></Tree>
              </Scroll>
        </Card>
      </Col>
      <Col :span="sqlWidth" class="padding-left-10">
          <Spin size="large" fix v-if="spinShow"></Spin>
        <Card>
          <div id="sqlCheck" slot="title">
              <Row>
                  <Col span="2">
                      <Button type="default" icon="arrow-right-a" size="small" @click.native="NohideLink()" v-if="!ifNohideLink">展开连接</Button>
                  </Col>
                  <Col span="3">
                      <Button type="default" icon="arrow-down-a" size="small" @click.native="hideCommand()">点击展开填写sql语句</Button>
                  </Col>
                  <Col span="19">
                    <!--<Button type="default" icon="arrow-down-a" size="small" @click.native="hideCommand()">点击展开填写sql语句</Button>-->
                    <Select v-model="model1" placeholder="选择历史SQL进行查询" @on-change="selSQL">
                            <Option v-for="item in sqlList" :value="item.id" :key="item.id">{{ item.sql }}</Option>
                    </Select>
                  </Col>
              </Row>
          </div>
          <div v-if="commandSQL">
               <editor v-model="formItem.textarea" @init="editorInit" @setCompletions="setCompletions"></editor>
          </div>
               <p>当前选择的库: {{put_info.base}}  当前表：{{put_info.tablename}}</p>
               <Button type="error" icon="md-color-wand" @click.native="ClearForm()">清除</Button>
               <Button type="success" icon="ios-redo" @click.native="Search_sql()">SQL查询</Button>
               <Button type="primary" icon="md-arrow-round-down" @click.native="exportdata()">导出excel数据表
               </Button>
               <Button type="primary" icon="ios-arrow-down" @click.native="exportData()">导出表结构数据</Button>
               <Button type="default" icon="md-male" @click.native="fastCheck('1000')">快速查询（1000条）</Button>
               <Button type="default" icon="ios-funnel" @click.native="filterOpenModal()">条件过滤</Button>
               <!--<Select v-model="selectColumns" multiple @on-change="filterField()" style="width:360px" placeholder="请选择展示字段....">
                 <Option v-for="item in columnList" :value="item" :key="item">{{ item }}</Option>
               </Select>-->
               <Tabs v-model="tabValue" @on-click="tabEvent">

              <TabPane label="数据" name="数据">
                <template v-if="tabValue === '数据'">
                    <!--<Input v-model="showSqlDetail" placeholder="点击字段展示详情" readonly></Input>-->
                  <Scroll height="500">
                    <Table :loading="loading" border :columns="columnsName" :data="Testresults" highlight-row ref="table" size="small"></Table>
                  </Scroll>
                  <br>
                  <Page :total="total" show-total @on-change="splice_arr" ref="totol" :page-size="pageSize"></Page>
                </template>
              </TabPane>
              <TabPane label="表结构" name="表结构">
                  <template v-if="tabValue === '表结构'">
                      <Table :loading="loading" border :columns="columnsName" :data="Testresults" highlight-row ref="table" size="small"></Table>
                      <br>
                      <Page :total="total" show-total @on-change="splice_arr" ref="totol"></Page>
                      <br>
                  </template>
              </TabPane>
              <TabPane label="表语句" name="表语句">
                  <div class="ivu-table-cell">
<pre>
{{this.createTableSql}}
     </pre>
      </div>
    </TabPane>
</Tabs>
        </Card>
      </Col>
    </Row>

      <Modal v-model="filterInfodModal" :width="600" @on-ok="filterSQL">
          <h3 slot="header" style="color:#2D8CF0">条件过滤</h3>
          <Row v-for="(value, index) in filterDictList">
              <Col span="6" offset="4">
                  <Input v-model="value.coloum" placeholder="Enter something..." readonly></Input>
              </Col>
              <Col span="3">
                  <Select v-model="value.symbol">
                      <Option value=">">></Option>
                      <Option value="<"><</Option>
                      <Option value="<>"><></Option>
                      <Option value="=">=</Option>
                      <Option value="LIKE">LIKE</Option>
                  </Select>
              </Col>
              <Col span="9">
                  <Input v-model="value.num"></Input>
              </Col>
          </Row>
      </Modal>

      <Modal v-model="sqlDetailModal" width='900' @on-ok="filterSQL">
          <h3 slot="header" style="color:#2D8CF0">sql内容详情</h3>
<pre>
{{showSqlDetail}}
</pre>
      </Modal>

  </div>
</template>
<script>
  import flow from './work_flow'
  import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
  import axios from 'axios'
  import util from '../../libs/util'
  import Csv from '../../../node_modules/iview/src/utils/csv'
  import ExportCsv from '../../../node_modules/iview/src/components/table/export-csv'

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
      ICol,
      flow,
      editor: require('../../libs/editor')
    },
    name: 'SearchSQL',
    data () {
      return {
       sqlDetailModal: false,
        showAffix: false,
        spinShow: false,
        pageSize: 0,
        showSqlDetail: '',
        sqlWidth: 19,
        ifNohideLink: true,
        filterInfodModal: false,
        commandSQL: false,
        tabValue: '数据',
        currentTable: '',
        createTableSql: '',
        columnList: [],
        selectColumns: '',
        loading: false,
        tableReslut: '',
        data1: [],
        validate_gen: true,
        formItem: {
          textarea: ''
        },
        columnsName: [],
        Testresults: [],
        ruleValidate: {
          basename: [{
            required: true,
            message: '数据库名不得为空',
            trigger: 'change'
          }]
        },
        id: null,
        total: 0,
        allsearchdata: [],
        put_info: {
          base: '',
          tablename: ''
        },
        export_data: false,
        wordList: [],
        sqlID: '',
        widthNum: 0,
        filterDictList: [],
        sqlList: [],
        model1: ''
      }
    },
    methods: {
      selSQL (vl) {
          let sqlObj = {}
           for (let qq of this.sqlList) {
             if (vl === qq.id) {
                   sqlObj = qq
             }
           }
           this.formItem.textarea = sqlObj.sql
           if (sqlObj.db_name) {
             this.sqlID = sqlObj.db.id
             this.put_info.base = sqlObj.db_name
             this.formItem.textarea = sqlObj.sql
             this.Search_sql()
           } else {
             this.Testresults = []
             util.err_notice('这个sql，没有指定库和链接！！请选择链接、库！')
           }
      },
     change (status) {
         // this.$Message.info(`Status: ${status}`);
         this.showAffix = status
     },
     downloadUrl (url) {
         let iframe = document.createElement('a')
         // iframe.style.display = 'none'
         iframe.href = url
         iframe.download = this.put_info.tablename + '.sql'
         iframe.click()
         this.spinShow = false
         document.body.removeChild(iframe)
         document.body.appendChild(iframe)
     },
      Connection_Name (vl) {
          axios.post(`${util.url}/db/simple/`, {'db_id': vl})
              .then(res => {
                  if (res.data.code === 20000) {
                      // 改成树形控件，让iview的tree识别
                      for (var v of res.data.data) {
                          v['title'] = v['Database']
                          v['loading'] = false
                          v['children'] = []
                          v['id'] = vl
                      }
                      this.data1 = res.data.data
                  } else {
                      util.err_notice(res.data.msg)
                  }
              })
              .catch(error => {
                  util.err_notice(error)
              })
        },
      setCompletions (editor, session, pos, prefix, callback) {
        let wordList = []
        wordList = this.wordList
        callback(null, wordList.map(function (word) {
          return {
            caption: word.vl,
            value: word.vl,
            meta: word.meta
          }
        }))
      },
      choseName (vl) {
          if (vl.length !== 0) {
              if ('account' in vl) {
                  this.put_info.base = ''
                  this.put_info.tablename = ''
              } else if ('Database' in vl) {
                  this.put_info.base = vl.title
              } else {
                  this.put_info.tablename = vl.title
              }
          }
      },
      Getbasename (vl) {
          if (vl.length !== 0) {
              let iftable = true
              if ('Database' in vl[0] || 'account' in vl[0]) {
                  iftable = false
              }
              if (iftable) {
                  scrollTo(120, 120)
                  this.put_info.tablename = vl[0].title
                  for (var b of this.data1) {
                      if (vl[0].db_id === b.id) {
                          for (var c of b['children']) {
                              if (vl[0].db_name === c.Database) {
                                  for (var d of c['children']) {
                                      if (d['title'] === vl[0].title) {
                                          this.put_info.base = c.title // 点击表的时候选择相应的库
                                          this.sqlID = b.id // 点击表的时候选择相应的连接
                                      }
                                  }
                              }
                          }
                      }
                  }
                  // 当前选择的表，用于tab切换使用
                  this.currentTable = vl
                  this.fastCheck('200')
                  this.tableGetshowcreate(vl)
              } else {
                  if ('Database' in vl[0]) {
                      this.put_info.base = vl[0].title
                  } else {
                      this.put_info.base = ''
                      this.put_info.tablename = ''
                  }
              }
           }
      },
      tableGetshowcreate (vl) {
          axios.post(`${util.url}/db/simple/`, {
              db_id: this.sqlID,
              db_name: this.put_info.base,
              tb_name: vl[0].title,
              function: 'define'
          }).then(res => {
              if (res.data.code === 20000) {
                  this.createTableSql = res.data.data[0]['Create Table']
              } else {
                  util.err_notice(res.data.msg)
              }
              this.loading = false
          }).catch(error => {
              util.err_notice(error)
          })
      },
      tableGetColumn (vl) {
          this.loading = true
          axios.post(`${util.url}/db/simple/`, {
              db_id: this.sqlID,
              db_name: this.put_info.base,
              tb_name: vl[0].title
          }).then(res => {
              if (res.data.code === 20000) {
                  this.columnsName = []
                  this.columnList = res.data.title
                  for (let key of res.data.title) {
                      this.columnsName.push({'title': key, 'key': key, 'width': 130})
                  }
                  this.columnsName[0]['fixed'] = 'left'
                  this.allsearchdata = res.data['data']
                  this.Testresults = this.allsearchdata.slice(0, 100)
                  this.total = res.data.data.length
                  this.pageSize = 100
              } else {
                  util.err_notice(res.data.msg)
              }
              this.loading = false
          }).catch(error => {
              util.err_notice(error)
          })
      },
      editorInit: function () {
        require('brace/mode/mysql')
        require('brace/theme/xcode')
      },
      splice_arr (page) {
        this.Testresults = this.allsearchdata.slice(page * 100 - 100, page * 100)
      },
      ClearForm () {
        this.formItem.textarea = ''
        this.Testresults = []
        this.columnsName = []
        this.$refs.totol.currentPage = 1
        this.total = 0
      },
      Search_sql (vl = '') {
        this.loading = true
        if (vl.length !== 0) {
            this.formItem.textarea = vl
        }
        if (this.put_info.base.length === 0 || this.formItem.textarea.length === 0) {
              util.err_notice('请选择链接和数据库或者选择历史SQL进行查询!!')
              return false
        }
        // 判断是否有limit，没有立即加上limit
        if (this.formItem.textarea) {
            if (this.formItem.textarea.indexOf('limit') === -1 && this.formItem.textarea.indexOf('LIMIT') === -1 && this.formItem.textarea.indexOf('where') === -1 && this.formItem.textarea.indexOf('WHERE') === -1 && this.formItem.textarea.indexOf('count') === -1 && this.formItem.textarea.indexOf('variables') === -1) {
                this.formItem.textarea = this.formItem.textarea + ' limit 1000'
            }
        }
        axios.post(`${util.url}/db/sql/`, {
            db_id: this.sqlID,
            db_name: this.put_info.base,
            sql: this.formItem.textarea
        })
          .then(res => {
              if (res.data.data.status === 1) {
                  this.columnsName = []
                  this.columnList = res.data.data.title
                  res.data.data.output = res.data.data.output
                  // 用于自适应判断字体长度
                  for (let key of res.data.data.title) {
                      var renderCustom = {render: (h, params) => {
                              var strSlice = params.row[key]
                              if (params.row[key]) {
                                  if (JSON.stringify(params.row[key]).length !== 0) {
                                      if (typeof (params.row[key]) === 'string' && !this.isdate(params.row[key])) {
                                          if (params.row[key].length > 70) {
                                              strSlice = params.row[key].slice(0, 70) + '（双击查看详情....）'
                                              return h('div', {
                                                  on: {
                                                      dblclick: () => {
                                                          this.strDetail(params.row[key])
                                                      }
                                                  }
                                              }, strSlice);
                                          }
                                      }
                                  }
                              }
                              return h('div', {
                              }, strSlice);
                          }}
                      this.columnsName.push({'title': key, 'key': key, 'width': 130, 'render': renderCustom['render']})
                  }
                  if (res.data.data.output.length !== 0) {
                      this.columnsName[0]['fixed'] = 'left'
                  }
                  this.allsearchdata = res.data['data'].output
                  this.Testresults = this.allsearchdata.slice(0, 100)
                  this.total = res.data.data.output.length
                  this.pageSize = 100
                  this.loading = false
              } else {
                  util.err_notice(res.data.data.error)
                  this.Testresults = []
                  this.loading = false
              }
              this.tabValue = '数据'
          }).catch(error => {
                util.err_notice(error)
            })
      },
      exportdata () {
        exportcsv({
          filename: this.put_info.tablename + this.getDate(2),
          original: false,
          data: this.allsearchdata,
          columns: this.columnsName
        })
      },
     dataBaseInit () {
         axios.get(`${util.url}/db/list/`)
             .then(res => {
                 if (res.data.code === 20000) {
                     this.datalist = res.data.data
                     // 改成树形控件，让iview的tree识别
                      for (var v of res.data.data) {
                          v['title'] = '【' + v.project.name + '】' + v['name']
                          v['loading'] = false
                          v['children'] = []
                      }
                      this.data1 = res.data.data
                 } else {
                     util.err_notice(res.data.msg)
                 }
             })
             .catch(error => {
                 util.err_notice(error)
             })
     },
    loadData (item, callback) {
                if ('account' in item) {
                    this.sqlID = item.id
                    axios.post(`${util.url}/db/simple/`, {'db_id': item.id})
                        .then(res => {
                            if (res.data.code === 20000) {
                                // 改成树形控件，让iview的tree识别
                                setTimeout(() => {
                                    // 改成树形控件，让iview的tree识别
                                    for (var v of res.data.data) {
                                        v['title'] = v['Database']
                                        v['loading'] = false
                                        v['children'] = []
                                        v['id'] = item.id
                                    }
                                    callback(res.data.data);
                                }, 250);
                            } else {
                                util.err_notice(res.data.msg)
                            }
                        })
                        .catch(error => {
                            util.err_notice(error)
                        })
                } else {
                    axios.post(`${util.url}/db/simple/`, {'db_id': item.id, 'db_name': item.title})
                        .then(res => {
                            if (res.data.code === 20000) {
                                setTimeout(() => {
                                // 改成树形控件，让iview的tree识别
                                for (var v of res.data.data) {
                                    v['title'] = v[`Tables_in_${item.title}`]
                                    v['db_name'] = item.title
                                    v['db_id'] = item.id
                                }
                                callback(res.data.data);
                                }, 250);
                            } else {
                                util.err_notice(res.data.msg)
                            }
                        })
                        .catch(error => {
                            util.err_notice(error)
                        })
                }
        },
    fastCheck (num) {
          if (this.put_info.tablename.length === 0) {
              util.err_notice('请在左侧选择表！！')
              return false
          } else {
              this.Search_sql(`select * from ${this.put_info.tablename} limit ${num}`)
          }
     },
    tabEvent (name) {
          if (this.put_info.tablename && this.currentTable) {
              if (name === '表结构') {
                  this.tableGetColumn(this.currentTable)
              } else if (name === '数据') {
                  this.fastCheck('100')
              }
          }
    },
    hideCommand () {
          this.commandSQL = !this.commandSQL
    },
    filterSQL () {
          let sqlJoinWhere = ''
          let filterList = []
          for (var gg of this.filterDictList) {
              if (gg['num'].length !== 0) {
                    filterList.push(gg)
              }
          }
          for (var ii of filterList) {
               if (filterList.indexOf(ii) === 0) {
                   if (ii['symbol'] === 'LIKE') {
                       sqlJoinWhere = `${ii['coloum']} ${ii['symbol']} '%${ii['num']}%'`
                   } else {
                       sqlJoinWhere = `${ii['coloum']} ${ii['symbol']} '${ii['num']}'`
                   }
               } else {
                   sqlJoinWhere = sqlJoinWhere + ` and ${ii['coloum']} ${ii['symbol']} '${ii['num']}'`
               }
          }
        this.Search_sql(`select * from ${this.put_info.tablename} where ${sqlJoinWhere} limit 1000`)
    },
    filterOpenModal () {
        if (this.put_info.tablename.length === 0) {
            util.err_notice('请在左侧选择表！！')
            return false
        } else {
            this.filterDictList = []
            for (var dd of this.columnList) {
                this.filterDictList.push({coloum: dd, symbol: '=', num: ''})
            }
            this.filterInfodModal = true
        }
    },
    hideLink () {
        this.ifNohideLink = false
        this.sqlWidth = 24
    },
    NohideLink () {
        this.ifNohideLink = true
        this.sqlWidth = 19
    },
    strDetail (vl) {
         this.sqlDetailModal = true
         this.showSqlDetail = vl
    },
    isdate (str) {
      var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
      var r = str.match(reg);
      if (r === null) {
          return false;
      }
      return true
   },
    backTop () {
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
        },
   getHistorySQL () {
          axios.get(`${util.url}/db/hint/`)
            .then(res => {
              if (res.data.code === 20000) {
                this.sqlList = res.data.data
              } else {
                util.err_notice(res.data.msg)
              }
            })
            .catch(error => {
              util.err_notice(error)
            })
   },
   exportData () {
       if (this.put_info.tablename.length === 0) {
           util.err_notice('请在左侧选择表！！')
           return false
       } else {
           this.spinShow = true
           axios.get(`${util.url}/db/mysqldump/?db_id=${this.sqlID}&db_name=${this.put_info.base}&tb_name=${this.put_info.tablename}`, {responseType: 'arraybuffer'})
               .then(res => {
                   let blob = new Blob([res.data], {type: 'application/octet-stream'});
                   let objectUrl = URL.createObjectURL(blob);
                   this.downloadUrl(objectUrl)
               })
       }
       }
    },
    mounted () {
        this.dataBaseInit()
        this.getHistorySQL()
    }
  }
</script>
