(this["webpackJsonpmixxin-dashboard"]=this["webpackJsonpmixxin-dashboard"]||[]).push([[0],{100:function(e,a,t){e.exports=t(206)},110:function(e,a,t){},203:function(e,a,t){},206:function(e,a,t){"use strict";t.r(a);var n=t(1),c=t.n(n),r=t(95),o=t.n(r),i=t(44),l=t(48),s=t(38),u=t(32);function d(e){return{toDollar:function(){return e?"NTD ".concat(e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")):""},toNumber:function(){return e?e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","):""},toProjectTime:function(){var a=e.split("T"),t=Object(u.a)(a,2),n=t[0],c=t[1];return e?"".concat(n," ").concat(c.substring(0,5)):""},toDate:function(){var a=new Date(e),t=a.getFullYear(),n=("0"+(a.getMonth()+1)).slice(-2),c=("0"+a.getDate()).slice(-2);return e?"".concat(t,"-").concat(n,"-").concat(c):""},toTime:function(){var a=new Date(e),t=("0"+a.getHours()).slice(-2),n=("0"+a.getMinutes()).slice(-2);return e?"".concat(t,":").concat(n):""}}}t(110);var m=function(){var e=Object(n.useState)([]),a=Object(u.a)(e,2),t=a[0],r=a[1],o=Object(n.useState)({}),m=Object(u.a)(o,2),p=m[0],f=m[1],g=t.filter((function(e){return e.adAccountLive}));return g=g.sort((function(e,a){return a.campaignStatus.value-e.campaignStatus.value})),console.log("filteredAdAccounts",g),Object(n.useEffect)((function(){window.checkLoginState=function(){window.FB?window.FB.getLoginStatus((function(e){console.log(e),"connected"===e.status?(f((function(e){return Object(s.a)(Object(s.a)({},e),{},{isLogin:!0})})),console.log("fetchUserAndAdAccounts"),window.FB.api("/me?fields=name,picture{url},adaccounts.limit(1000){age,name,amount_spent,campaigns.limit(1000){status,name}}",(function(e){f((function(a){return Object(s.a)(Object(s.a)({},a),{},{name:e.name,pictureURL:e.picture.data.url})}));var a=e.adaccounts.data.sort((function(e,a){return e.age-a.age}));console.log(a),a=a.map((function(e){return e.adAccountLive=!1,e.campaignStatus={name:"",value:0},e.campaigns&&e.campaigns.data.forEach((function(a){"ACTIVE"===a.status&&(e.adAccountLive=!0),e.campaignStatus=function(e,a){var t=function(e){return e.includes("\u4e0a\u7dda")?{name:"\u4e0a\u7dda",value:3}:e.includes("\u9810\u71b1")?{name:"\u9810\u71b1",value:2}:e.includes("\u524d\u6e2c")?{name:"\u524d\u6e2c",value:1}:{name:"",value:0}}(a);return t.value>e.value?t:e}(e.campaignStatus,a.name)})),e})),r((function(e){return Object(l.a)(a)}))}))):console.log("Please log into this webpage.")})):console.log("FB not loaded.")},window.checkLoginState(),window.fbAsyncInit=function(){window.FB.init({appId:"2772453809519165",cookie:!0,xfbml:!0,version:"v6.0"}),window.FB.AppEvents.logPageView(),window.checkLoginState()},function(e,a,t){var n,c=e.getElementsByTagName(a)[0];e.getElementById(t)||((n=e.createElement(a)).id=t,n.src="https://connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v7.0&appId=2772453809519165&autoLogAppEvents=1",c.parentNode.insertBefore(n,c))}(document,"script","facebook-jssdk")}),[]),c.a.createElement("div",{className:"container my-3"},p.pictureURL?c.a.createElement("div",{className:"text-right my-3"},c.a.createElement("div",{className:"btn btn-primary",onClick:function(){return window.FB.logout((function(e){f({}),r([])}))}},c.a.createElement("div",{className:" d-flex align-items-center"},c.a.createElement("img",{src:p.pictureURL,alt:"avatar",className:"rounded-circle",style:{width:"30px"}}),c.a.createElement("span",{className:"mx-2"},"\u767b\u51fa")))):"",c.a.createElement("h1",{className:"text-center my-3"},"\u5ee3\u544a\u5e33\u865f"),c.a.createElement("div",{className:"w-100 text-center my-3"},c.a.createElement("div",{className:"fb-login-button","data-size":"large","data-button-type":"continue_with","data-layout":"default","data-auto-logout-link":"false","data-use-continue-as":"true","data-width":"","data-onlogin":"checkLoginState();","data-scope":"public_profile,email,ads_read,business_management",style:{display:p.isLogin?"none":"block"}})),g.length>0?c.a.createElement("main",{className:"d-flex flex-wrap justify-content-center"},g.map((function(e){var a=e.name,t=e.id,n=e.campaignStatus,r=e.amount_spent;return c.a.createElement("div",{key:t,className:"card m-1 ad-account-card",style:{width:"18rem"}},c.a.createElement("div",{className:"card-body",onClick:function(){return Object(i.b)("/facebook-ad-account-dashboard/ad-account/".concat(t))}},c.a.createElement("span",{className:"badge badge-"+(3===n.value?"success":2===n.value?"primary":1===n.value?"secondary":"")},n.name),c.a.createElement("h5",{className:"card-title"},a),c.a.createElement("p",{className:"card-text"},"\u7e3d\u5ee3\u544a\u82b1\u8cbb\uff1a",d(r).toDollar())))}))):"")},p=t(63),f=t(76),g=t(97);t(203);var h=function(e){var a=e.adAccountId,t=Object(n.useState)(!0),r=Object(u.a)(t,2),o=r[0],m=r[1],h=Object(f.a)({name:"",platformId:"",projectId:"",data:[],dateArray:[],leadSpendArray:[],leadArray:[],preLaunchSpendArray:[],fundRaisingSpendArray:[],adsDirectRoasArray:[],totalRoasArray:[]}),b=Object(u.a)(h,2),y=b[0],E=b[1],v=Object(f.a)({dailyFundingDiff:void 0}),A=Object(u.a)(v,2),j=A[0],O=A[1],_=Object(n.useState)({}),w=Object(u.a)(_,2),S=(w[0],w[1]),N={labels:Object(l.a)(y.dateArray).reverse(),datasets:[{label:"CPL",fill:!1,borderColor:"#1f4068",pointBackgroundColor:"#1f4068",pointHoverBackgroundColor:"#1f4068",data:Object(l.a)(y.leadArray).reverse(),yAxisID:"y-axis-1"},{label:"\u7e3d\u9ad4 ROAS",fill:!1,borderColor:"#e43f5a",pointBackgroundColor:"#e43f5a",pointHoverBackgroundColor:"#e43f5a",data:Object(l.a)(y.totalRoasArray).reverse(),yAxisID:"y-axis-2"}]};return Object(n.useEffect)((function(){function e(e){var a={};return e.forEach((function(e){var t=e.date_start,n=function(e){return e.campaign_name.includes("\u9810\u71b1")?"\u9810\u71b1":e.campaign_name.includes("\u524d\u6e2c")?"\u524d\u6e2c":e.campaign_name.includes("\u4e0a\u7dda")?"\u4e0a\u7dda":"none"}(e);a[t]?a[t][n]?a[t][n].push(e):a[t][n]=[e]:a[t]=Object(p.a)({},n,[e])})),a}fetch("https://fb-ads-api.herokuapp.com/ad-account/info/".concat(a)).then((function(e){return e.json()})).then((function(e){E((function(a){a.name=e.name,a.platformId=e.business_street,a.projectId=e.business_street2}))})),function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";m(!0),fetch("https://fb-ads-api.herokuapp.com/ad-account/insights/".concat(a,"?").concat(t,"=").concat(n)).then((function(e){return e.json()})).then((function(a){E((function(t){t.data=e(a.data)})),S(a.paging),m(!1)}))}()}),[a,E]),Object(n.useEffect)((function(){!function(){var e=Object.keys(y.data),a=[],t=[],n=[],c=[],r=[];Object.values(y.data).forEach((function(e){if(e["\u9810\u71b1"]){var o=e["\u9810\u71b1"],i=0;o.forEach((function(e){if(0!==parseInt(e.spend)){var a=parseInt(e.spend);i+=a}})),0!==i?n.push(i):n.push(null)}else n.push(null);if(e["\u524d\u6e2c"]){var l=e["\u524d\u6e2c"],s=0,u=0;l.forEach((function(e){if(0!==parseInt(e.spend)&&e.actions){var a=parseInt(e.spend),t=e.actions.find((function(e){return"offsite_conversion.fb_pixel_custom"===e.action_type||"lead"===e.action_type}));s+=a,u+=t?parseInt(t.value):0}})),0!==s&&0!==u?(a.push(s),t.push((s/u).toFixed(1))):(a.push(null),t.push(null))}else a.push(null),t.push(null);if(e["\u4e0a\u7dda"]){var d=e["\u4e0a\u7dda"],m=0,p=0;d.forEach((function(e){if(0!==parseInt(e.spend)&&e.action_values){var a=parseInt(e.spend),t=e.action_values.find((function(e){return"omni_purchase"===e.action_type}));m+=a,p+=t?parseInt(t.value):0}})),0!==m&&0!==p?(c.push(m),r.push((p/m).toFixed(1))):(c.push(null),r.push(null))}else c.push(null),r.push(null)})),E((function(o){o.dateArray=e,o.leadSpendArray=a,o.leadArray=t,o.preLaunchSpendArray=n,o.fundRaisingSpendArray=c,o.adsDirectRoasArray=r}))}()}),[y.data,E]),Object(n.useEffect)((function(){var e=y.platformId,a=y.projectId;e&&a&&function(e,a){fetch("https://drip.zectrack.today/api/platform/".concat(e,"/projects/").concat(a)).then((function(e){return e.json()})).then((function(e){O((function(a){return Object(s.a)(Object(s.a)(Object(s.a)({},a),e),{},{timeline:JSON.parse(e.timeline).sort((function(e,a){return e[0]-a[0]})),sponsor_count:d(e.sponsor_count).toNumber(),funding_target:d(e.funding_target).toDollar(),funding_current:d(e.funding_current).toDollar(),started_at:d(e.started_at).toProjectTime(),finished_at:d(e.finished_at).toProjectTime()})}))}))}(e,a)}),[y.platformId,y.projectId,O]),Object(n.useEffect)((function(){if(j.timeline){var e=new Date(j.started_at.slice(0,-1)).getTime()/1e3,a=new Date(j.finished_at.slice(0,-1)).getTime()/1e3;e-=3600;var t={};j.timeline.forEach((function(n){if(!(n[0]<e||n[0]>a)){var c=d(1e3*n[0]).toDate(),r=[d(1e3*n[0]).toTime(),n[1],n[2]];t[c]?t[c].push(r):t[c]=[r]}}));for(var n={},c=0,r=0,o=Object.entries(t);r<o.length;r++){var i=Object(u.a)(o[r],2),l=i[0],s=i[1],m=s[s.length-1][2];n[l]=m-c,c=m}O((function(e){e.dailyFundingDiff=n}))}}),[j.timeline,j.started_at,j.finished_at,O]),Object(n.useEffect)((function(){if(j.dailyFundingDiff&&y.fundRaisingSpendArray.length>0){var e=[];y.dateArray.forEach((function(a,t){j.dailyFundingDiff[a]&&y.fundRaisingSpendArray[t]?e.push((j.dailyFundingDiff[a]/y.fundRaisingSpendArray[t]).toFixed(1)):e.push(null)})),E((function(a){a.totalRoasArray=e}))}}),[j.dailyFundingDiff,y.fundRaisingSpendArray,y.dateArray,E]),c.a.createElement("div",{className:"container my-3"},o?c.a.createElement("div",{className:"text-center my-5"},c.a.createElement("div",{className:"spinner-border text-primary",role:"status"},c.a.createElement("span",{className:"sr-only"},"Loading..."))):c.a.createElement(c.a.Fragment,null,c.a.createElement("div",{className:"btn btn-primary",onClick:function(){return Object(i.b)("/facebook-ad-account-dashboard/")}},"Home"),c.a.createElement("h1",{className:"text-center my-3"},y.name),j.name?c.a.createElement("div",{className:"row"},c.a.createElement("div",{className:"col-12 col-md-6"},c.a.createElement("div",{style:{margin:"0 auto",maxWidth:"480px"}},c.a.createElement("div",{style:{paddingTop:"56.25%",backgroundImage:"url(".concat(j.og_image,")"),backgroundSize:"cover",backgroundPosition:"center"}}))),c.a.createElement("div",{className:"col-12 col-md-6 p-3"},c.a.createElement("p",null,j.name),c.a.createElement("h3",null,j.funding_current),c.a.createElement("hr",null),c.a.createElement("p",null,c.a.createElement("span",{className:"font-weight-bolder mr-3"},"\u76ee\u6a19"),c.a.createElement("span",{className:"text-secondary"},j.funding_target)),c.a.createElement("p",null,c.a.createElement("span",{className:"font-weight-bolder mr-3"},"\u8d0a\u52a9\u4eba\u6578"),c.a.createElement("span",{className:"text-secondary"},j.sponsor_count)),c.a.createElement("p",null,c.a.createElement("span",{className:"font-weight-bolder mr-3"},"\u6642\u7a0b"),c.a.createElement("span",{className:"text-secondary"},j.started_at," ~ ",j.finished_at)))):"",c.a.createElement("div",{className:"my-5",style:{height:"300px"}},c.a.createElement(g.a,{data:N,options:{maintainAspectRatio:!1,hover:{intersect:!1},tooltips:{mode:"index",intersect:!1},scales:{yAxes:[{type:"linear",display:!0,position:"left",id:"y-axis-1",gridLines:{drawOnChartArea:!1},scaleLabel:{display:!0,labelString:"\u540d\u55ae\u53d6\u5f97\u6210\u672c"}},{type:"linear",display:!0,position:"right",id:"y-axis-2",scaleLabel:{display:!0,labelString:"ROAS"}}]}}})),c.a.createElement("table",{className:"table"},c.a.createElement("thead",null,c.a.createElement("tr",null,c.a.createElement("th",{scope:"col"},"Date"),c.a.createElement("th",{scope:"col"},"\u524d\u6e2c\u82b1\u8cbb"),c.a.createElement("th",{scope:"col"},"CPL"),c.a.createElement("th",{scope:"col"},"\u9810\u71b1\u82b1\u8cbb"),c.a.createElement("th",{scope:"col"},"\u4e0a\u7dda\u82b1\u8cbb"),c.a.createElement("th",{scope:"col"},"\u5ee3\u544a\u76f4\u63a5 ROAS"),c.a.createElement("th",{scope:"col"},"\u7e3d\u9ad4 ROAS"))),c.a.createElement("tbody",null,y.dateArray.map((function(e,a){return c.a.createElement("tr",{key:"daily-adAccount-data-".concat(a)},c.a.createElement("th",null,e),c.a.createElement("td",null,d(y.leadSpendArray[a]).toDollar()),c.a.createElement("td",null,d(y.leadArray[a]).toDollar()),c.a.createElement("td",null,d(y.preLaunchSpendArray[a]).toDollar()),c.a.createElement("td",null,d(y.fundRaisingSpendArray[a]).toDollar()),c.a.createElement("td",null,y.adsDirectRoasArray[a]),c.a.createElement("td",null,y.totalRoasArray[a]))}))))))},b=function(){return c.a.createElement(i.a,{basepath:"/facebook-ad-account-dashboard",primary:!1},c.a.createElement(m,{path:"/"}),c.a.createElement(h,{path:"/ad-account/:adAccountId"}))};t(204);o.a.render(c.a.createElement(c.a.StrictMode,null,c.a.createElement(b,null)),document.getElementById("root"))}},[[100,1,2]]]);
//# sourceMappingURL=main.be094cb1.chunk.js.map