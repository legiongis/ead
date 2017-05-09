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

            this.addBranchList(new BranchList({
                el: this.$el.find('#classification-section')[0],
                data: this.data,
                dataKey: 'PHASE_TYPE_ASSIGNMENT.E17',
                validateBranch: function (nodes) {
                    return vt.nodesHaveValues(nodes,['HERITAGE_RESOURCE_TYPE.E55','CULTURAL_PERIOD.E55']);
                }
            }));
        }
    });
});