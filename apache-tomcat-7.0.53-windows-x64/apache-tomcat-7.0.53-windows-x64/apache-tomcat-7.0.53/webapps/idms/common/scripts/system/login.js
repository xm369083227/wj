$(document).ready(function() {
			$('.login').keydown(function(event) {
						if (event.which == 13) {
							login();
						}
					});
			$('input[name="submit"]').click(function() {
						login();
					});
		});
function login() {
	var username = $('#username').attr('value');
	var password = $('#password').attr('value');
	username = trim(username);
	password = trim(password);
	if (username == "" || password == "") {
		$.messager.alert('登录提示', '用户名或者密码不能为空!', 'info');
	} else {
		$.post('/login.do', {
					username : username,
					password : password
				}, function(data) {
					if (data.state=='success') {
						$.post('/j_security_check', {
									j_username : data.userNo,
									j_password : data.password
								}, function(data) {
									window.location.href = '/main.xhtml';
									window.event.returnValue = false;
								});
					}else if(data.state=='failed'){
						$.messager.alert('登录提示', '系统存在两个真实名称为"'+data.reallyName+'"的用户，不能登录，请联系管理员修改用户真实名称！', 'warning');
					} else {
						$.messager.alert('登录提示', '用户名或密码错误!', 'warning');
					}
				}, 'json');
	}
}
function lTrim(str) {
	if (str.charAt(0) == " ") {
		str = str.slice(1);
		str = lTrim(str);
	}
	return str;
}
function rTrim(str) {
	var iLength;
	iLength = str.length;
	if (str.charAt(iLength - 1) == " ") {
		str = str.slice(0, iLength - 1);
		str = rTrim(str);
	}
	return str;
}

// 去掉字串两边的空格
function trim(str) {
	return lTrim(rTrim(str));
}