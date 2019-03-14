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
          文件上传
        </p>
        <Row>
          <Col span="7" offset="5">
            <Form :model="formItem" :label-width="150">
              <FormItem label="类型">
                <Select v-model="formItem.id" @on-change="clearPath" label-in-value>
                  <Option v-for="vl in allResult" :value="vl.id" :key="vl.name">{{ vl.name }}</Option>
                </Select>
              </FormItem>
              <FormItem label="上传文件">
                <template>
                  <div>
                    <Upload
                            multiple
                            type = 'drag'
                            :before-upload="handleBeforeUpload"
                            action="//jsonplaceholder.typicode.com/posts/">
                      <div style="padding: 20px 0">
                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>选择文件或者拖拽文件</p>
                      </div>
                    </Upload>
                    <div v-for="(zz, index) in formItem.files">
                      {{zz.name}}
                    </div>
                  </div>
                </template>
              </FormItem>
              <FormItem label="点击选择文件路径">
                <template>
                    <Card style="width: 550px">
                      <Scroll style="height: 300px;">
                      <!--<Tree v-for="vl in allResult" v-if="formItem.bucket_name === vl.bucket_name" :data="vl.addmyData" @on-select-change="selectDir" getSelectedNodes></Tree>-->
                      <Tree v-for="vl in allResult" v-if="formItem.id === vl.id" :data="vl.directory" :load-data="loadData" @on-select-change="selectDir" getSelectedNodes></Tree>
                      </Scroll>
                    </Card>
                </template>
              </FormItem>
              <FormItem label="当前路径">
                  <Input v-model="currentPath" style="width: 550px;"></Input>
              </FormItem>
              <FormItem>
                <!--<Button type="warning" @click="clearFile()">清空</Button>-->
                <Button type="primary" @click="sumbit()">上传</Button>
                <Button type="error" @click="delDir()">删除文件夹</Button>
              </FormItem>
            </Form>
          </col>
          <Spin size="large" fix v-if="spinShow"></Spin>
          <div v-if="spinShow">正在上传，请稍后...</div>
        </Row>
      </Card>
    </Row>

    <Modal v-model="fileModal" width="860" title="文件上传成功，文件URL如下">
      <div v-for="(ff, index) in allFilesList">
        <p>{{ff}}</p>
      </div>
      <div slot="footer">
      </div>
    </Modal>

    <Modal v-model="delOrUrlModal" width="860" title="请选择需要执行的操作">
      <RadioGroup v-model="fileaction" type="button">
        <Radio label="获取URL"></Radio>
        <Radio label="刷新数据"></Radio>
        <Radio label="删除文件"></Radio>
      </RadioGroup>
      <div slot="footer">
             <Button type="primary" @click="chooseAction">确定</Button>
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
        name: 'FileAction',
        data () {
            return {
                fileaction: '',
                delOrUrlModal: false,
                allResult: [],
                currentPath: '',
                fileModal: false,
                spinShow: false,
                formItem: {
                    bucket_name: '',
                    files: [],
                    id: 1
                },
                allFilesList: [],
                currentfileURL: '',
                pathStoreDict: {
                }
            }
        },
        methods: {
             delDir () {
               // 判断确认没有选择文件
               if (!this.currentfileURL) {
                     console.log(this.currentPath, 111111111111111)
                     if (this.currentPath.length !== 0) {
                       this.$Modal.confirm({
                         title: '删除提醒',
                         content: '是否删除此文件夹路径【' + this.currentPath + '】！！',
                         onOk: () => {
                           this.deleteFile(this.currentPath)
                         }})
                     } else {
                       util.err_notice('请选择文件夹路径！！')
                     }
               }
              },
             clearPath (vl) {
               this.currentPath = ''
             },
            sumbit () {
                let formData = new FormData();
                // formData.append('bucket_name', this.formItem.bucket_name)
                formData.append('bucket_id', this.formItem.id)
                formData.append('path', this.currentPath)
                if (this.formItem.files.length === 0) {
                    util.err_notice('请上传文件！！')
                    return false
                }
                this.spinShow = true
                for (let zz of this.formItem.files) {
                    formData.append('files', zz)
                }
                const config = { headers: { 'Content-Type': 'multipart/form-data' } };
                this.$http.post(`${util.url}/cdn/file_upload/`, formData, config).then(response => {
                    if (response.data.code === 20000) {
                        this.allFilesList = []
                        for (let fileurl of response.data.data.urls) {
                            this.allFilesList.push(fileurl)
                        }
                        this.$Message.info('操作成功')
                        this.fileModal = true
                        this.spinShow = false
                        this.formItem.files = []
                    } else {
                        util.err_notice('上传失败，原因：' + response.data.msg)
                        this.spinShow = false
                    }
                }).catch(error => {
                    util.err_notice('上传失败，原因：' + error)
                    this.spinShow = false
                })
            },
            handleBeforeUpload (file) {
                // 创建一个 FileReader 对象
                let reader = new FileReader()
                // readAsDataURL 方法用于读取指定 Blob 或 File 的内容
                // 当读操作完成，readyState 变为 DONE，loadend 被触发，此时 result 属性包含数据：URL（以 base64 编码的字符串表示文件的数据）
                // 读取文件作为 URL 可访问地址
                reader.readAsDataURL(file)

                const _this = this
                reader.onloadend = function (e) {
                    file.url = reader.result
                    _this.formItem.files.push(file)
                }
                return false
            },
            handleRemove (file) {
                this.formItem.files.splice(this.formItem.file.indexOf(file), 1)
            },
            clearFile () {
                this.formItem.files = []
            },
            dirInit () {
                axios.get(`${util.url}/cdn/buckets/`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            // 平台正式数据结构
                            for (let tt of res.data.data) {
                                 for (let ee of tt.directory) {
                                   ee.title = ee.name
                                   if (ee.is_dir) {
                                     ee.loading = false
                                   } else {
                                     ee.file_name = ee.full_name
                                     ee.full_name = ''
                                     ee.file = true
                                   }
                                   ee.children = []
                                 }
                            }
                            this.allResult = res.data.data
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                })
            },
             loadData (item, callback) {
               setTimeout(() => {
                let dataResult = []
                if (item.children) {
                  axios.post(`${util.url}/cdn/listdir/`, {path: item.full_name, bucket_id: this.formItem.id})
                          .then(res => {
                            if (res.data.code === 20000) {
                              // 平台正式数据结构
                              for (let gg of res.data.data.children) {
                                gg.title = gg.name
                                if (gg.is_dir) {
                                     gg.loading = false
                                } else {
                                     gg.file_name = gg.full_name
                                     gg.full_name = ''
                                     gg.file = true
                                }
                                gg.children = []
                              }
                              dataResult = res.data.data.children
                              callback(dataResult);
                            } else {
                              util.err_notice(res.data.msg)
                            }
                          }).catch(error => {
                    util.err_notice(error)
                  })
                }
               }, 500);
             },
            getURL (vl) {
                axios.post(`${util.url}/cdn/file_url/`, {path: vl, bucket_id: this.formItem.id})
                        .then(res => {
                          if (res.data.code === 20000) {
                            // this.currentfileURL = res.data.data.url
                            this.$Modal.success({
                              title: '文件URL',
                              content: res.data.data.url,
                              width: 1000
                            });
                            this.delOrUrlModal = false
                          } else {
                            util.err_notice(res.data.msg)
                          }
                        }).catch(error => {
                  util.err_notice(error)
                })
            },
          deleteFile (vl) {
              axios.post(`${util.url}/cdn/file_delete/`, {path: vl, bucket_id: this.formItem.id})
                      .then(res => {
                        if (res.data.code === 20000) {
                          this.$Modal.success({
                            title: '删除回复',
                            content: '删除成功！！',
                            width: 1000
                          });
                          this.dirInit()
                          this.delOrUrlModal = false
                          this.currentPath = ''
                        } else {
                          util.err_notice(res.data.msg)
                        }
                      }).catch(error => {
                util.err_notice(error)
              })
          },
          chooseAction () {
            if (this.fileaction === '获取URL') {
               this.getURL(this.currentfileURL)
            } else if (this.fileaction === '删除文件') {
               this.deleteFile(this.currentfileURL)
            } else if (this.fileaction === '刷新数据') {
               this.dirInit()
               this.delOrUrlModal = false
            }
          },
          selectDir (vl) {
               console.log(vl, 11111111111111111)
               if (vl[0]) {
                 this.currentPath = vl[0].full_name
                 this.currentfileURL = vl[0].file_name
                 if (vl[0].file) {
                   this.delOrUrlModal = true
                 }
               }
               }
        },
        mounted () {
            this.dirInit()
        }
    }
</script>
<style scoped>
  .demo-upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .demo-upload-list img {
    width: 100%;
    height: 100%;
  }

  .demo-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .demo-upload-list:hover .demo-upload-list-cover {
    display: block;
  }

  .demo-upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }

  .ivu-icon {
    line-height: 58px;
  }
</style>
