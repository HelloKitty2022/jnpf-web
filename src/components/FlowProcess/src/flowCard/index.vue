<script lang="tsx">
  import { computed, defineComponent, unref } from 'vue';
  import { NodeUtils } from '../helper/util';
  import { useMessage } from '/@/hooks/web/useMessage';
  const isCondition = data => data.type === 'condition' || (data.type === 'approver' && (data.isInterflow || data.isBranchFlow));
  const notEmptyArray = arr => Array.isArray(arr) && arr.length > 0;
  const hasBranch = data => notEmptyArray(data.conditionNodes);
  const stopPro = e => e && e.stopPropagation();

  export default defineComponent({
    props: {
      data: { type: Object, required: true },
      formInfo: { type: Object },
      // 点击发布时需要校验节点数据完整性 此时打开校验模式
      verifyMode: { type: Boolean, default: true },
      isPreview: { type: Boolean, default: false },
      isEnd: { type: Boolean, default: false },
    },
    emits: ['emits'],
    setup(props, { emit }) {
      const { createConfirm } = useMessage();
      const flowType = computed(() => props.formInfo?.type || 0);

      function createNormalCard(conf) {
        const classList = ['flow-path-card'];
        if (conf.state) classList.push(conf.state);
        const afterTrue = (isTrue, name) => (isTrue && classList.push(name), isTrue);
        afterTrue(NodeUtils.isStartNode(conf), 'start-node');
        afterTrue(NodeUtils.isApproverNode(conf), 'approver');
        afterTrue(NodeUtils.isCopyNode(conf), 'copy');
        const isTimerNode = afterTrue(NodeUtils.isTimerNode(conf), 'timer');
        const isSubFlowNode = afterTrue(NodeUtils.isSubFlowNode(conf), 'subFlow');
        return (
          <section class={classList.join(' ')} onClick={eventLauncher.bind(null, 'edit', conf) as any}>
            <header class="header">
              <div class="title-box" style="height: 100%;width:190px;">
                <span class="title-text">{conf.properties.title}</span>
                {!isTimerNode && <a-input vModel:value={conf.properties.title} class="title-input" onClick={e => stopPro(e)} />}
              </div>
              {!props.isPreview && (
                <div class="actions">
                  <i class="icon-ym icon-ym-nav-close icon" onClick={eventLauncher.bind(null, 'deleteNode', conf, props.data) as any}></i>
                </div>
              )}
              {isSubFlowNode && <a-tag class="async-state">{conf.properties.isAsync ? '异步' : '同步'}</a-tag>}
            </header>
            <div class="body">
              <span class="text">{conf.content}</span>
            </div>
          </section>
        );
      }
      const createFunc = conf => createNormalCard(conf);
      const nodes = {
        start: createFunc,
        approver: createFunc,
        copy: createFunc,
        timer: createFunc,
        subFlow: createFunc,
        interflow: createFunc,
        branchFlow: createFunc,
        empty: _ => '',
        condition: function (conf) {
          return (
            <section class="flow-path-card condition" onClick={eventLauncher.bind(null, 'edit', conf) as any}>
              <header class="header">
                <div class="title-box" style="height:20px;width:160px;">
                  <span class="title-text">{conf.properties.title}</span>
                  <a-input vModel:value={conf.properties.title} class="title-input" onClick={e => stopPro(e)} />
                </div>
                {!props.isPreview && (
                  <div class="actions">
                    <i class="icon-ym icon-ym-nav-close icon" onClick={eventLauncher.bind(null, 'deleteNode', conf, props.data) as any}></i>
                  </div>
                )}
              </header>
              <div class="body">
                <div class="text">{conf.content}</div>
              </div>
            </section>
          );
        },
      };
      function addNodeButton(data, isBranch = false) {
        if (data.type === 'condition' && data.properties.conditionType === 1) {
          return (
            <div class="add-node-btn-box flex justify-center">
              <div class="add-node-btn">
                <button class="btn disabled-btn" type="button">
                  <i class="icon-ym icon-ym-nav-close icon"></i>
                </button>
              </div>
            </div>
          );
        }
        if (props.isPreview) {
          return <div class="add-node-btn-box flex justify-center"></div>;
        }
        // 只有非条件节点和条件分支树下面的那个按钮 才能添加新分支树
        // let couldAddBranch = !hasBranch(data) || isBranch;
        let canAddAppendBranch = true;
        let canAddAppendInterflow = true;
        let canAddAppendBranchFlowBranch = true;
        let canAddSubFlow = true;
        let canAddTimerNode = true;
        if (Array.isArray(data.conditionNodes) && data.conditionNodes.length) {
          canAddAppendBranch = false;
          canAddAppendInterflow = false;
          canAddAppendBranchFlowBranch = false;
          canAddSubFlow = false;
          canAddTimerNode = false;
        }
        if (data.type === 'timer' || (data.childNode && data.childNode.type === 'timer')) {
          canAddTimerNode = false;
        }
        if (data.type === 'subFlow') {
          canAddAppendBranch = false;
        }
        const isEmpty = data.type === 'empty';
        if (isEmpty && !isBranch) return '';
        const popoverSlots = {
          content: () => (
            <div class="add-popover-main">
              <a-alert message="增加节点后可能会导致下面节点配置的数据传递规则失效" type="warning" showIcon />
              <div class="condition-box">
                <div>
                  <div class="condition-icon" onClick={eventLauncher.bind(null, 'addApprovalNode', data, isBranch) as any}>
                    <i class="icon-ym icon-ym-flowTodo"></i>
                  </div>
                  审批节点
                </div>
                <div class={{ 'condition-disabled': !canAddSubFlow && !isBranch }}>
                  <div class="condition-icon" onClick={eventLauncher.bind(null, 'addSubFlowNode', data, isBranch, !canAddSubFlow && !isBranch) as any}>
                    <i class="icon-ym icon-ym-generator-subFlow"></i>
                  </div>
                  子流程
                </div>
                <div class={{ 'condition-disabled': !canAddAppendBranch }}>
                  <div class="condition-icon" onClick={eventLauncher.bind(null, 'appendBranch', data, isBranch, !canAddAppendBranch) as any}>
                    <i class="ym-custom ym-custom-sitemap"></i>
                  </div>
                  条件分支
                </div>
                <div class={{ 'condition-disabled': !canAddAppendBranchFlowBranch }}>
                  <div
                    class="condition-icon"
                    onClick={eventLauncher.bind(null, 'appendBranchFlowBranch', data, isBranch, !canAddAppendBranchFlowBranch) as any}>
                    <i class="icon-ym icon-ym-branch"></i>
                  </div>
                  选择分支
                </div>
                <div class={{ 'condition-disabled': !canAddAppendInterflow }}>
                  <div class="condition-icon" onClick={eventLauncher.bind(null, 'appendInterflowBranch', data, isBranch, !canAddAppendInterflow) as any}>
                    <i class="icon-ym icon-ym-node"></i>
                  </div>
                  并行分支
                </div>
                <div class={{ 'condition-disabled': !canAddTimerNode }}>
                  <div class="condition-icon" onClick={eventLauncher.bind(null, 'addTimerNode', data, isBranch, !canAddTimerNode) as any}>
                    <i class="icon-ym icon-ym-timer"></i>
                  </div>
                  定时器
                </div>
              </div>
            </div>
          ),
        };
        return (
          <div class="add-node-btn-box flex justify-center">
            <div class="add-node-btn">
              <a-popover placement="right" trigger="click" overlayClassName="add-popover" v-slots={popoverSlots}>
                <button class="btn" type="button">
                  <i class="icon-ym icon-ym-btn-add icon"></i>
                </button>
              </a-popover>
            </div>
          </div>
        );
      }
      function addBranchButton(data) {
        if (props.isPreview) {
          return <span class="line"></span>;
        }
        if (NodeUtils.isConditionNode(data.conditionNodes[0])) {
          const popoverSlots = {
            content: () => (
              <div class="add-popover-main add-condition-popover-main">
                <div class="condition-box">
                  <div onClick={eventLauncher.bind(null, 'appendConditionNode', data, 0) as any}>
                    <div class="condition-icon">
                      <i class="icon-ym icon-ym icon-ym-condition"></i>
                    </div>
                    条件逻辑
                  </div>
                  <div onClick={eventLauncher.bind(null, 'appendConditionNode', data, 1) as any}>
                    <div class="condition-icon">
                      <i class="icon-ym icon-ym icon-ym-turn"></i>
                    </div>
                    转向逻辑
                  </div>
                </div>
              </div>
            ),
          };
          return (
            <a-popover placement="right" trigger="click" overlayClassName="add-popover" v-slots={popoverSlots}>
              <button class="btn">添加条件</button>
            </a-popover>
          );
        }
        if (NodeUtils.isInterflowNode(data.conditionNodes[0])) {
          return (
            <button onClick={eventLauncher.bind(null, 'appendInterflowNode', data) as any} class="btn">
              添加分流
            </button>
          );
        }
        if (NodeUtils.isBranchFlowNode(data.conditionNodes[0])) {
          return (
            <button onClick={eventLauncher.bind(null, 'appendBranchFlowNode', data) as any} class="btn">
              添加分支
            </button>
          );
        }
      }
      function NodeFactory(data) {
        if (!data) return;
        const showErrorTip = props.verifyMode && NodeUtils.checkNode(data) === false;
        let content = '未设置审批人';
        if (NodeUtils.isStartNode(data)) content = `未设置${unref(flowType) == 1 ? '功能' : '表单'}配置`;
        if (NodeUtils.isConditionNode(data)) content = '未设置条件';
        if (NodeUtils.isSubFlowNode(data)) content = '未设置发起人';
        let res: any[] = [],
          branchNode: any = '',
          selfNode = (
            <div class="node-wrap">
              <div
                class={`node-wrap-box ${data.type} ${NodeUtils.isInterflowNode(data) ? 'interflow' : ''}
                ${NodeUtils.isBranchFlowNode(data) ? 'branchFlow' : ''} ${showErrorTip ? 'error' : ''}`}>
                {!props.isPreview && (
                  <a-tooltip title={content}>
                    <div class="error-tip" onClick={eventLauncher.bind(null, 'edit', data) as any}>
                      !!!
                    </div>
                  </a-tooltip>
                )}
                {nodes[data.type](data)}
                {addNodeButton(data)}
              </div>
            </div>
          );

        if (hasBranch(data)) {
          // 如果节点是数组 一定为条件分支 添加分支样式包裹
          branchNode = (
            <div class="branch-wrap">
              <div class="branch-box-wrap">
                <div class="branch-box flex justify-center relative">
                  {addBranchButton(data)}
                  {data.conditionNodes.map(d => NodeFactory(d))}
                </div>
              </div>
              {addNodeButton(data, true)}
            </div>
          );
        }
        if (isCondition(data)) {
          return (
            <div class="col-box">
              <div class="center-line"></div>
              <div class="top-cover-line"></div>
              <div class="bottom-cover-line"></div>
              {selfNode}
              {branchNode}
              {NodeFactory(data.childNode)}
            </div>
          );
        }
        res.push(selfNode);
        branchNode && res.push(branchNode);
        data.childNode && res.push(NodeFactory(data.childNode));
        return res;
      }
      function addEndNode() {
        let className: string = 'end-node';
        if (props.isPreview && props.isEnd) className += ' state-past';
        return <section class={className}>流程结束</section>;
      }
      /**
       *事件触发器 统筹本组件所有事件并转发到父组件中
       * @param { Object } 包含event（事件名）和args（事件参数）两个参数
       */
      function eventLauncher(event, ...args) {
        stopPro(args[args.length - 1]);
        const list = ['appendBranch', 'appendBranchFlowBranch', 'appendInterflowBranch', 'addTimerNode', 'addSubFlowNode'];
        if (list.includes(event) && args[args.length - 2]) return;
        // args.slice(0,-1) vue 会注入MouseEvent到最后一个参数 去除事件对象
        const param = { event, args: args.slice(0, -1) };
        if (event === 'deleteNode') {
          createConfirm({
            iconType: 'warning',
            title: '提示',
            content: '此操作将永久删除该节点，删除后可能会导致下面节点配置的数据传递规则失效，是否继续?',
            onOk: () => {
              emit('emits', param);
            },
          });
        } else {
          emit('emits', param);
        }
      }

      return () => {
        return (
          <div style="display: inline-flex; flex-direction: column; align-items: center;">
            {props.data && NodeFactory(props.data)}
            {addEndNode()}
          </div>
        );
      };
    },
  });
</script>
