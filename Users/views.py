from django.shortcuts import render, redirect
from django.http import HttpResponseBadRequest, JsonResponse
from django.contrib import messages
from django.contrib.auth import login, logout
from Users.models import *
from Users.services import *
# Create your views here.

def index_view(request):
    return render(request, 'users/index.html')

def register_view(request):
    if request.method == 'POST':
        try:
            first_name = request.POST.get('first_name')
            last_name = request.POST.get('last_name')
            institute = request.POST.get('institute')
            email = request.POST.get('email')
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')

            if password != confirm_password:
                return JsonResponse({'status':'error', 'message':'Passwords does not match.'})
            if User.objects.filter(email=email.lower()).exists():
                return JsonResponse({'status':'error', 'message':'Email address already exists.'})

            user = User.objects.create_user(
                first_name=first_name,
                last_name=last_name,
                institute=institute,
                email=email,
                password=confirm_password,
                role='student'
            )
            messages.success(request, f'{user.first_name} {user.last_name[0]} registered successfully.')
            return JsonResponse({'status':'success', 'success_url':f'/{user.role}/login/'})
        except Exception as e:
            return JsonResponse({'status':'error', 'message':f'{e}'})
    return render(request, 'users/register.html')

def login_view(request, role):
    if request.method == 'POST':
        response = authenticate_and_generate_otp(request, role)
        return JsonResponse(response)
    return render(request, 'users/login.html', context={'role':role})

def verify_otp_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        otp_code = request.POST.get('otp_code')
        otp_expiry = request.session.get('otp_expiry', 0)

        if timezone.now().timestamp() > otp_expiry:
            return JsonResponse({'status':'error', 'message':'OTP code expired!Try again.'})
        if str(otp_code) == request.session.get('otp_code'):
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'{user.first_name} {user.last_name[0]} logged in successfully.')
                success_url = '/' if user.role == 'student' else f'/{user.role}/'
                return JsonResponse({'status':'success', 'success_url':success_url})
        return JsonResponse({'status':'error', 'message':'OTP code invalid!Try again.'})

def logout_view(request): 
    username = f'{request.user.first_name} {request.user.last_name[0]}'
    logout(request)
    messages.success(request, f'{username} logged out successfully.')
    return redirect('index-view')


# ADMIN PANEL

def admin_index_view(request):
    return render(request, 'users/staff/admin/index.html')

def admin_create_teacher_view(request):
    if request.method == 'POST':
        profile_photo = request.FILES.get('profile_photo', '')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        phone_number = request.POST.get('phone_number')
        designation = request.POST.get('designation')
        department = request.POST.get('department')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        if password != confirm_password:
            return JsonResponse({'status':'error', 'message':'Passwords does not match.Try again.'})
        if User.objects.filter(email=email).exists():
            return JsonResponse({'status':'error', 'message':'Email address already exists.'})
        if Profile.objects.filter(phone_number=phone_number).exists():
            return JsonResponse({'status':'error', 'message':'Phone Number already exists.'})

        user = User.objects.create_user(profile_photo=profile_photo, first_name=first_name, last_name=last_name,
                                            email=email, password=password, role='teacher')
        Profile.objects.create(user=user, phone_number=phone_number, department=department, designation=designation)

        messages.success(request, f'{user.first_name} {user.last_name} created successfully.')
        return JsonResponse({'status':'success', 'success_url':f'/admin/update/teacher/{user.id}/'})
    return render(request, 'users/staff/admin/create_teacher.html')

def admin_update_teacher_view(request, id):
    user = User.objects.get(id=id)
    print(request.META.get('HTTP_REFERER', ''))
    if request.method == 'POST':
        profile_photo = request.FILES.get('profile_photo', '')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')
        designation = request.POST.get('designation')
        department = request.POST.get('department')
     
        if User.objects.filter(email=email.lower()).exists():
            if email != user.email:
                return JsonResponse({'status':'error', 'message':'Email address already exists.'})
        if Profile.objects.filter(phone_number=phone_number).exists():
            if phone_number != user.profile.phone_number:
                return JsonResponse({'status':'error', 'message':'Phone Number already exists.'})

        profile = Profile.objects.get(user=user)
        user.first_name = first_name if first_name != '' else user.first_name
        user.last_name = last_name if last_name != '' else user.last_name
        user.email = email if email != '' else user.email
        user.profile_photo = profile_photo if profile_photo != '' else user.profile_photo
        profile.phone_number = phone_number if phone_number != '' else profile.phone_number
        profile.designation = designation if designation != '' else profile.designation
        profile.department = department if department != '' else profile.department
        user.save()
        profile.save()
        messages.success(request, f'{user.first_name} {user.last_name[0]} profile updated successfully.')
        return JsonResponse({'status':'success', 'success_url':f'/admin/update/teacher/{user.id}/'})
    return render(request, 'users/staff/admin/update_teacher.html', context={'user':user})

def admin_list_user_view(request, role):
    users = User.objects.filter(role=role)
    return render(request, 'users/staff/admin/list_user.html', context={'role':role, 'users':users})

def delete_user_view(request, id):
    user = User.objects.get(id=id)
    username = f'{user.first_name} {user.last_name[0]}'
    user.delete()
    messages.success(request, f'{username} deleted successfully.')
    return redirect(request.META.get('HTTP_REFERER', f'/{request.user.role}/'))

def staff_profile_view(request, role):
    if request.method == 'POST':
        id = request.POST.get('id')
        profile_photo = request.FILES.get('profile_photo', '')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')

        if User.objects.filter(email=email).exists():
            if email != request.user.email:
                return JsonResponse({'status':'error', 'message':'Email address already exists.'})
        if Profile.objects.filter(phone_number=phone_number).exists():
            if phone_number != request.user.profile.phone_number:
                return JsonResponse({'status':'error', 'message':'Phone Number already exists.'})

        user = User.objects.get(id=id)
        profile = Profile.objects.get(user=user)
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.profile_photo = profile_photo if profile_photo != '' else user.profile_photo
        profile.phone_number = phone_number
        user.save()
        profile.save()
        messages.success(request, f'{user.first_name} {user.last_name[0]} profile saved successfully.')
        return JsonResponse({'status':'success', 'success_url':f'/{user.role}/profile/'})
    return render(request, 'users/staff/staff_profile.html',context={'role':role})

def change_password_view(request):
    if request.method == 'POST':
        current_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        email = request.user.email

        user = authenticate(email=email, password=current_password)
        if user is not None:
            if new_password != confirm_password:
                return JsonResponse({'status':'error', 'message':'Passwords does not match.'})
            user.set_password(new_password)
            user.save()
            login(request,user)
            messages.success(request, 'Password updated successfully.')
            return JsonResponse({'status':'success', 'success_url':f'/{user.role}/profile/'})
        else:
            return JsonResponse({'status':'error', 'message':'Current Password does not match.'})
    else:
        return HttpResponseBadRequest("BAD REQUEST(400):GET NOT ALLOWED")
    
def teacher_index_view(request):
    return render(request, 'users/staff/teacher/index.html')

def teacher_list_student_view(request):
    users = User.objects.filter(role='student')
    return render(request, 'users/staff/teacher/list_student.html', context={'users':users})