from django.contrib.auth import authenticate
import random
from django.utils import timezone

def authenticate_and_generate_otp(request, role):
    email = request.POST.get('email')
    password = request.POST.get('password')
    
    user = authenticate(email=email.lower(), password=password)
    if user is not None and user.role == role:
        otp_code = str(random.randint(1000,9999))
        request.session['otp_code'] = otp_code
        request.session['otp_expiry'] = (timezone.now() + timezone.timedelta(seconds= 30)).timestamp()
        print('OTP CODE: ',otp_code) #Replace with send Email.
        return {'status':'success', 'message':'OTP code send successfully to email.'}
    else:
        return {'status':'error', 'message':'Invalid email address or password.'}