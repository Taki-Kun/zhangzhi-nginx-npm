<template>
    <div class="console" :id="'terminal-' + terminal.pid"></div>
</template>
<script>
import Terminal from '../../libs/Xterm'
export default {
  name: 'Console',
  props: {
    terminal: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      term: null,
      terminalSocket: null,
       scrollWidth: ''
    }
  },
  methods: {
      runRealTerminal () {
          console.log('webSocket is finished')
          // 自适应宽度
          this.term.resize(Math.round(document.body.scrollWidth * (135 / 1920)), 40)
          this.terminalSocket.send(JSON.stringify({'resize': [Math.round(document.body.scrollWidth * (135 / 1920)), 40]}))
      },
      errorRealTerminal () {
          console.log('error')
      },
      closeRealTerminal () {
          console.log('close')
          this.terminalSocket.close()
          this.term.destroy()
      },
      destoryConnection () {
          if (this.terminalSocket) {
              this.terminalSocket.close()
              this.term.destroy()
          }
      },
      websshConnect (url) {
          this.terminalSocket = new WebSocket(url)
          this.terminalSocket.onopen = this.runRealTerminal
          this.terminalSocket.onclose = this.closeRealTerminal
          this.terminalSocket.onerror = this.errorRealTerminal
          this.term.attach(this.terminalSocket)
          this.term._initialized = true
          var t = this.terminalSocket
          var scrollWidth = document.body.scrollWidth
          var e = this.term
          this.term.on('data', function (data) {
              // 监听如果浏览器宽度有变化的话将改变resize
              if (scrollWidth !== document.body.scrollWidth) {
                  e.resize(Math.round(document.body.scrollWidth * (135 / 1920)), 40);
                  t.send(JSON.stringify({'resize': [Math.round(document.body.scrollWidth * (135 / 1920)), 40]}));
                  scrollWidth = document.body.scrollWidth
              }
              if (data.length) {
                  t.send(JSON.stringify({'data': data}));
              }
          });
          console.log('mounted is going on')
      },
      termInit () {
          console.log('pid : ' + this.terminal.pid + ' is on ready')
          let terminalContainer = document.getElementById('terminal-' + this.terminal.pid)
          this.term = new Terminal({
              cursorBlink: true,
              cols: this.terminal.cols,
              rows: this.terminal.rows
          })
          this.term.open(terminalContainer)
      }
  },
  mounted () {
      this.termInit()
  },
  beforeDestroy () {
          console.log(' beforeDestroy beforeDestroy beforeDestroy')
          this.terminalSocket.close()
          this.term.destroy()
  }
}
</script>
