<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="验证签名使用说明" :footer="null" :width="800">
    <div class="doc-container">
      <div class="docu-container">
        <h4>验证开启</h4>
        <p>验证签名关闭，不使用验证机制</p>
        <p>直接将appId和appSecret，按照 Authorization: appId::appSecret 格式加入到 Header 中。</p>
        <p>验证签名开启，使用下列签名验证机制</p>
        <h4> 签名验证机制 </h4>
        <p>和第三方服务对接时，需要建立通讯双方的信任关系，以及确保通讯内容不被篡改，不被重放等。通常，我们采用 HTTPS 和 KeyId/SecretKey 的方式：</p>
        <ol>
          <li>HTTPS 用来确定接收方的身份，利用公钥证书机制来保证。</li>
          <li>
            根据双方共享的一对 keyId/secret，使用 HMAC
            签名机制，发送方对请求内容进行签名，并加入到Header中，接收方使用同样的方式对请求进行签名计算，比对签名结果用来判别发送方的身份。
          </li>
        </ol>
        <p>当前HTTP授权证书支持globalsign, symantec, geotrust, comodo这四类，其余证书类型需要经过处理，暂时不推荐。</p>
        <p>本系统内采用appId/appSecret来进行签名。</p>
        <h4>签名过程 </h4>
        <p>签名分为以下4个步骤:</p>
        <ol>
          <li>选择合适的签名方法</li>
          <li>根据对应的签名，构建待签名的字符串</li>
          <li>根据对应的签名算法和对应的appSecret，计算待签名字符串的 Hmac 签名</li>
          <li>
            将签名按规定格式加入到 Header: Authorization中。
            <p>通常使用: Authorization: SignVersion:KeyId:Scope:Signature; </p>
          </li>
          <p>本系统内最终以KeyId:Signature规则展示</p>
        </ol>
        <h4> 签名方法 </h4>
        <p>为了使双方采用一致的算法计算签名，需要规定签名字符串的构建和签名算法，为了满足后续的签名算法升级，当前支持的签名方式为： HmacSHA256</p>
        <p>待签名字符串，请按照以下顺序构建</p>
        <ol>
          <li><p>Http Method, 大写。例如 GET, POST。加上换行符 \n</p> </li>
          <li><p>URI Path。query params string 之前的部分。 加上换行符 \n</p> </li>
          <li>
            <p>Header 中的 YmDate， 以时间戳的形式，例如（2022-06-28 16:26:11=>1656404771000）。加上换行符 \n</p>
            <p>该时间将会用来判断请求有效性，限定一分钟之内有效。若无效返回验证超时。</p>
          </li>
          <li><p>UserKey用于用户认证 \n</p> </li>
          <li><p>Header 中的 Host，为开发者自身的域名，加上换行符 \n</p> </li>
        </ol>
        <p>Header规范化方法如下:</p>
        <ol>
          <li>将所有的 header name 都变成小写，按照字典序排序。</li>
          <li>对每一个小写的 name, 取出所有的对应的 value。如果有多个 value, 对所有的 value 进行字典序排序，用逗号 (,) 连接。</li>
          <li>对每一对 name, value。按照如下方式拼接：name:value\n (\n 为换行)</li>
        </ol>
        <h4>计算待签名字符串的签名</h4>
        <p><b>签名使用的 Key</b></p>
        <ol>
          <li>HmacSHA256 方式直接使用 appId 对应的 appSecret。通常这是一个32位 Base64 字符串，将其 Base64 decode 为字节数组。 </li>
          <li>其他方法，为了更加安全的保护 appSecret, 可能会使用特定的算法根据 appSecret 派生出新的签名用的 key。目前保留。</li>
        </ol>
        <p><b>计算签名</b></p>
        <ol>
          <li>使用 HmacSha256 计算 Hmac 签名。</li>
          <li>将待签名字符串，获取对应的 UTF-8 字节数组。</li>
          <li>使用签名算法对待签名字节数组计算 Hmac 签名。</li>
          <li>将签名结果变成 Hex 字符串。</li>
          <li>将签名结果，按照 Authorization: &lt;KeyId&gt;:&lt;Signature&gt; 格式加入到 Header 中。</li>
        </ol>
        <h4> 签名示例 </h4>
        <p>针对 appId, appSecret (abcde, xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy)</p>
        <p>appId和appSecret为必传参数。可以添加为请求头参数（Header）如：abcde:xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy</p>
        <p>其他参数：如果是GET请求，统一路径传参；如果是POST请求，统一Body-application/json传参。 </p>
        <h5> GET 请求： </h5>
        <p>
          <em>GET</em>
          /api/system/DataInterface/{id}/Actions/Response?tenantId=xxxxx&amp;name=abc<br />
          Host : localhost:30000<br />
          YmDate : 1656404771000<br />
          UserKey : xxxxxxx<br />
        </p>
        <p>按照规则生成的待签名字符串如下：</p>
        <table class="table table-bordered">
          <thead>
            <tr><th>签名结果</th><th>说明</th> </tr>
          </thead>
          <tbody>
            <tr><td>待签名字段名</td><td>待签名字段值</td> </tr>
            <tr><td>Http Method</td><td>GET</td> </tr>
            <tr><td>URL Path</td><td>/api/system/DataInterface/{id}/Actions/Response</td> </tr>
            <tr><td>YmDate</td><td>1656404771000</td> </tr>
            <tr><td>UserKey</td><td>xxxxxxx</td> </tr>
            <tr><td>Host</td><td>localhost:30000</td> </tr>
            <tr>
              <td>最终待签名字符串</td>
              <td>以下 \n 表明换行<br />GET\n<br />/api/system/DataInterface/{id}/Actions/Response\n<br />1656404771000\n <br />localhost:30000\n<br /> </td>
            </tr>
            <tr>
              <td>最终计算的 Authorization header</td>
              <td>Authorization: abcde::5a13e56353da7954a96605c7f21f0f14a26a49baf387f95e600cdbdd7f0dc604</td>
            </tr>
          </tbody>
        </table>
        <h5> POST 请求： </h5>
        <p>
          <em>
            POST /api/system/DataInterface/{id}/Actions/Response<br />
            Host : localhost:30000<br />
            YmDate : 1656404771000<br />
            UserKey : xxxxxxx<br />
            body参数json格式如：{"tenantId":"123","name":"abc"}
          </em>
        </p>
        <p>按照规则生成的待签名字符串如下：</p>
        <table class="table table-bordered">
          <thead>
            <tr><th>签名结果</th><th></th> </tr>
          </thead>
          <tbody>
            <tr><td>待签名字段名</td><td>待签名字段值</td> </tr>
            <tr><td>Http Method</td><td>POST</td> </tr>
            <tr><td>URL Path</td><td>/api/system/DataInterface/{id}/Actions/Response</td> </tr>
            <tr><td>YmDate</td><td>1656404771000</td> </tr>
            <tr><td>UserKey</td><td>xxxxxxx</td> </tr>
            <tr><td>Host</td><td>localhost:30000</td> </tr>
            <tr>
              <td>最终待签名字符串</td>
              <td>以下 \n 表明换行<br />POST\n<br />/hmac/testPost\n<br />1656404771000\n <br />localhost:30000\n<br /></td>
            </tr>
            <tr>
              <td>最终计算的 Authorization header</td>
              <td>Authorization : abcde::7af664ac15b675633bc13a3ab03adc2d0c6e3834999785698e5830ae215a8545</td>
            </tr>
          </tbody>
        </table>
        <h4> (java版)生成待签名字符串及Authorization代码示例: </h4>
        <pre
          class="language-java"><code class=" language-java"><span class="token keyword">import</span> org<span class="token punctuation">.</span>apache<span class="token punctuation">.</span>commons<span class="token punctuation">.</span>codec<span class="token punctuation">.</span>binary<span class="token punctuation">.</span>Base64<span class="token punctuation">;</span>
