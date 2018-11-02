

var app = angular.module('myApp',['ngDraggable']);
app.controller('myCtrl', function($scope) {
    scope = $scope;
    $scope.styles={
        font_size: 13,
        fixed_name_width: 70,
        fixed_item_width: 70
    }
    $scope.fieldsConfig = {
        title:"",
        subTitle:"",
        styles:{
            font_size: $scope.styles.font_size,
            fixed_name_width: $scope.styles.fixed_name_width,
            fixed_item_width: $scope.styles.fixed_item_width,
        },
        listInfo:[],
        fields:[]
    }
    $scope.editingField = {};
    // 状态管理
    $scope.status = {
        // 是否编辑模式
        isEditingMode: 0,
        // 1==type1  2==type2
        activeFieldType: 1,
        // 是否启用模板
        isEnableTemplate: 0
    };
    $scope.sort={
        activeSortNum: 0,
        getNewSortNum: function(){
           var currentNum = $scope.sort.activeSortNum;
           $scope.sort.activeSortNum++;
           return currentNum;
        },
        dropSuccess: function(targetObj,dragObj,event){
            var targetObjSort = targetObj.sort;
            var dragObjSort = dragObj.sort;
            targetObj.sort = dragObjSort;
            dragObj.sort = targetObjSort;
            $scope.$apply();
            spop({
                template: "排序已更新!",
                style: "success",
                autoclose: 2000
            });
        },
        // 导入模板后 根据已有字段取得新增字段时的排序数字
        getCurrentSortNum: function(){
            if(!$scope.fieldsConfig.fields.length) return 0;
            var currentMaxNum = _.max($scope.fieldsConfig.fields, function(field,index){ return field.sort }).sort;
            $scope.sort.activeSortNum = currentMaxNum+1;
        }
    }


    // 生成固定患者信息
    $scope.generateDefaultListInfo = function(){
        var defaultListInfoLength = 10;
        for(var i = 0 ; i < defaultListInfoLength;i++){
            $scope.fieldsConfig.listInfo.push({
                id:getID(),
                sort: i,
                name:"",
                value:""
            })
        }
    }
    $scope.generateDefaultListInfo();

    // 列表tab面板
    $scope.listGroup = {
        activeItemName:"基础设置",
        items:["基础设置","样式设置","患者信息设置","字段内容设置","导出"],
        getItemClass: function(xName){
            return $scope.listGroup.activeItemName == xName ? "list-group-item active" :"list-group-item";
        },
        clickChangeItem: function(xName){
            $scope.listGroup.activeItemName = xName;
            if( xName == "导出"){
                $scope.export.clickExportContents();
                $scope.exportFill.clickExportContents();
            }
        }
    }

    // 字段内容设置
    $scope.fieldItem = {
         // 初始化字段类型一 对象
        initType1Field: function(){
            var initField = {
                id: getID(),
                sort: $scope.sort.getNewSortNum(),
                name:"",
                lineNum:""
            };
            angular.copy(initField,$scope.editingField);
        },
        // 初始化字段类型二
        initType2Field: function(){
            var initField = {
                id: getID(),
                sort: $scope.sort.getNewSortNum(),
                name:"",
                isCheckbox:1,
                content:[
                    {detail:"",}
                ]
            };
            angular.copy(initField,$scope.editingField);
        },
        clickOpenItemModal: function(xFieldType){
            $scope.status.isEditingMode = 0;
            $scope.status.activeFieldType = 1;
            $("#itemModal").modal("show");
            angular.copy({},$scope.editingField);
        },
        clickSelectItemType: function(xFieldType){
            $scope.status.activeFieldType = xFieldType;
        },
        clickSaveItemType: function(){
            $scope.status.isEditingMode = 1;
             if($scope.status.activeFieldType == 1){
                $scope.fieldItem.initType1Field();
            }else if($scope.status.activeFieldType == 2){
                $scope.fieldItem.initType2Field();
            }
        },
        clickAddNewContent: function(){
            $scope.editingField.content.push({detail:""});
            setTimeout(function(){
                $("#detail_" + ($scope.editingField.content.length)).eq(0).focus();
            },0)
            
        },
        clickSaveField: function(){
            $scope.fieldsConfig.fields.push(angular.copy($scope.editingField));
            $("#itemModal").modal("hide");
            $scope.status.activeFieldType = 1;
            spop({
                template: "保存成功!",
                style: "success",
                autoclose: 2000
            });
        },
        clickDeleteField: function(xField){
            $scope.fieldsConfig.fields = _.filter($scope.fieldsConfig.fields,function(item,index){
                return item.id != xField.id
            });
            spop({
                template: "删除成功!",
                style: "success",
                autoclose: 2000
            });
        },
        clickDeleteFieldContent: function(xField){
            $scope.editingField.content = _.filter($scope.editingField.content,function(item,index){
                return item.detail != xField.detail
            });
            spop({
                template: "删除成功!",
                style: "success",
                autoclose: 2000
            });
        },
        // return string "checkbox"/"radio"
        getBoxClass: function(xField){
            return xField.isCheckbox ? "checkbox" : "radio";
        }
    }

    // 样式相关函数
    $scope.stylesFunc = {};
    // 获取字段项目内容 样式
    $scope.stylesFunc.getFieldItemStyle = function(xFieldContent){
        if(xFieldContent.detail.indexOf("#input#") >= 0 ) return {"margin-right":"30px","width":"auto"};
    }

    // get html 相关函数
    $scope.htmlFunc = {};
    $scope.htmlFunc.getUnderlineHTML = function(xNum){
        var html = "";
        for(var i = 0 ; i < xNum;i++){
            html += '<span class="underline"></span>';
        }
        return html;
    }
    $scope.htmlFunc.getFieldContentHTML = function(xDetail){
        return xDetail.replace(/#input#/g,'<span class="underline" style="width: 50px;"></span>');
    }
    $scope.htmlFunc.getFieldContentFillHTML = function(xDetail){
        return xDetail.replace(/#input#/g,'<input class="form-control inline_block margin_left4 margin_right4 w200" type="text">');
    }

    // 选择模板
    $scope.template = {
         activeTemplateName: "",
         templateArrs:[]
    };
    // 点击打开模板弹窗
    $scope.template.clickOpenTemplateModal = function(){
        $scope.template.activeTemplateName = "";
        $("#saveTemplateModal").modal("show");
    }

    // 点击另存为模板
    $scope.template.clickSaveTemplate = function(){
        // 存储 判断是否超过固定长度/是否重名
        // 判断 超过最大模板数
        if($scope.template.templateArrs.length >= 4){spop({template: "最多存储4个模板!",style: "error"});return;}
            // 判断 模板名称是否重复
        var isNameUsed = _.find($scope.template.templateArrs,function(item,index){
            return item.templateName == $scope.template.activeTemplateName
        })
        if(isNameUsed) { spop({template: "模板名称重复!",style: "error"});return; }
        
        $scope.fieldsConfig.templateName = $scope.template.activeTemplateName;
        $scope.fieldsConfig.id = getID();
        $scope.template.templateArrs.push($scope.fieldsConfig);

        window.localStorage.templateArrs = JSON.stringify($scope.template.templateArrs);
        spop({template: "保存成功!",style: "success",autoclose: 1500});
        $("#saveTemplateModal").modal("hide");
    }
    // 点击 保存模板 覆盖当前模板
    $scope.template.clickSaveAsTemplate = function(){
        // $scope.template.activeTemplateName
        // $scope.template.templateArrs
        var activeTemplateObj = _.find($scope.template.templateArrs,function(item,index){
            return item.templateName == $scope.template.activeTemplateName
        })
        if(activeTemplateObj){ angular.copy($scope.fieldsConfig,activeTemplateObj) }
        window.localStorage.templateArrs = JSON.stringify($scope.template.templateArrs);
         spop({template: "保存成功!",style: "success",autoclose: 1500});
    }

    // 点击删除模板
    $scope.template.deleteTemplate = function(xTemp){
        $scope.template.templateArrs = _.filter($scope.template.templateArrs,function(item,index){
            return item.id != xTemp.id;
        })
        var storage = window.localStorage;
        storage.templateArrs = JSON.stringify($scope.template.templateArrs);
        spop({
            template: "删除成功!",
            style: "success",
            autoclose: 1500
        });
    }

    // 点击启用模板
    $scope.template.clickEnableTemplate=function(xTemp){
        if(xTemp){
            // 找到即将启用的模板字段内容
            var activedTemp = _.find($scope.template.templateArrs,function(item,index){
                return item.id == xTemp.id
            })
            // 记录名字 判断是否启用模板
            $scope.template.activeTemplateName = activedTemp.templateName;

            angular.copy(activedTemp,$scope.fieldsConfig);

            $scope.status.isEnableTemplate = 1;
            spop({
                template: '"'+$scope.template.activeTemplateName+'" 已启用!',
                style: "success",
                autoclose: 1500
            });
            // 重置 排序号
            $scope.sort.getCurrentSortNum();
        }
        $("#templateViewModal").modal("hide");
    }

    // 取得已存储在本地的模板
    $scope.template.getTemplateArrs = function(){
        var storage = window.localStorage;
        if(storage.templateArrs){
            $scope.template.templateArrs = JSON.parse(storage.templateArrs);
        }else{
            $scope.template.templateArrs = [];
        }
    }
    $scope.$watch('$viewContentLoaded', function() { 
        $scope.template.getTemplateArrs(); 
        // 如果有已存储的模板 则打开选择模板弹窗 进行选择
        if($scope.template.templateArrs.length){
            $("#templateViewModal").modal("show");
        }
    });


    // 导出 打印
    $scope.export = {
        contents: ""
    }
    $scope.export.getStylesContent = function(){
        if($scope.fieldsConfig.styles.fixed_name_width == 70 && 
           $scope.fieldsConfig.styles.fixed_item_width == 70 && 
           $scope.fieldsConfig.styles.font_size == 13){
               return;
        }
        $scope.export.contents += '<style>\r\n';
        $scope.export.contents += 'body * { font-size: '+$scope.fieldsConfig.styles.font_size+'px;}\r\n';
        $scope.export.contents += '.fixed_name_width { width: '+$scope.fieldsConfig.styles.fixed_name_width+'px;}\r\n';
        $scope.export.contents += '.fixed_item_width { width: '+$scope.fieldsConfig.styles.fixed_item_width+'px;}\r\n';
        $scope.export.contents += '</style>\r\n';
    }
    $scope.export.getTitleContent = function(){
        if(!$scope.fieldsConfig.title) return;
        $scope.export.contents += '<div class="title">'+ $scope.fieldsConfig.title +'</div>\r\n';
    }
    $scope.export.getSubTitleContent = function(){
        if(!$scope.fieldsConfig.subTitle) return;
        $scope.export.contents += '<div class="sub_title">'+ $scope.fieldsConfig.subTitle +'</div>\r\n';
    }
    $scope.export.getListInfoContent = function(){
        var validListInfo = _.filter($scope.fieldsConfig.listInfo,function(item,index){return item.name});
        if(!validListInfo.length) return;
        $scope.export.contents += '<ul class="list_info">\r\n';
        _.each(validListInfo, function(item,index){
            $scope.export.contents += '<li>';
            $scope.export.contents += item.name;
            $scope.export.contents += '<span class="underline w100">';
            $scope.export.contents += item.value;
            $scope.export.contents += '</span>';
            $scope.export.contents += '</li>\r\n';
        });
        $scope.export.contents += '</ul>';    
    }
    $scope.export.getField1Content = function(xField){
        for(var i = 0 ; i < xField.lineNum;i++){
            var notFirstLineClass = i > 0 ? "visibility_hidden" : "";
            $scope.export.contents += '<div class="line">\r\n';
            $scope.export.contents += '<span class="field_name fixed_name_width '+ notFirstLineClass +'">' + xField.name + '</span>\r\n';
            $scope.export.contents += '<span class="underline la w100"></span>\r\n';
            $scope.export.contents += '</div>\r\n';   
        }
    }
    $scope.export.getField2Content = function(xField){
        $scope.export.contents += '<div class="line">\r\n';
        $scope.export.contents += '<span class="field_name fixed_name_width">'+ xField.name+ '</span>\r\n';

        var labelClassPrefix = xField.isCheckbox ? "checkbox" : "radio";
        _.each(xField.content,function(contentField,contentindex){
            var widthClass = contentField.detail.indexOf("#input#") >= 0 ? "auto" : "";
            $scope.export.contents += '<label class="field_item fixed_item_width ' + labelClassPrefix + '-inline '+widthClass+'">\r\n';
            $scope.export.contents += '<input type="' + labelClassPrefix + '">' + $scope.htmlFunc.getFieldContentHTML(contentField.detail);
            $scope.export.contents += '</label>\r\n';
        })
        $scope.export.contents += '</div>\r\n';
    }
    $scope.export.getFieldsContent = function(){
        if(!$scope.fieldsConfig.fields.length) return;
        var sortFields = _.sortBy($scope.fieldsConfig.fields,"sort");
        _.each(sortFields,function(field,index){
            // 类型一
            if(field.lineNum){
                $scope.export.getField1Content(field);
            }else{
                $scope.export.getField2Content(field);
            }
        })

    }
    $scope.export.clickExportContents = function(){
        $scope.export.contents = "";
        $scope.export.getStylesContent();
        $scope.export.getTitleContent();
        $scope.export.getSubTitleContent();
        $scope.export.getListInfoContent();
        $scope.export.getFieldsContent();
        if(!$scope.export.contents){
           spop({
                template: "请先配置内容!",
                style: "error",
                autoclose: 2000
            }); 
        }
    } 

    // 导出 录入
    $scope.exportFill = {
        contents: ""
    }
    $scope.exportFill.getStylesContent = function(){
        if($scope.fieldsConfig.styles.fixed_name_width == 70 && 
           $scope.fieldsConfig.styles.fixed_item_width == 70 && 
           $scope.fieldsConfig.styles.font_size == 13){
               return;
        }
        $scope.exportFill.contents += '<style>\r\n';
        $scope.exportFill.contents += 'body * { font-size: '+$scope.fieldsConfig.styles.font_size+'px;}\r\n';
        $scope.exportFill.contents += '.edit_assessment_table .fixed_name_width { width: '+$scope.fieldsConfig.styles.fixed_name_width+'px;}\r\n';
        $scope.exportFill.contents += '.edit_assessment_table .fixed_item_width { width: '+$scope.fieldsConfig.styles.fixed_item_width+'px;}\r\n';
        $scope.exportFill.contents += '</style>\r\n';
    }
    $scope.exportFill.getTitleContent = function(){
        if(!$scope.fieldsConfig.title) return;
        $scope.exportFill.contents += '<div class="title">'+ $scope.fieldsConfig.title +'</div>\r\n';
    }
    $scope.exportFill.getSubTitleContent = function(){
        if(!$scope.fieldsConfig.subTitle) return;
        $scope.exportFill.contents += '<div class="sub_title">'+ $scope.fieldsConfig.subTitle +'</div>\r\n';
    }
    $scope.exportFill.getListInfoContent = function(){
        var validListInfo = _.filter($scope.fieldsConfig.listInfo,function(item,index){return item.name});
        if(!validListInfo.length) return;
        _.each(validListInfo, function(item,index){
            $scope.exportFill.contents += '<div class="input-group">';
            $scope.exportFill.contents += '<div class="input-group-addon">' + item.name + '</div>';
            $scope.exportFill.contents += '<input type="text" class="form-control" disabled value="'+ item.value +'">';
            $scope.exportFill.contents += '</div>\r\n';
        });
    }
    $scope.exportFill.getField1Content = function(xField){
        $scope.exportFill.contents += '<div class="line">\r\n';
        $scope.exportFill.contents += '<span class="field_name fixed_name_width v_top">' + xField.name + '</span>\r\n';
        $scope.exportFill.contents += '<textarea class="form-control inline_block" style="width: 300px;" rows="'+ xField.lineNum +'"></textarea>\r\n';
        $scope.exportFill.contents += '</div>\r\n';   
    }
    $scope.exportFill.getField2Content = function(xField){
        $scope.exportFill.contents += '<div class="line">\r\n';
        $scope.exportFill.contents += '<span class="field_name fixed_name_width">'+ xField.name+ '</span>\r\n';

        var labelClassPrefix = xField.isCheckbox ? "checkbox" : "radio";
        _.each(xField.content,function(contentField,contentindex){
            var widthClass = contentField.detail.indexOf("#input#") >= 0 ? "auto" : "";
            $scope.exportFill.contents += '<label class="field_item fixed_item_width ' + labelClassPrefix + '-inline '+widthClass+'">\r\n';
            $scope.exportFill.contents += '<input type="' + labelClassPrefix + '">' + $scope.htmlFunc.getFieldContentFillHTML(contentField.detail);
            $scope.exportFill.contents += '</label>\r\n';
        })
        $scope.exportFill.contents += '</div>\r\n';
    }
    $scope.exportFill.getFieldsContent = function(){
        if(!$scope.fieldsConfig.fields.length) return;
        var sortFields = _.sortBy($scope.fieldsConfig.fields,"sort");
        _.each(sortFields,function(field,index){
            // 类型一
            if(field.lineNum){
                $scope.exportFill.getField1Content(field);
            }else{
                $scope.exportFill.getField2Content(field);
            }
        })

    }
    $scope.exportFill.clickExportContents = function(){
        $scope.exportFill.contents = '<div class="edit_assessment_table">\r\n';
        $scope.exportFill.getStylesContent();
        $scope.exportFill.getTitleContent();
        $scope.exportFill.getSubTitleContent();
        $scope.exportFill.getListInfoContent();
        $scope.exportFill.getFieldsContent();
        $scope.exportFill.contents += '</div>';
        if(!$scope.export.contents){
           spop({
                template: "请先配置内容!",
                style: "error",
                autoclose: 2000
            }); 
        }
    } 
});

// 输出HTML
app.filter('htmlTrusted', function ($sce) {
    return function (html) {
      return $sce.trustAsHtml(html)
    }
});
// 自动聚焦
app.directive('setFocus', function(){
    return function(scope, element){
       element[0].focus();
    };
});
app.directive('initTooltip', function(){
    return function(scope, element){
        setTimeout(function(){
            $(element).tooltip();
        },0)
    };
});






// 生成唯一不重复ID
function getID(){
    return Number(Math.random().toString().substr(3,1) + Date.now()).toString(36);
}

$(function(){            
    // 自动聚焦
     $('#saveTemplateModal').on('shown.bs.modal', function (e) {
        $("#saveTemplateModal input").eq(0).focus();
    })
    // 复制代码到剪贴板
    var xClipboard = new ClipboardJS('#copy_btn');
    var xClipboardFill = new ClipboardJS('#copy_btn_fill');
    xClipboard.on('success', function(e) {
        spop({
            template: "复制成功!",
            style: "success",
            autoclose: 2000
        });
        e.clearSelection();
    });
    xClipboard.on('error', function(e) {
        spop({
            template: "复制失败,请重试!",
            style: "error",
            autoclose: 2000
        });
        e.clearSelection();
    });
    xClipboardFill.on('success', function(e) {
        spop({
            template: "复制成功!",
            style: "success",
            autoclose: 2000
        });
        e.clearSelection();
    });
    xClipboardFill.on('error', function(e) {
        spop({
            template: "复制失败,请重试!",
            style: "error",
            autoclose: 2000
        });
        e.clearSelection();
    });

    
})
    






