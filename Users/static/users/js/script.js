const firstName = document.getElementById('firstName')
if (firstName) {
    firstName.addEventListener('keypress', function(e) {
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();  
        }
    });
}

const lastName = document.getElementById('lastName')
if (lastName) {
    lastName.addEventListener('keypress', function (e) {
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
        }
    });
}

function popAlert(data) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';

    let status;
    let alert = document.createElement('div');
    alert.id = 'alert';
    status = (data.status === 'error') ? 'danger' : 'success'
    alert.className = `alert alert-${status}`
    alert.role = 'alert'
    alert.innerHTML = `${data.message}`
    alertContainer.appendChild(alert)
    setTimeout(() => {
        alert.style.display = 'none'
    },3000)
}

alertBox = document.getElementById('alert')
if (alertBox) {
    setTimeout(function() {
        alertBox.style.display = 'none';
    }, 5000);
}

const resendButton = document.getElementById('resendBtn');
if (resendButton){
    resendButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (!resendButton.disabled) {
            login();
        }
    });
}

function startTimer() {
    let countdown;
    let countdownTime = 30;
    let timerElement = document.getElementById('resendTimer');
    timerElement.textContent = countdownTime;
    resendButton.disabled = true;
    countdown = setInterval(() => {
        countdownTime--;
        timerElement.textContent = countdownTime;
        if (countdownTime <= 0) {
            clearInterval(countdown);
            resendButton.disabled = false;
        }
    }, 1000);  
}

function showOtpSection(data) {
    const verifyBtn = document.getElementById('verifyBtn')
    const loginBtn = document.getElementById('loginBtn')

    document.getElementById('otpSection').classList.remove('d-none')
    document.getElementById('email').disabled = true
    document.getElementById('password').disabled = true
    document.getElementById('otpCode').disabled = false
    verifyBtn.classList.remove('d-none')
    verifyBtn.disabled = false
    loginBtn.disabled = true
    loginBtn.classList.add('d-none')
    startTimer();
    popAlert(data);
}

function login() {
    const formData = new FormData();
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const role = document.querySelector('input[name="role"]').value;

    formData.append('email', email);
    formData.append('password', password);
    
    fetch(`/${role}/login/`, {
        method : 'POST',
        headers : {
            'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
        },
        body : formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showOtpSection(data);
        }
        else {
            popAlert(data);
        }
    })
}

function verifyOtp() {
    const formData = new FormData();
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const otp_code = document.querySelector('input[name="otp_code"]').value;
    formData.append('email', email);
    formData.append('password', password);
    formData.append('otp_code', otp_code);

    fetch('/verify-otp/',{
        method:'POST',
        headers:{
            'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
        },
        body: formData 
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success'){
            window.location.href = data.success_url
        }
        else{
            popAlert(data)
        }
    })
    .catch(error => {
        popAlert({'status':'error', 'message':error})
    })

}

const registerForm = document.getElementById('registerForm')
if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        fetch('/register/', {
            method : 'POST',
            headers : {
                'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body : new FormData(registerForm)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.success_url
            }
            else {
                popAlert(data);
            }
        })
        .catch(error => {
            popAlert({'status':'error', 'message':error})
        })
    })
}

const loginForm = document.getElementById('loginForm')
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        (event.submitter.id == 'loginBtn') ? login() : verifyOtp()
    })
}

const createTeacherForm = document.getElementById('createTeacherForm')
if (createTeacherForm) {
    createTeacherForm.addEventListener('submit', function(event) {
        event.preventDefault();

        fetch('/admin/create/teacher/',{
            method : 'POST',
            headers : {
                'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body : new FormData(createTeacherForm)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === 'success'){
                window.location.href = data.success_url
            }
            else{
                window.scrollTo({ top: 0, behavior: 'smooth' });
                popAlert(data)
            }
        })
        
    })
}

const updateTeacherForm = document.getElementById('updateTeacherForm')
if (updateTeacherForm) {
    updateTeacherForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('id').value
        url = `/admin/update/teacher/${id}/`
        fetch(url,{
            method : 'POST',
            headers : {
                'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body : new FormData(updateTeacherForm)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === 'success'){
                window.location.href = data.success_url
            }
            else{
                window.scrollTo({ top: 0, behavior: 'smooth' });
                popAlert(data)
            }
        })
        
    })
}

const staffProfileForm = document.getElementById('staffProfileForm')
if (staffProfileForm) {
    staffProfileForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const role = document.getElementById('role').value
        url = `/${role}/profile/`
        fetch(url, {
            method : 'POST',
            headers : {
                'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body : new FormData(staffProfileForm)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.success_url
            }
            else {
                popAlert(data)
            }
        })
    })
}

const changePasswordForm = document.getElementById('changePasswordForm')
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        fetch('/change-password/', {
            method : 'POST',
            headers : {
                'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body : new FormData(changePasswordForm)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.success_url
            }
            else {
                popAlert(data)
            }
        })
    })
}
