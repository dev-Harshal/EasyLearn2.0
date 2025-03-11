from django.urls import path
from Courses.views import *

urlpatterns = [
    path('create/course/', create_course_view, name='create-course-view'),
    path('update/course/<int:id>/', update_course_view, name='update-course-view'),
    path('detail/course/<int:id>/', detail_course_view, name='detail-course-view'),
    path('delete/course/<int:id>/', delete_course_view, name='delete-course-view'),
    path('list/courses/', list_courses_view, name='list-courses-view'),
    path('save/curriculum/<int:id>/', save_curriculum_view, name='save-curriculum-view'),
]
