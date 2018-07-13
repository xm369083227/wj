	var pathName=window.document.location.pathname;  
    //获取带"/"的项目名，如：/uimcardprj  
    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1); 
    $(document).ready(function() {
        $("treeNode a").click(function() {
        	 addTab($(this));
        });
    });
    function addTab(link) {
    	   var url = projectName+$(link).attr("name");
    	   var title = $(link).text();
    	   var id = $(link).attr("id");
    	   var tab ='<li class="ui-state-default ui-corner-top" role="tab" aria-expanded="false" >'+'<a href="#tabView:tab4">Godfather Part IIII</a></li>';
    	   var divtab = '<div id="tabView:tab4" class="ui-tabs-panel ui-widget-content ui-corner-bottom ui-helper-hidden"'  +
    		   'style="display: none;" role="tabpanel" aria-hidden="true" >'+
    		   '<iframe scrolling="auto" frameborder="0" style="width:100%;height:100%;" src="home.xhtml"></div>';
    	   $("#tabView").children("ul").first().append(tab);
    	   $("#tabView").children("div").first().append(divtab);
    	
    }
    
