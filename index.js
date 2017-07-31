const form = document.getElementById('myForm');
/**
 * @name getRandomResponse
 * @description возвращает случайный элемент из массива ответов
 * @returns {string}
 */
const getRandomResponse = () => {
    const responses = ['error.json', 'progress.json', 'success.json'];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    return responses[getRandomInt(0, responses.length - 1)]
};

const MyForm = {
    /**
     * @name validate
     * @description возвращает объект с признаком результата валидации (isValid)
     * и массивом названий полей, которые не прошли валидацию (errorFields)
     * @returns {{isValid: boolean, errorFields: Array}}
     */
    validate() {
        const inputs = this.getData(true);
        const errorFields = [];
        const checkValidation = input => {
            const validity = input.validity;
            const value = input.value;
            if (value === '') {
                errorFields.push({
                    'field': input.name,
                    'msg': 'Пустое поле.'
                });
            } else if (validity.patternMismatch) {
                errorFields.push({
                    'field': input.name,
                    'msg': input.validationMessage
                });
            }
            if (input.name === 'phone' && value.match(/[0-9]/g)) {
                const getAmountByPhone = value.match(/[0-9]/g).reduce((a, b) => +a + +b);
                if (getAmountByPhone > 30) {
                    errorFields.push({
                        'field': input.name,
                        'msg': 'Проверьте правильность заполнения поля.'
                    });
                }
            }
        };
        if (Object.keys(inputs).length !== 0) {
            for (const item in inputs) {
                const input = inputs[item];
                checkValidation(input);
            }
        }
        return {
            isValid: !errorFields.length,
            errorFields
        }
    },
    /**
     * @name getData
     * @description возвращает объект с данными формы,
     * где имена свойств совпадают с именами инпутов.
     * @param isValidate при использовании параметра, возвращается полня информация
     * @returns {{}}
     */
    getData(isValidate) {
        const form = document.forms.myForm;
        const reference = form.elements;
        const data = {};
        for (const node of reference) {
            if (!node.disabled && node.name) {
                if (isValidate) {
                    data[node.name] = node;
                } else {
                    data[node.name] = node.value;
                }
            }
        }
        return data;
    },
    /**
     * @name setData
     * @description принимает объект с данными формы и устанавливает их инпутам формы.
     * Поля кроме phone, fio, email игнорируются.
     * @param object
     * @returns undefined
     */
    setData(object) {
        const arrayObject = Object.entries(object);
        if (arrayObject.length) {
            arrayObject.forEach(item => {
                if (item[0] == 'fio' || item[0] =='email' || item[0] == 'phone') {
                    const field = document.querySelector(`.js-validate [name="${item[0]}"]`);
                    field.value = item[1]
                }
            })
        }
    },
    /**
     * @name submit
     * @description  выполняет валидацию полей и отправку ajax-запроса, если валидация пройдена.
     * @returns undefined
     */
    submit() {
        const errors = document.querySelectorAll('.js-validate .error'),
            submitButton = document.getElementById('submitButton'),
            resultContainer = document.getElementById('resultContainer');

        // Сброс всех полей  ошибками и сообщениями
        submitButton.disabled = true;
        resultContainer.className = '';
        resultContainer.textContent = '';
        if (errors.length) {
            errors.forEach(item => {
                item.classList.remove('error')
            });
            document.querySelectorAll('.js-validate .error-msg').forEach(item => {
                item.remove()
            })
        }

        const result = this.validate();
        if (!result.isValid) {
            result.errorFields.forEach(item => {
                const field = document.querySelector(`.js-validate [name="${item.field}"]`);
                field.classList.add('error');
                const error = document.createElement('div');
                error.className = "error-msg";
                error.innerHTML = item.msg;
                field.parentNode.insertBefore(error, null);
                submitButton.disabled = false;
            });
        } else {
            const request = new XMLHttpRequest();
            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    const data = JSON.parse(request.responseText);
                    if (data.status === 'success') {
                        resultContainer.className = 'success';
                        resultContainer.textContent = 'success';
                    } else if (data.status === 'error') {
                        resultContainer.className = 'error';
                        resultContainer.textContent = data.reason;
                    } else if (data.status === 'progress') {
                        resultContainer.className = 'progress';
                        setTimeout(() => {
                            request.open('GET', `responses/${getRandomResponse()}`);
                            request.send(null);
                            resultContainer.className = '';
                        }, data.timeout)
                    }
                } else {
                    alert(`${request.status}: ${request.statusText}`)
                }
            };
            request.open('GET', `responses/${getRandomResponse()}`);
            request.send(null)
        }
    }
};
form.addEventListener('submit', e => {
    e.preventDefault();
    MyForm.submit();
});