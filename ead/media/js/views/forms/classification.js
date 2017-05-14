define(['jquery', 
    'underscore', 
    'summernote', 
    'views/forms/base',
    'views/forms/sections/validation',
    'views/forms/sections/branch-list',
    'bootstrap-datetimepicker'], function ($, _, summernote, BaseForm, ValidationTools, BranchList) {
    
    var vt = new ValidationTools;
    
    return BaseForm.extend({
        
        initialize: function() {
            BaseForm.prototype.initialize.apply(this);
            
            var resourcetypeid = $('#resourcetypeid').val();

            this.addBranchList(new BranchList({
                el: this.$el.find('#classification-section')[0],
                data: this.data,
                dataKey: 'PHASE_TYPE_ASSIGNMENT.E17',
                validateBranch: function (nodes) {
                    if (resourcetypeid == "HERITAGE_RESOURCE.E18"){
                        var ck1 = vt.nodesHaveValues(nodes,['HERITAGE_RESOURCE_TYPE.E55','CULTURAL_PERIOD.E55']);
                    }
                    if (resourcetypeid == "HERITAGE_RESOURCE_GROUP.E27"){
                        var ck1 = vt.nodesHaveValues(nodes,['HERITAGE_RESOURCE_GROUP_TYPE.E55','CULTURAL_PERIOD.E55']);
                    }
                    var ck2 = vt.dependantNodePair(nodes,'RULER.E55','DYNASTY.E55');
                    return ck1 && ck2
                }
                
            }));
        }
    });
});