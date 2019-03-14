<style scoped>
    .expand-row{
        margin-bottom: 16px;
    }
    pre, code{
        display: block;
        overflow: auto;
        color:#abb2bf;
        background:#282c34;
        padding: 5px 10px;
        #border: 1px solid #eee;
        word-wrap:break-word;
    }
</style>
<template>
    <div>
        <Row class="expand-row">
            <div v-for="item in row">
                【{{item.created_time}}】：[{{item.user.name}}] {{item.title}}
            </div>
        </Row>
    </div>
</template>
<script>
    export default {
        props: {
            row: Array
        }
    };
</script>
