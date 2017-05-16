define(['jquery', 'summernote', 'views/forms/base', 'views/forms/sections/branch-list', ], function ($, summernote, BaseForm, BranchList) {
    return BaseForm.extend({
        initialize: function() {
            BaseForm.prototype.initialize.apply(this);
            var resourcetypeid = $('#resourcetypeid').val();
            
            this.addBranchList(new BranchList({
                el: this.$el.find('#description-section')[0],
                data: this.data,
                dataKey: 'DESCRIPTION.E62',
                validateBranch: function(nodes){
                    return this.validateHasValues(nodes);
                }
            }));
            
            if (_.contains(['HERITAGE_RESOURCE.E18', 'HERITAGE_RESOURCE_GROUP.E27'], resourcetypeid)){
                this.addBranchList(new BranchList({
                    el: this.$el.find('#ar-description-section')[0],
                    data: this.data,
                    dataKey: 'ARABIC_DESCRIPTION.E62',
                    validateBranch: function(nodes){
                        return this.validateHasValues(nodes);
                    }
                }));
            }
        }
    });
});