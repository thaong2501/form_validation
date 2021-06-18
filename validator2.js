
// CÁCH 2

function Validator(formSelector) {

    var _this = this;

    function getFather (element, selector) {
        while (element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formRules = {};

    /**Quy ước tạo rules
     * - Nếu có lỗi => return error message
     * - Nếu không có lỗi => return undefined
     */

    var validatorRules = {
        required: function(value, message) {
            return value ? undefined : message || 'Vui lòng nhập trường này!';
        },
        email: function(value, message) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : message || 'Email không hợp lệ!';
        },
        min: function(min, message) {
            return function(value){
                return value.length >= min ? undefined : message || `Vui lòng nhập ít nhất ${min} ký tự!`;
            }
        }
    }
    // Lấy ra form element trong DOM theo 'formSelector'
    var formElement = document.querySelector(formSelector);

    // Chỉ xử lý khi có element trong DOM
    if(formElement){

        var inputs = formElement.querySelectorAll('[name][rules]');

        for(var input of inputs){

            var rules = input.getAttribute('rules').split('|');
            
            for(var rule of rules){

                var ruleInfo;
                var isRuleHasValue = rule.includes(':');
                
                if(isRuleHasValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if(isRuleHasValue){
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                }else{
                    formRules[input.name] = [ruleFunc];
                }
            }

            // Lắng nghe sự kiện để validate (blur, change...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
            
        }
        // Hàm thực hiện validate
        function handleValidate (event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for(var rule of rules){
                errorMessage = rule(event.target.value);
                if(errorMessage) break;
            }
            
            if(errorMessage){
                var formGroup = getFather(event.target, '.form-group');
                if(formGroup){
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage){
                        formMessage.innerHTML = errorMessage;
                    }
                }
            }
            return !errorMessage;
        }

        // Hàm clear message lỗi
        function handleClearError(event) {
            var formGroup = getFather(event.target, '.form-group');
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid');

                var formMessage = formGroup.querySelector('.form-message');
                if(formMessage){
                    formMessage.innerHTML = '';
                }
            }
        }
        
        // Xử lý hành vi submit formMessage
        formElement.onsubmit = function(event){
            event.preventDefault();

            var inputs = formElement.querySelectorAll('[name][rules]');
            var isValid = true;

            for(var input of inputs){
                if(!handleValidate({target: input})){
                    isValid = false;
                }
            }

            // Khi không có lỗi thì submit form
            if(isValid){

                if(typeof _this.onSubmit === 'function'){
                    _this.onSubmit();
                }else{
                    formElement.submit();
                }
            }
        }
    }
}