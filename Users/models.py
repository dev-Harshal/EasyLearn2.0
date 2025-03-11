from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.core.validators import RegexValidator
# Create your models here.

ROLE_CHOICES = (('admin', 'Admin'), ('student', 'Student'), ('teacher', 'Teacher'))
DESIGNATION_CHOICES = (('Staff', 'Staff'), ('Professor', 'Professor'), ('Ast.Professor', 'Ast.Professor'))
DEPARTMENT_CHOICES = (('Admin', 'Admin'), ('Information Technology', 'Information Technology'), ('Computer Science', 'Computer Science'), ('Enginnering', 'Enginnering'))

def create_admin_profile(user):
    if user.role == 'admin':
        while True:
            phone_number = input('Phone Number: ')
            if phone_number.isdigit() and len(phone_number) == 10:
                if Profile.objects.filter(phone_number=phone_number).exists():
                    print('Phone Number already exists!')
                else:
                    print('Admin profile created successfully.')
                    break
            else:
                print('Phone Number must be 10 digits!')
        Profile.objects.create(
            user=user,
            phone_number=phone_number,
            designation='Staff',
            department = 'Admin'
        )

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using = self._db)
        create_admin_profile(user)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    id = models.BigAutoField(primary_key=True)
    profile_photo = models.ImageField(upload_to='photos/', null=True, blank=True) 
    first_name = models.CharField(max_length=100, null=False, blank=False)
    last_name = models.CharField(max_length=100, null=False, blank=False)
    institute = models.CharField(max_length=255, null=True, blank=True, default='SSVPS')
    email = models.EmailField(unique=True, null=False, blank=False)
    password = models.CharField(max_length=100, null=False, blank=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, null=False, blank=False)
    joined_date = models.DateField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    objects = UserManager()

    def save(self, *args, **kwargs):
        self.first_name = self.first_name.title()
        self.last_name = self.last_name.title()
        self.email = self.email.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'Users Table'

class Profile(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=10, unique=True, null=False, blank=False ,validators=[RegexValidator(regex=r'^\d{10}$')])
    designation = models.CharField(max_length=100, choices=DESIGNATION_CHOICES, null=False, blank=False)
    department = models.CharField(max_length=100, choices=DEPARTMENT_CHOICES, null=False, blank=False)

    def __str__(self):
        return f'{self.user.id}:{self.user.email}'
    
    class Meta:
        db_table = 'Profiles Table'
    


