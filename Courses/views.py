from django.shortcuts import get_object_or_404, render, redirect
from django.http import JsonResponse
from django.contrib import messages
from Courses.models import *
# Create your views here.

def create_course_view(request):
    if request.method == 'POST':
        thumbnail = request.FILES.get('thumbnail', '')
        title = request.POST.get('title')
        description = request.POST.get('description')
        category = request.POST.get('category')

        if Course.objects.filter(title=title).exists():
            return JsonResponse({'status':'error', 'message':'Same course title already exists.'})
        course = Course.objects.create(created_by=request.user, thumbnail=thumbnail,  title=title, description=description, category=category)
        messages.success(request, f'Course {course.title} created successfully.')
        return JsonResponse({'status':'success', 'success_url':f'/teacher/detail/course/{course.id}/'})
    return render(request, 'courses/create_course.html')

def detail_course_view(request, id):
    course = Course.objects.get(id=id)
    return render(request, 'courses/detail_course.html', context={'course':course})

def update_course_view(request, id):
    course = Course.objects.get(id=id)

    if request.method == 'POST':
        thumbnail = request.FILES.get('thumbnail', '')
        category = request.POST.get('category')
        title = request.POST.get('title')
        description = request.POST.get('description')

        courses = Course.objects.filter(title=title)
        if courses.exists():
            if course != courses[0]:
                return JsonResponse({'status':'error', 'message':'Same course title already exists.'})

        course.thumbnail = thumbnail if thumbnail != '' else course.thumbnail
        course.category = category
        course.title = title
        course.description = description
        course.save()
        messages.success(request, f'Course Information updated successfully.')
        return JsonResponse({'status':'success', 'success_url':f'/teacher/update/course/{course.id}/'})
    return render(request, 'courses/update_course.html', context={'course':course})

def list_courses_view(request):
    courses = request.user.courses.all()
    return render(request, 'courses/list_courses.html', context={'courses':courses})

def delete_course_view(request, id):
    course = Course.objects.get(id=id)
    course.delete()
    messages.success(request, f'Course {course.title} deleted successfully.')
    return redirect('list-courses-view')

def save_curriculum_view(request, id):
    if request.method == 'POST':
        try:
            # Get the course
            course = get_object_or_404(Course, id=id)

            # Create or get the curriculum for the course
            curriculum, created = Curriculum.objects.get_or_create(course=course)

            # Clear previous sections and items if necessary (optional, based on your need)
            curriculum.sections.all().delete()

            # Iterate over sections and save them
            section_titles = request.POST.getlist('section_title[]')
            section_orders = request.POST.getlist('section_order[]')

            for section_idx, (section_title, section_order) in enumerate(zip(section_titles, section_orders)):

                section = Section.objects.create(
                    curriculum = curriculum,
                    title = section_title,
                    order = int(section_order)
                )

                item_types = request.POST.getlist(f'sections[{section_order}][items][type][]')
                item_orders = request.POST.getlist(f'sections[{section_order}][items][order][]')

                for item_idx, (item_type, item_order) in enumerate(zip(item_types, item_orders)):
                    
                    curriculum_item = CurriculumItem.objects.create(
                        section = section,
                        type = item_type,
                        order = int(item_order)
                    )
                    
                    # Handle lessons (videos)
                    if item_type == 'lesson':
                        video_title = request.POST.get(f'sections[{section_order}][items][{item_order}][title][]')
                        video_file = request.FILES.get(f'sections[{section_order}][items][{item_order}][video_file][]')
                        if not video_file:
                            video_file = request.POST.get(f'sections[{section_order}][items][{item_order}][video_file_existing]')
                        note_file = request.FILES.get(f'sections[{section_order}][items][{item_order}][note_file][]', None)
                        if not note_file:
                            note_file = request.POST.get(f'sections[{section_order}][items][{item_order}][note_file_existing]')

                        lesson = Lesson.objects.create(
                            curriculum_item = curriculum_item,
                            title = video_title,
                            video_file = video_file,
                            note_file = note_file
                        )

                    # Handle quizzes
                    else:
                        quiz_question = request.POST.get(f'sections[{section_order}][items][{item_order}][question][]')
                        
                        quiz = Quiz.objects.create(
                            curriculum_item = curriculum_item,
                            question = quiz_question
                        )

                            # Handle quiz options (assumes 4 options)
                        for option_number in range(1, 5):
                            option_text = request.POST.get(f'sections[{section_order}][items][{item_order}][options][{option_number}][text][]')
                            is_correct = request.POST.get(f'sections[{section_order}][items][{item_order}][is_correct][]') == str(option_number)   
                            
                            quiz_option = QuizOption.objects.create(
                                quiz = quiz,
                                text = option_text,
                                is_correct = is_correct
                            )

            messages.success(request, f'Course Curriculum for {course.title} saved successfully.')
            return JsonResponse({'status': 'success', 'success_url': f'/teacher/detail/course/{course.id}/'}, status=200)
        except Exception as e:
            print("HERE",e)
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)