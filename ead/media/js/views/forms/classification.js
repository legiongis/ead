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
            WizardBase.prototype.initialize.apply(this);

            var self = this;
                  
            var currentEditedClassification = this.getBlankFormData();

           

            this.editClassification = function(branchlist){
                self.switchBranchForEdit(branchlist);
            }

            this.deleteClassification = function(branchlist){
                self.deleteClicked(branchlist);
            }

            ko.applyBindings(this, this.$el.find('#existing-classifications')[0]);

            this.addBranchList(new BranchList({
                data: currentEditedClassification,
                dataKey: 'PHASE_TYPE_ASSIGNMENT.E17'
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#resource-type-section')[0],
                data: currentEditedClassification,
                dataKey: 'HERITAGE_RESOURCE_TYPE.E55',
                singleEdit: true
            }));

            this.addBranchList(new BranchList({
                el: this.$el.find('#related-features-section')[0],
                data: currentEditedClassification,
                dataKey: 'ANCILLARY_FEATURE_TYPE.E55',
                validateBranch: function (nodes) {
                    return vt.nodesHaveValues(nodes,['HERITAGE_RESOURCE_TYPE.E55','CULTURAL_PERIOD.E55']);
                }
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#period-section')[0],
                data: currentEditedClassification,
                dataKey: 'CULTURAL_PERIOD.E55',
                singleEdit: true
            }));  
            this.addBranchList(new BranchList({
                el: this.$el.find('#dynasty-section')[0],
                data: currentEditedClassification,
                dataKey: 'DYNASTY.E55',
                singleEdit: true
            })); 			
            this.addBranchList(new BranchList({
                el: this.$el.find('#style-section')[0],
                data: currentEditedClassification,
                dataKey: 'STYLE.E55',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                }
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#ruler-section')[0],
                data: currentEditedClassification,
                dataKey: 'RULER.E55',
                singleEdit: true
            }));
           

        },

        startWorkflow: function() { 
            this.switchBranchForEdit(this.getBlankFormData());
        },

        switchBranchForEdit: function(classificationData){
            this.prepareData(classificationData);

            _.each(this.branchLists, function(branchlist){
                branchlist.data = classificationData;
                branchlist.undoAllEdits();
            }, this);

            this.toggleEditor();
        },

        prepareData: function(assessmentNode){
            _.each(assessmentNode, function(value, key, list){
                assessmentNode[key].domains = this.data.domains;
            }, this);
            return assessmentNode;
        },

        getBlankFormData: function(){
            return this.prepareData({
                'HERITAGE_RESOURCE_TYPE.E55': {
                    'branch_lists':[]
                },
                ##'HERITAGE_RESOURCE_USE_TYPE.E55': {
                ##    'branch_lists':[]
                ##},
                ##'ANCILLARY_FEATURE_TYPE.E55': {
                ##    'branch_lists':[]
               ## },
                'CULTURAL_PERIOD.E55': {
                    'branch_lists':[]
                },   
 
                'STYLE.E55': {
                    'branch_lists':[]
                },
                'PHASE_TYPE_ASSIGNMENT.E17': {
                    'branch_lists':[]
                },
                'DYNASTY.E55': {
                    'branch_lists':[]
                },
				'RULER.E55': {
                    'branch_lists':[]
                }
            })
        },

        deleteClicked: function(branchlist) {
            var warningtext = '';

            this.deleted_assessment = branchlist;
            this.confirm_delete_modal = this.$el.find('.confirm-delete-modal');
            this.confirm_delete_modal_yes = this.confirm_delete_modal.find('.confirm-delete-yes');
            this.confirm_delete_modal_yes.removeAttr('disabled');

            warningtext = this.confirm_delete_modal.find('.modal-body [name="warning-text"]').text();
            this.confirm_delete_modal.find('.modal-body [name="warning-text"]').text(warningtext + ' ' + branchlist['HERITAGE_RESOURCE_TYPE.E55'].branch_lists[0].nodes[0].label);           
            this.confirm_delete_modal.modal('show');
        }

    });
});

