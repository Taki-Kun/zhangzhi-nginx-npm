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
                <RadioGroup v-model="formItem.bucket_name" type="button">
                  <Radio label="steven-hz-plat">平台正式</Radio>
                  <Radio label="steven-hz-sandbox">平台沙盒</Radio>
                </RadioGroup>
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
                         <p>上传文件或者拖拽文件</p>
                       </div>
                    </Upload>
                    <div v-for="(zz, index) in formItem.files">
                          {{zz.name}}
                    </div>
                  </div>
                </template>
              </FormItem>
              <FormItem>
                <Button type="warning" @click="clearFile()">清空</Button>
                <Button type="primary" @click="sumbit()">上传</Button>
              </FormItem>
            </Form>
          </col>
          <Spin size="large" fix v-if="spinShow"></Spin>
          <div v-if="spinShow">正在上传，请稍后...</div>
        </Row>
      </Card>
    </Row>

  </div>
</template>
<script>
  import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
  import util from '../../libs/util'
  // import axios from 'axios'
  export default {
    components: {
      ICol
    },
    name: 'FileAction',
    data () {
      return {
        spinShow: false,
        formItem: {
         bucket_name: 'steven-hz-plat',
         files: []
        }
      }
    },
    methods: {
        sumbit () {
          let formData = new FormData();
          formData.append('bucket_name', this.formItem.bucket_name)
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
                  console.log(response.data);
                  this.$Message.info('操作成功')
                  this.spinShow = false
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
        }
    },
    mounted () {
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