<span class="token keyword">import</span> org<span class="token punctuation">.</span>apache<span class="token punctuation">.</span>commons<span class="token punctuation">.</span>codec<span class="token punctuation">.</span>binary<span class="token punctuation">.</span>Hex<span class="token punctuation">;</span>
<span class="token keyword">import</span> javax<span class="token punctuation">.</span>crypto<span class="token punctuation">.</span>Mac<span class="token punctuation">;</span>
<span class="token keyword">import</span> javax<span class="token punctuation">.</span>crypto<span class="token punctuation">.</span>spec<span class="token punctuation">.</span>SecretKeySpec<span class="token punctuation">;</span>
<span class="token keyword">import</span> java<span class="token punctuation">.</span>io<span class="token punctuation">.</span>UnsupportedEncodingException<span class="token punctuation">;</span>
<span class="token keyword">import</span> java<span class="token punctuation">.</span>security<span class="token punctuation">.</span>InvalidKeyException<span class="token punctuation">;</span>
<span class="token keyword">import</span> java<span class="token punctuation">.</span>security<span class="token punctuation">.</span>NoSuchAlgorithmException<span class="token punctuation">;</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">EncryDemo</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span>String<span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token keyword">throws</span> NoSuchAlgorithmException<span class="token punctuation">,</span> InvalidKeyException<span class="token punctuation">,</span> UnsupportedEncodingException <span class="token punctuation">{</span>
        String secret <span class="token operator">=</span> <span class="token string">"xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy"</span><span class="token punctuation">;</span>
        String algorithmForMac <span class="token operator">=</span> <span class="token string">"HmacSHA256"</span><span class="token punctuation">;</span>
        String method <span class="token operator">=</span> <span class="token string">"POST"</span><span class="token punctuation">;</span>
        String urlPath <span class="token operator">=</span> <span class="token string">"/api/system/DataInterface/{id}/Actions/Response"</span><span class="token punctuation">;</span>
        String YmDate <span class="token operator">=</span> <span class="token string">"1656404771000"</span><span class="token punctuation">;</span>
        String host <span class="token operator">=</span> <span class="token string">"localhost:30000"</span><span class="token punctuation">;</span>
        String source <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">StringBuilder()</span>
                      <span class="token punctuation">.</span><span class="token function">append</span>(method)<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">append</span>(url)<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">append</span>(ymdate)<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">append</span>(host)<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span><span class="token punctuation">.toString();</span>
        Mac mac <span class="token operator">=</span> Mac<span class="token punctuation">.</span><span class="token function">getInstance</span><span class="token punctuation">(</span>algorithmForMac<span class="token punctuation">)</span><span class="token punctuation">;</span>
        SecretKeySpec secretKeySpec <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SecretKeySpec</span><span class="token punctuation">(</span>Base64<span class="token punctuation">.</span><span class="token function">decodeBase64</span><span class="token punctuation">(</span>secret<span class="token punctuation">)</span><span class="token punctuation">,</span> algorithmForMac<span class="token punctuation">)</span><span class="token punctuation">;</span>
        mac<span class="token punctuation">.</span><span class="token function">init</span><span class="token punctuation">(</span>secretKeySpec<span class="token punctuation">)</span><span class="token punctuation">;</span>
        String signature <span class="token operator">=</span> Hex<span class="token punctuation">.</span><span class="token function">encodeHexString</span><span class="token punctuation">(</span>mac<span class="token punctuation">.</span><span class="token function">doFinal</span><span class="token punctuation">(</span>source<span class="token punctuation">.</span><span class="token function">getBytes</span><span class="token punctuation">(</span><span class="token string">"utf-8"</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        System<span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>signature<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
        <h4>(.net版)生成待签名字符串及Authorization代码示例: ></h4>
        <pre class="language-java"><code class=" language-java"><span class="token keyword">using</span><span > System.Security.Cryptography;</span>
<span class="token keyword">using</span><span> System.Text;</span>
<span class="token keyword">using</span><span > JNPF.Common.Extension;</span>
<span class="token keyword">namespace JNPF.Systems.System</span>
<span class="token punctuation">{</span>
    <span class="token keyword"> internal class Class1</span>
    <span class="token punctuation">{</span>
      <span class="token keyword"> static void Main(string[] args)</span>
      <span class="token punctuation">{</span>
        String secret <span class="token operator">=</span> <span class="token string">"xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy"</span><span class="token punctuation">;</span>
        String method <span class="token operator">=</span> <span class="token string">"POST"</span><span class="token punctuation">;</span>
        String urlPath <span class="token operator">=</span> <span class="token string">"/api/system/DataInterface/{id}/Actions/Response"</span><span class="token punctuation">;</span>
        String YmDate <span class="token operator">=</span> <span class="token string">"1656404771000"</span><span class="token punctuation">;</span>
        String host <span class="token operator">=</span> <span class="token string">"localhost:30000"</span><span class="token punctuation">;</span>
        String source <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">StringBuilder()</span>
                      <span class="token punctuation">.</span><span class="token function">Append</span>(method)<span class="token punctuation">.</span><span class="token function">Append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">Append</span>(url)<span class="token punctuation">.</span><span class="token function">Append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">Append</span>(ymdate)<span class="token punctuation">.</span><span class="token function">Append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">Append</span>(host)<span class="token punctuation">.</span><span class="token function">Append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span><span class="token punctuation">.ToString();</span>
        <span>using (var hmac = </span><span class="token keyword">new</span><span> HMACSHA256(secret.</span><span class="token function">ToBytes</span><span>(Encoding.UTF8)))</span>
        <span class="token punctuation">{</span>
          <span>byte[] hashmessage = hmac.</span><span class="token function">ComputeHash</span><span>(source.</span><span class="token function">ToBytes</span><span>(Encoding.UTF8));</span>
          <span>var signature = hashmessage.</span><span class="token function">ToHexString</span><span>();</span>
          <span>Console.</span><span class="token function">WriteLine</span><span>(signature);</span>
          <span>Console.</span><span class="token function">ReadKey</span><span>();</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';

  const [registerModal] = useModalInner();
</script>
<style lang="less" scoped>
  table {
    width: 100%;
    margin: 10px 0 !important;
  }
  table thead {
    background: #eceef0;
  }
  table thead tr th {
    font-weight: 600;
  }
  table tbody tr:nth-child(odd) {
    background: #fcfcfc;
  }
  table tbody tr:nth-child(2n) {
    background: #f9f9f9;
  }
  table tr td,
  table tr th {
    font-size: 14px;
    line-height: 20px;
    padding: 17px 20px;
    text-align: left;
    font-weight: 400;
  }
  table.noise-table tbody tr td {
    background-color: #f9f9f9;
  }
  .doc-container {
    padding-bottom: 10px;
  }
  .doc-container .docu-container ol,
  .doc-container .docu-container ul {
    padding: 10px 0;
    margin-left: 20px;
    font-weight: 400;
    font-size: 16px;
  }
  .doc-container .docu-container ol li,
  .doc-container .docu-container ul li {
    margin-top: 6px !important;
  }
  .doc-container .docu-container ol ol,
  .doc-container .docu-container ol ul,
  .doc-container .docu-container ul ol,
  .doc-container .docu-container ul ul {
    padding: 10px 0 10px 0 !important;
    margin-left: 0;
  }
  .doc-container .docu-container p {
    font-size: 16px !important;
    padding: 6px 0 !important;
  }
  .doc-container .docu-container table {
    margin: 20px 0;
  }
  .doc-container .docu-container p {
    padding: 10px 0;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
  }

  .doc-container .docu-container h4 {
    font-size: 24px !important;
    font-weight: 550;
    padding-top: 10px;
  }
  .doc-container .docu-container h5 {
    margin: 10px 0 0;
    font-size: 18px;
    line-height: 28px;
    font-weight: 550 !important;
    padding-top: 20px !important;
    padding-bottom: 10px !important;
  }
  .doc-container .docu-container h5 a {
    font-size: 20px !important;
  }
  .doc-container {
    code[class*='language-'],
    pre[class*='language-'] {
      color: black;
      background: none;
      text-shadow: 0 1px white;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      text-align: left;
      white-space: pre;
      word-spacing: normal;
      word-break: normal;
      word-wrap: normal;
      line-height: 1.5;
      -moz-tab-size: 4;
      -o-tab-size: 4;
      tab-size: 4;
      -webkit-hyphens: none;
      -moz-hyphens: none;
      -ms-hyphens: none;
      hyphens: none;
    }

    pre[class*='language-']::-moz-selection,
    pre[class*='language-'] ::-moz-selection,
    code[class*='language-']::-moz-selection,
    code[class*='language-'] ::-moz-selection {
      text-shadow: none;
      background: #b3d4fc;
    }

    pre[class*='language-']::selection,
    pre[class*='language-'] ::selection,
    code[class*='language-']::selection,
    code[class*='language-'] ::selection {
      text-shadow: none;
      background: #b3d4fc;
    }

    pre[class*='language-'] {
      padding: 1em;
      margin: 0.5em 0;
      overflow: auto;
    }

    :not(pre) > code[class*='language-'],
    pre[class*='language-'] {
      background: #f5f2f0;
    }

    :not(pre) > code[class*='language-'] {
      padding: 0.1em;
      border-radius: 0.3em;
      white-space: normal;
    }
  }
</style>
