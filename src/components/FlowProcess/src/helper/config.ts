const defaultStartForm = {
  initiator: [],
  title: '流程发起',
  errorRule: 1, // 异常处理规则
  errorRuleUser: [], // 指定人员处理异常
  resurgenceDataRule: 0, // 复活取值规则
  funcConfigRule: 0,
  // 限时设置
  timeLimitConfig: {
    on: 0, // 开启
    nodeLimit: 0, // 节点限定时长起始值类型
    duringDeal: 24, // 节点处理限定时长(时)
    formField: '', // 请选择字段
  },
  overTimeConfig: {
    on: 0, // 开启
    firstOver: 0, // 第一次超时时间(时)
    overTimeDuring: 2, // 超时间隔(时)
    overNotice: true, // 超时事务-超时通知
    overAutoApprove: false, // 超时事务-超时自动审批
    overAutoApproveTime: 5, // 自动审批超时次数(次)
    overEvent: false, // 超时事件
    overEventTime: 5, // 超时事件超时次数(次)
  },
  noticeConfig: {
    on: 0, // 开启
    firstOver: 1, // 第一次提醒时间(时)
    overTimeDuring: 2, // 提醒间隔(时)
    overNotice: true, // 提醒事务-提醒通知
    overEvent: false, // 提醒事件
    overEventTime: 5, // 提醒次数(次)
  },
  // 流程事件
  overTimeFuncConfig: {
    on: false, // 开启
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [], // 模块json
  },
  noticeFuncConfig: {
    on: false, // 开启
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [], // 模块json
  },
  initFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: [],
  },
  endFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: [],
  },
  flowRecallFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: [],
  },
  waitMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  endMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  approveMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  rejectMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  copyMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  overTimeMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  noticeMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  hasSubmitBtn: true,
  submitBtnText: '提交',
  hasSaveBtn: true,
  saveBtnText: '暂存',
  hasPressBtn: true,
  pressBtnText: '催办',
  hasRevokeBtn: true,
  revokeBtnText: '撤回',
  hasPrintBtn: false,
  printBtnText: '打印',
  printId: '',
  isComment: false,
  isBatchApproval: false,
  isSummary: false,
  summaryType: 0,
  titleType: 0,
  defaultContent: '{发起用户名}的{流程名称}',
  titleContent: '',
  formOperates: [],
  circulateUser: [],
  isCustomCopy: false,
  isFormFieldCopy: false,
  copyFormFieldType: 1,
  copyFormField: '',
  extraCopyRule: 1,
  hasSign: false,
  hasOpinion: true,
  formId: '',
  formName: '',
  allFormMap: {},
  revokeRule: 2,
};
const defaultSubFlowForm = {
  errorRule: 1, // 异常处理规则
  errorRuleUser: [], // 指定人员处理异常
  formFieldType: 1, // 表单字段审核方式的类型(1-用户 2-部门)
  initiateType: 6,
  managerLevel: 1,
  departmentLevel: 1,
  formField: '',
  nodeId: '',
  initiator: [],
  flowId: '',
  flowName: '',
  assignList: [],
  prevNodeList: [],
  // 接口服务
  interfaceConfig: {
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [], // 模块json
  },
  launchMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  isAsync: false,
  autoSubmit: false,
};
const defaultApproverForm = {
  extraRule: 1, // 审批人范围,默认无审批人范围
  extraCopyRule: 1, // 抄送审批人范围,默认无审批人范围
  hasAgreeRule: false, // 自动同意规则,默认不启用
  agreeRules: [], // 自动同意规则数组
  formFieldType: 1, // 表单字段审核方式的类型(1-用户 2-部门)
  approvers: [], // 审批人集合
  approversSortList: [], // 审批人依次审批顺序
  assigneeType: 6, // 指定审批人
  userType: 'role', //role,position,user
  formOperates: [], // 表单权限集合
  circulateUser: [], // 抄送人集合
  isCustomCopy: false,
  isInitiatorCopy: false,
  isFormFieldCopy: false,
  copyFormFieldType: 1,
  copyFormField: '',
  progress: '50', // 进度
  rejectType: 1, //退回
  rejectStep: '0', // 退回步骤
  description: '', // 节点描述
  managerLevel: 1,
  departmentLevel: 1,
  counterSignConfig: {
    auditType: 1,
    auditRatio: 100,
    auditNum: 1,
    rejectType: 0,
    rejectRatio: 10,
    rejectNum: 1,
  },
  formField: '',
  nodeId: '',
  counterSign: 0,
  noApproverHandler: true,
  hasFreeApproverBtn: false,
  hasFreeApproverBtnText: '加签',
  hasSaveBtn: false,
  saveBtnText: '暂存',
  hasAuditBtn: true,
  auditBtnText: '通过',
  hasRejectBtn: true,
  rejectBtnText: '退回',
  hasRevokeBtn: true,
  revokeBtnText: '撤回',
  hasTransferBtn: true,
  transferBtnText: '转审',
  hasCancelBtn: false,
  cancelBtnText: '驳回',
  hasPrintBtn: false,
  printBtnText: '打印',
  printId: '', // 打印模板
  hasSign: false,
  hasOpinion: true,
  formId: '',
  formName: '',
  prevNodeList: [],
  assignList: [],
  timeLimitConfig: {
    on: 2, // 开启
    nodeLimit: 0, // 节点限定时长起始值类型
    duringDeal: 24, // 节点处理限定时长(时)
    formField: '', // 请选择字段
  },
  overTimeConfig: {
    on: 2, // 开启
    firstOver: 0, // 第一次超时时间(时)
    overTimeDuring: 2, // 超时间隔(时)
    overNotice: true, // 超时事务-超时通知
    overAutoApprove: false, // 超时事务-超时自动审批
    overAutoApproveTime: 5, // 自动审批超时次数(次)
    overEvent: false, // 超时事件
    overEventTime: 5, // 超时事件超时次数(次)
  },
  noticeConfig: {
    on: 2, // 开启
    firstOver: 1, // 第一次提醒时间(时)
    overTimeDuring: 2, // 提醒间隔(时)
    overNotice: true, // 提醒事务-提醒通知
    overEvent: false, // 提醒事件
    overEventTime: 5, // 提醒次数(次)
  },
  overTimeMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  noticeMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  approveMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  rejectMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  copyMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: [],
  },
  // 接口服务
  interfaceConfig: {
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [], // 模块json
  },
  // 节点事件
  overTimeFuncConfig: {
    on: false, // 开启
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [], // 模块json
  },
  noticeFuncConfig: {
    on: false, // 开启
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [], // 模块json
  },
  approveFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: [],
  },
  rejectFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: [],
  },
  recallFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: [],
  },
};
export default {
  defaultStartForm,
  defaultApproverForm,
  defaultSubFlowForm,
  start: {
    type: 'start',
    content: '所有人',
    properties: defaultStartForm,
  },
  approver: {
    type: 'approver',
    content: '请设置审批人',
    properties: {
      title: '审批节点',
    },
  },
  copy: {
    type: 'copy',
    content: '发起人自选',
    properties: {
      title: '抄送人',
      members: [],
      userOptional: true,
    },
  },
  timer: {
    type: 'timer',
    content: '请设置时间',
    properties: {
      title: '定时器',
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
    },
  },
  subFlow: {
    type: 'subFlow',
    content: '请设置发起人',
    properties: {
      title: '子流程',
    },
  },
  interflow: {
    type: 'approver',
    content: '请设置审批人',
    isInterflow: true,
    properties: {
      title: '审批节点',
    },
  },
  branchFlow: {
    type: 'approver',
    content: '请设置审批人',
    isBranchFlow: true,
    properties: {
      title: '审批节点',
    },
  },
  condition: {
    type: 'condition',
    content: '请设置条件',
    properties: {
      title: '条件',
      conditions: [],
      matchLogic: 'and',
      initiator: null,
      conditionType: 0, // 条件类型 0-默认 1-转向
      swerveNode: '', // 转向节点
      swerveLabel: '',
    },
  },
  branch: {
    type: 'branch',
    content: '',
    properties: {},
  },
  empty: {
    type: 'empty',
    content: '',
    properties: {},
  },
};
