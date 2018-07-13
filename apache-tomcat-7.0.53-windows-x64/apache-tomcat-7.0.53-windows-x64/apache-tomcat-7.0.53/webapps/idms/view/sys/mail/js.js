$(function() {
	/* 根据邮箱类型显示接收邮件服务器的主机、端口 */
	var type = $("#editform\\:mailType_input").val();
	if (type == 'pop3') {
		$("#editform\\:imapHost,#editform\\:imapPort").parent().parent().css(
				'display', 'none');
		$("#editform\\:popHost").val($("#editform\\:mailHost").val());
		$("#editform\\:popPort").val($("#editform\\:mailPort").val());
	} else {
		$("#editform\\:popHost,#editform\\:popPort").parent().parent().css(
				'display', 'none');
		$("#editform\\:imapHost").val($("#editform\\:mailHost").val());
		$("#editform\\:imapPort").val($("#editform\\:mailPort").val());
	}
	/* 邮箱类型选项改变事件，显示隐藏pop3或imap主机、端口 */
	$("#editform\\:mailType_input").change(
			function() {
				var type = $("#editform\\:mailType_input").val();
				if (type == 'pop3') {
					$("#editform\\:imapHost,#editform\\:imapPort")
							.parents('tr').hide();
					$("#editform\\:popHost,#editform\\:popPort").parents('tr')
							.show();
				} else {
					$("#editform\\:imapHost,#editform\\:imapPort")
							.parents('tr').show();
					$("#editform\\:popHost,#editform\\:popPort").parents('tr')
							.hide();
				}
			});
	/* 邮箱地址文本框失去焦点事件，自动填充smtp主机、端口及pop3或imap主机、端口等 */
	$("#editform\\:mailAddress").blur(
			function() {
				var address = $("#editform\\:mailAddress").val();
				if (address != '') {
					address = address.trim();
					var type = $("#editform\\:mailType_input").val();
					var s = address.substring(address.indexOf('@') + 1,
							address.length + 1).trim();
					$("#editform\\:smtpHost").val('smtp.' + s);
					if (type == 'pop3') {
						$("#editform\\:popHost").val('pop.' + s);
						$("#editform\\:popPort").val('110');
						$("#editform\\:smtpPort").val('25');
					} else {
						$("#editform\\:imapPort").val('143');
						$("#editform\\:smtpPort").val('25');
						$("#editform\\:imapHost").val('imap.' + s);
					}
				}
			});
});
/* 保存按钮点击事件 */
function save() {
	var type = $("#editform\\:mailType_input").val();
	if (type == 'pop3') {
		$("#editform\\:mailHost").val($("#editform\\:popHost").val());
		$("#editform\\:mailPort").val($("#editform\\:popPort").val());
		$("#editform\\:imapHost,#editform\\:imapPort").val('');
	} else {
		$("#editform\\:mailHost").val($("#editform\\:imapHost").val());
		$("#editform\\:mailPort").val($("#editform\\:imapPort").val());
		$("#editform\\:popHost,#editform\\:popPort").val('');
	}
}