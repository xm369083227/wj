$(function() {
	/* ��������������ʾ�����ʼ����������������˿� */
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
	/* ��������ѡ��ı��¼�����ʾ����pop3��imap�������˿� */
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
	/* �����ַ�ı���ʧȥ�����¼����Զ����smtp�������˿ڼ�pop3��imap�������˿ڵ� */
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
/* ���水ť����¼� */
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