	var pathName=window.document.location.pathname;  
    //获取带"/"的项目名，如：/uimcardprj  
    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1); 
  $(document).ready(function() {
	
	  loadTree();
	$('#tab_menu').tabs({
				fit : true,
				border : false,
				
			});
});
function loadTree(){
	var json = $("#jv").attr('value');
	var tree = eval(json);
	$('#tt').tree({
				data : tree,
				onClick : function(node) {
					if (node.attributes) {
						var url = node.attributes.url;
						url=projectName+url;
						var identifier = node.attributes.identifier;
						var randomnumber=Math.floor(Math.random()*100000) // iframe缓存不刷新问题彻底解决方法
						if (identifier != null) {
							url += '?processDefinitionName=' + identifier+'&varnum='+randomnumber;
						}else{
							url += '?varnum='+randomnumber;
						}
						var id = 'tab' + node.id;
						addTab("tab_menu", node.text, url, id);
					} else {
						if (node.state == "closed") {
							$(this).tree('expand', node.target);
						} else {
							$(this).tree('collapse', node.target);
						}
						return;
					}
				}   
			});
}  
function addTab(tabId, title, url, id) {
	var tabId = "#" + tabId;
	var ti = $('#' + id);
	if (ti.length > 0) {
		$(tabId).tabs('select', title);
	} else {
		var content = '<iframe scrolling="auto" frameborder="0"  src="' + url
				+ '" style="width:100%;height:99%;"></iframe>';
		$(tabId).tabs('add', {
					id : id,
					title : title,
					content : content,
					closable : true,
					tools : [{
								iconCls : 'icon-mini-refresh',
								handler : function() {
									refreshPage(tabId, content);
								}
							}]
				});
	}
}
function myDateInfo(date) {
	var date = new Date();
	var mydate = date.getFullYear() + "年" + (date.getMonth() + 1) + "月"
			+ date.getDate() + "日" + date.getHours() + "时" + date.getMinutes()
			+ "分" + date.getSeconds() + "秒 星期" + getWeek(date.getDay());
	return mydate;
}
function getWeek(day) {
	var week = "";
	switch (day) {
		case 0 :
			week = "日";
			break;
		case 1 :
			week = "一";
			break;
		case 2 :
			week = "二";
			break;
		case 3 :
			week = "三";
			break;
		case 4 :
			week = "四";
			break;
		case 5 :
			week = "五";
			break;
		case 6 :
			week = "六";
			break;
	}
	return week;
}
function getRootPath() {
	var strFullPath = window.document.location.href;
	var strPath = window.document.location.pathname;
	var pos = strFullPath.indexOf(strPath);
	var prePath = strFullPath.substring(0, pos);
	return prePath;
}
function refreshPage(tabId, content) {
	var tab = $(tabId).tabs('getSelected');
	$(tabId).tabs('update', {
				tab : tab,
				options : {
					content : content
				}
			});
}
function refreshPageIndex() {
	var content = '<iframe scrolling="auto" frameborder="0"  src=projectName+"/view/wf/home.xhtml" style="width:100%;height:99%;"></iframe>';
	refreshPage('#tab_menu', content);
}
function onChangeTheme(theme) {
	$('#themes').attr('href', 'common/jQuery/themes/' + theme + '/easyui.css');
}
