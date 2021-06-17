
function Validator (options) {

    var selectorRules = {};

    function getParent(element, selector) {
        while (element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // Hàm thực hiện validate
    function validate (inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        
        // Lặp qua từng rule và kiểm tra
        for(var i = 0; i < rules.length; i++) {
            switch (inputElement.type){
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            
            if(errorMessage) break; // Nếu có lỗi thì dừng việc kiểm tra
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);

    if(formElement){

        // Lặp qua mỗi rules và xử lý
        options.rules.forEach(function (rule){
        
            // Lưu lại các rules cho mỗi input 
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector);
            
            Array.from(inputElements).forEach(function (inputElement){
                if(inputElement) {
                    // Xử lý trường họp blur khỏi input
                    inputElement.onblur = function () {                    
                        validate(inputElement, rule);
                    }
    
                    // Xử lý mỗi khi người dùng nhập vào input
                    inputElement.oninput = function () {
                        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                }
            })
        })

        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true // khi không có lỗi

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });

            // Trường hợp submit với javascript
            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input){

                        switch(input.type) {
                            
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] = '';
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
            } 
            // // Trường hợp submit với hành vi mặc định
            // else{
            //     formElement.submit();
            // }
        }
        
    }   
      
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Hiển thị message lỗi
// 2. Khi hợp lệ => undefined

// Validate các trường bắt buộc nhập
Validator.isRequired = function (selector) {

    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này!';
        }
    }

}

// Validate email
Validator.isEmail = function (selector, message) {

    return {
        selector: selector,
        test: function (value) {

            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : message || 'Email không hợp lệ!';
            
        }
    }

}

// Validate độ dài tối thiểu của email
Validator.minLength = function (selector, min, message) {

    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Mật khẩu tối thiểu ${min} ký tự!`
        }
    }
}

Validator.isComfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}