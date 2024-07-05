<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <div class="jnpf-common-page-header">
      <span></span>
      <a-space>
        <a-button type="link" @click="resetForm">
          <template #icon>
            <i class="icon-ym icon-ym-report-icon-preview-refresh"></i>
          </template>
          重置
        </a-button>
        <a-button type="primary" :loading="btnLoading" @click="handleSubmit">提交验证</a-button>
      </a-space>
    </div>
    <div class="jnpf-content-wrapper-form-body px-10px">
      <ScrollContainer>
        <div class="my-10px">
          <a-alert message="表单验证" type="warning" :show-icon="false" />
        </div>
        <a-form ref="formRef" :colon="false" :model="dataForm" :rules="dataRule" :labelCol="{ style: { width: '110px' } }">
          <a-form-item label="用户账号" name="account">
            <a-input v-model:value="dataForm.account" placeholder="用户账号" />
            <span class="tip">必填,长度在6-20之间</span>
          </a-form-item>
          <a-form-item label="用户密码" name="password">
            <a-input v-model:value="dataForm.password" placeholder="用户密码" type="password" :maxlength="20" />
            <span class="tip">必填，包含字母、数字和_-,长度在6-20之间</span>
          </a-form-item>
          <a-form-item label="确认密码" name="password2">
            <a-input v-model:value="dataForm.password2" placeholder="确认密码" type="password" :maxlength="20" />
            <span class="tip">必填，包含字母、数字和_-,长度在6-20之间</span>
          </a-form-item>
          <a-form-item label="电子邮箱" name="email">
            <a-input v-model:value="dataForm.email" placeholder="电子邮箱" />
            <span class="tip">请输入以@正确格式的电子邮件</span>
          </a-form-item>
          <a-form-item label="商品数量" name="number">
            <a-input v-model:value="dataForm.number" placeholder="商品数量" :maxlength="6" />
            <span class="tip">只能输入正整数</span>
          </a-form-item>
          <a-form-item label="信用卡号" name="creditcard">
            <a-input v-model:value="dataForm.creditcard" placeholder="信用卡号" :maxlength="18" />
            <span class="tip">请输入有效的信用卡号</span>
          </a-form-item>
          <a-form-item label="请求地址" name="url">
            <a-input v-model:value="dataForm.url" placeholder="请求地址" />
            <span class="tip">以http:或https:开头的有效地址</span>
          </a-form-item>
          <a-form-item label="支付金额" name="price">
            <a-input v-model:value="dataForm.price" placeholder="支付金额" />
            <span class="tip">只能输入大于或等于0的金额（包含小数）</span>
          </a-form-item>
          <a-form-item label="联系方式" name="tel">
            <a-input v-model:value="dataForm.tel" placeholder="联系方式" />
            <span class="tip">包含手机号码和电话号码</span>
          </a-form-item>
          <a-form-item label="手机号码" name="mobile">
            <a-input v-model:value="dataForm.mobile" placeholder="手机号码" />
            <span class="tip">只能输入以13,15,18开头的手机号码</span>
          </a-form-item>
          <a-form-item label="电话号码" name="phone">
            <a-input v-model:value="dataForm.phone" placeholder="电话号码" />
            <span class="tip">请输入有效的电话号码</span>
          </a-form-item>
          <a-form-item label="有效年龄" name="age">
            <a-input v-model:value="dataForm.age" placeholder="有效年龄" />
            <span class="tip">请输入0~100有效年龄</span>
          </a-form-item>
          <a-form-item label="邮政编码" name="zipCode">
            <a-input v-model:value="dataForm.zipCode" placeholder="邮政编码" />
            <span class="tip">请输入有效的邮政编码</span>
          </a-form-item>
          <a-form-item label="身份证号" name="cardId">
            <a-input v-model:value="dataForm.cardId" placeholder="身份证号" />
            <span class="tip">请输入有效的身份证号</span>
          </a-form-item>
          <a-form-item label="RGB" name="RGB">
            <a-input v-model:value="dataForm.RGB" placeholder="RGB" />
            <span class="tip">请输入有效的十六进制颜色RGB(如：#ffffff)</span>
          </a-form-item>
          <a-form-item label="微信号" name="wechat">
            <a-input v-model:value="dataForm.wechat" placeholder="微信号" />
            <span class="tip">请输入有效的微信号</span>
          </a-form-item>
          <a-form-item label="车牌号" name="licensePlate">
            <a-input v-model:value="dataForm.licensePlate" placeholder="车牌号" />
            <span class="tip">请输入有效的车牌号(如：豫H81888)</span>
          </a-form-item>
          <a-form-item label="QQ" name="qq">
            <a-input v-model:value="dataForm.qq" placeholder="QQ" />
            <span class="tip">请输入有效的QQ号码</span>
          </a-form-item>
          <a-form-item label="IPv4" name="ip">
            <a-input v-model:value="dataForm.ip" placeholder="IPv4" />
            <span class="tip">请输入有效的IPv4（255.255.255.255）</span>
          </a-form-item>
          <a-form-item label="英文" name="english">
            <a-input v-model:value="dataForm.english" placeholder="英文" />
            <span class="tip">请输入有效的英文字母如：A~Z,a~z</span>
          </a-form-item>
          <a-form-item label="汉字" name="chinese">
            <a-input v-model:value="dataForm.chinese" placeholder="汉字" />
            <span class="tip">请输入有效的汉字</span>
          </a-form-item>
          <a-form-item label="日期" name="date">
            <a-input v-model:value="dataForm.date" placeholder="日期" />
            <span class="tip">请输入有效的日期（1900-01-01）</span>
          </a-form-item>
          <a-form-item label="浮点数小于0" name="floatLtZero">
            <a-input v-model:value="dataForm.floatLtZero" placeholder="浮点数小于0" />
            <span class="tip">浮点数只能小于0</span>
          </a-form-item>
          <a-form-item label="浮点数大于0" name="intGtZero">
            <a-input v-model:value="dataForm.intGtZero" placeholder="浮点数大于0" />
            <span class="tip">浮点数只能大于0</span>
          </a-form-item>
          <a-form-item label="浮点数不等于0" name="intNEqZero">
            <a-input v-model:value="dataForm.intNEqZero" placeholder="浮点数不等于0" />
            <span class="tip">浮点数大于或小于0（不包含0）</span>
          </a-form-item>
        </a-form>
      </ScrollContainer>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, ref } from 'vue';
  import { Space as ASpace } from 'ant-design-vue';
  import { ScrollContainer } from '/@/components/Container';
  import type { FormInstance } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  defineOptions({ name: 'extend-formDemo-verifyForm' });

  const validatePass = (_rule, value) => {
    if (value !== state.dataForm.password) {
      return Promise.reject('两次密码输入不一致');
    } else {
      return Promise.resolve();
    }
  };
  const state = reactive({
    dataForm: {
      account: '',
      password: '',
      password2: '',
      email: '',
      number: '',
      creditcard: '',
      url: '',
      price: '',
      tel: '',
      mobile: '',
      phone: '',
      age: '',
      zipCode: '',
      cardId: '',
      RGB: '',
      wechat: '',
      licensePlate: '',
      qq: '',
      ip: '',
      english: '',
      chinese: '',
      date: '',
      floatLtZero: '',
      intGtZero: '',
      intNEqZero: '',
    },
    dataRule: {
      account: [
        { required: true, message: '用户账号不能为空', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在6-20之间', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '用户密码不能为空', trigger: 'blur' },
        { pattern: /^[0-9A-Za-z_-]{6,20}$/, message: '密码需包含字母、数字和_-,长度在6-20之间', trigger: 'blur' },
      ],
      password2: [
        { required: true, message: '确认密码不能为空', trigger: 'blur' },
        { pattern: /^[0-9A-Za-z_-]{6,20}$/, message: '密码需包含字母、数字和_-,长度在6-20之间', trigger: 'blur' },
        { validator: validatePass, trigger: 'blur' },
      ],
      email: [
        { pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/, message: '请输入以@正确格式的电子邮件', trigger: 'blur' },
      ],
      number: [{ pattern: /^\d+$/, message: '只能输入正整数', trigger: 'blur' }],
      creditcard: [{ pattern: /^(62[0-9]{14,16})$/, message: '请输入有效的信用卡号', trigger: 'blur' }],
      url: [
        {
          pattern: /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/,
          message: '以http:或https:开头的有效地址',
          trigger: 'blur',
        },
      ],
      price: [{ pattern: /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0$/, message: '只能输入大于或等于0的金额（包含小数）', trigger: 'blur' }],
      tel: [{ pattern: /^1[3456789]\d{9}$|^0\d{2,3}-?\d{7,8}$/, message: '请输入正确的联系方式', trigger: 'blur' }],
      mobile: [{ pattern: /^1[358]\d{9}$/, message: '只能输入以13,15,18开头的手机号码', trigger: 'blur' }],
      phone: [{ pattern: /^0\d{2,3}-?\d{7,8}$/, message: '请输入有效的电话号码', trigger: 'blur' }],
      age: [{ pattern: /^([1-9]|[1-9]\d|100)$/, message: '请输入1~100有效年龄', trigger: 'blur' }],
      zipCode: [{ pattern: /^[1-9]\d{5}$/, message: '请输入有效的邮政编码', trigger: 'blur' }],
      cardId: [{ pattern: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/, message: '请输入有效的身份证号', trigger: 'blur' }],
      RGB: [{ pattern: /^#([a-fA-F\d]{6}|[a-fA-F\d]{3})$/, message: '请输入有效的十六进制颜色RGB(如：#ffffff)', trigger: 'blur' }],
      wechat: [{ pattern: /^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/, message: '请输入有效的微信号', trigger: 'blur' }],
      licensePlate: [
        {
          pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/,
          message: '请输入有效的车牌号(如：豫H81888)',
          trigger: 'blur',
        },
      ],
      qq: [{ pattern: /^[1-9]\d{4,12}$/, message: '请输入有效的QQ号码', trigger: 'blur' }],
      ip: [
        {
          pattern: /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/,
          message: '请输入有效的IPv4（255.255.255.255）',
          trigger: 'blur',
        },
      ],
      english: [{ pattern: /^[A-Za-z]$/, message: '请输入有效的英文字母如：A~Z,a~z', trigger: 'blur' }],
      chinese: [{ pattern: /[\u4E00-\u9FA5]/, message: '请输入有效的汉字', trigger: 'blur' }],
      date: [{ pattern: /^\d{4}-\d{1,2}-\d{1,2}$/, message: '请输入有效的日期（1900-01-01）', trigger: 'blur' }],
      floatLtZero: [{ pattern: /^-([1-9]\d*\.\d*|0\.\d*[1-9]\d)*$/, message: '浮点数只能小于0', trigger: 'blur' }],
      intGtZero: [{ pattern: /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/, message: '浮点数只能大于0', trigger: 'blur' }],
      intNEqZero: [{ pattern: /^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+)$/, message: '浮点数大于或小于0（不包含0）', trigger: 'blur' }],
    },
    btnLoading: false,
  });
  const { dataForm, dataRule, btnLoading } = toRefs(state);
  const formRef = ref<FormInstance>();
  const { createMessage } = useMessage();

  async function handleSubmit() {
    try {
      const values = await formRef.value?.validate();
      if (!values) return;
      createMessage.success('验证成功');
    } catch (_) {}
  }
  function resetForm() {
    formRef.value?.resetFields();
  }
</script>
<style lang="less" scoped>
  .ant-input {
    width: 300px;
  }
  .tip {
    margin-left: 10px;
    color: @text-color-help-dark;
  }
</style>
