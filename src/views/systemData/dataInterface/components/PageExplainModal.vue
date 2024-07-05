<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="分页使用说明" :footer="null">
    <div class="content">
      <p>1. 适用控件 </p>
      <p class="pl-6px">a. 下拉表格</p>
      <p class="pl-6px">b. 弹窗选择</p>
      <p class="pl-6px">c. 设计子表-动作配置</p>
      <p>2. 分页设置支持SQL、API模式</p>
      <p>3. SQL模式配置：</p>
      <p class="pl-6px">
        a. 数据配置页面：正常查询列表语句。(select * from base_user where f_account like concat('%', @keyword, '%') limit @offsetSize, @pageSize)
      </p>
      <p class="pl-12px">ⅰ. @offsetSize: 跳过的数据量</p>
      <p class="pl-12px">ⅱ. @pageSize: 需要返回的数据量</p>
      <p class="pl-12px">ⅲ. @keyword: 前端功能支持搜索时, 传递过来的搜索词</p>
      <p class="pl-6px">b. 数量统计页面：同样的条件统计数量。(select count(*) from base_user where f_account like concat('%',@keyword,'%'))</p>
      <p class="pl-6px">c. 数据回显页面：通过ID等唯一字段返回需要转换的文本数据(select f_realname from base_user where @showKey = @showValue)</p>
      <p class="pl-12px">ⅰ. @showKey: 本次回显过滤的ID字段名称</p>
      <p class="pl-12px">ⅱ. @showValue: 本次回显过滤的ID值</p>
      <p>4. API模式</p>
      <p class="pl-6px">a. 数据配置页面：Get将分页参数中填写的参数名称添加到URL上请求对应的接口. Post将分页参数中填写的参数名称添加Body中一起提交到接口</p>
      <p class="pl-12px">ⅰ. GET：http://domain/list?currentPage=1&pageSize=20&keywork=搜索词</p>
      <p class="pl-12px">ⅱ. POST：{currentPage:1, pageSize:20, keyword:'搜索词'}</p>
      <p class="pl-12px">ⅲ. 配置的接口需要返回的格式</p>
      <p class="pl-18px">1. {list:[{数据列表}, {数据列表}], pagination:{total:总条数}}</p>
      <p class="pl-18px">2. {list:[{f_id:'1', f_realname:'老陈'}, {f_id:'2', f_realname:'老王'}], pagination:{total:201}}</p>
      <p class="pl-6px">b. 数据回显页面</p>
      <p class="pl-12px">ⅰ. 接口路径中可使用{showValue}替换为当前ID(http://domain/{showValue}/info)</p>
      <p class="pl-12px">ⅱ. @showKey: 本次回显过滤的ID字段名称</p>
      <p class="pl-12px">ⅲ. @showValue: 本次回显过滤的ID值</p>
      <p class="pl-12px">ⅳ. GET：http://domain/info?showKey=f_id&showValue=1010101</p>
      <p class="pl-12px">ⅴ. POST：{showKey:'f_id', showValue:'1010101'}</p>
      <p class="pl-12px">ⅵ. 配置的接口需要返回的格式</p>
      <p class="pl-18px">1. {数据详情}</p>
      <p class="pl-18px">2. {f_id:'1', f_realname:'老陈'}</p>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';

  const [registerModal] = useModalInner();
</script>
<style lang="less" scoped>
  .content {
    overflow: auto;
    height: 600px;
    line-height: 1.8;
    margin-bottom: 20px;
  }
</style>
