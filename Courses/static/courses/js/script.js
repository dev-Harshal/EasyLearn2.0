const createCourseForm = document.getElementById('createCourseForm')
if (createCourseForm) {
    createCourseForm.addEventListener('submit', function(event) {
        event.preventDefault();

        fetch('/teacher/create/course/', {
            method : 'POST',
            headers : {
                'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body : new FormData(createCourseForm)
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

const updateCourseForm = document.getElementById('updateCourseForm')
if (updateCourseForm) {
    updateCourseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('id').value

        url = `/teacher/update/course/${id}/`
        fetch(url, {
            method : 'POST',
            headers : {
                'X-CSRFToken':document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body : new FormData(updateCourseForm)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.success_url
            }
            else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                popAlert(data)
            }
        })
    })
}

// Function to generate a section template

let sectionCount = document.querySelectorAll('.section-item').length || 0;

function createSection(sectionNumber) {
    return `
    <div class="col-12 section-item" data-section-number="${sectionNumber}">
        <div class="card">

            <!-- SECTION TITLE -->
            <div class="card-header bg-body-secondary">
                <div class="row align-items-center">
                    <div class="col-10">
                        <div class="row">

                            <label class="col-sm-2 col-form-label section-label">Section (${sectionNumber}) :</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" placeholder="Title" name="section_title[]" required>
                                <input type="hidden" class="form-control" name="section_order[]" value="${sectionNumber}" required>
                            </div>

                        </div>
                    </div>
                    <div class="col-2 text-end">
                        <i class="bi bi-trash text-danger fs-5 remove-section"></i>
                    </div>
                </div>
            </div>

            <!-- SECTION CONTENT -->
            <div class="card-body">
                <div class="row g-3 p-2 item-container">
                    ${createVideoItem(sectionNumber, 1)}  <!-- Add first video by default -->
                </div>
                <div class="col-12 text-end">
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary btn-sm dropdown-toggle add-item-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-plus"></i> Add Item
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item addItem" href="#" data-type="video" data-section="${sectionNumber}">Video</a></li>
                            <li><a class="dropdown-item addItem" href="#" data-type="quiz" data-section="${sectionNumber}">Quiz</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// Function to generate video template (Lesson)
function createVideoItem(sectionNumber, order) {
    return `
        <div class="col-12 item">
        
            <input type="hidden" class="form-control" name="sections[${sectionNumber}][items][type][]" value="lesson" required>
            <input type="hidden" class="form-control" name="sections[${sectionNumber}][items][order][]" value="${order}" required>

            <div class="row align-items-center video-item">
                <div class="col-11">
                    <div class="row g-3 justify-content-end">
                        <div class="col-12">
                            <div class="row">

                                <label class="col-sm-2 col-form-label video-label">(${order}) Video Title :</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" name="sections[${sectionNumber}][items][${order}][title][]" required>
                                </div>

                            </div>
                        </div>
                        <div class="col-10">
                            <div class="row">
                                <div class="col-6">
                                    <label class="form-label">Video File :</label>
                                    <input type="file" class="form-control" name="sections[${sectionNumber}][items][${order}][video_file][]" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label">Note File (Optional) :</label>
                                    <input type="file" class="form-control" name="sections[${sectionNumber}][items][${order}][note_file][]">
                                </div>    
                            </div>
                        </div>
                    <hr>
                    </div>
                </div>

                <div class="col-1 text-end">
                    <i class="bi bi-trash text-danger fs-5 remove-item"></i>
                </div>

            </div>
        </div>
    `;
} 

// Function to generate quiz template
function createQuizItem(sectionNumber, order) {
    return `
        <div class="col-12 item">

            <input type="hidden" class="form-control" name="sections[${sectionNumber}][items][type][]" value="quiz" required>
            <input type="hidden" class="form-control" name="sections[${sectionNumber}][items][order][]" value="${order}" required>
            
            <div class="row align-items-center quiz-item">
                <div class="col-11">
                    <div class="row g-3 justify-content-end">

                        <div class="col-12">
                            <div class="row">
                                <label class="col-sm-2 col-form-label quiz-label">(${order}) Quiz :</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" name="sections[${sectionNumber}][items][${order}][question][]" required>
                                </div>
                            </div>
                        </div>

                        <!-- Options -->
                        <div class="col-10">
                            <div class="row g-2">
                                ${createQuizOption(sectionNumber, order, 1)}
                                ${createQuizOption(sectionNumber, order, 2)}
                                ${createQuizOption(sectionNumber, order, 3)}
                                ${createQuizOption(sectionNumber, order, 4)}
                            </div>
                        </div>
                    <hr>
                    </div>
                </div>

                <div class="col-1 text-end">
                    <i class="bi bi-trash text-danger fs-5 remove-item"></i>
                </div>

            </div>
        </div>
    `;
}

// Function to generate individual quiz option
function createQuizOption(sectionNumber, order, optionNumber) {
    return `
        <div class="col-6">
            <div class="row">
                <label class="col-sm-2 col-form-label">(${optionNumber}) :</label>
                <div class="col-sm-8">
                    <input type="text" class="form-control" name="sections[${sectionNumber}][items][${order}][options][${optionNumber}][text][]" required>
                </div>

                <div class="col-sm-2">
                    <input type="radio" name="sections[${sectionNumber}][items][${order}][is_correct][]" value="${optionNumber}" class="form-check-input" required>
                </div>
            </div>
        </div>
    `;
}

// Add default section on load
const sectionContainer = document.getElementById("sectionContainer");
if (sectionContainer) {
    if (sectionCount === 0) {
        sectionCount++
        sectionContainer.innerHTML += createSection(sectionCount);    
    }
    
}

// Add section dynamically
const addSection = document.getElementById("addSection");
if (addSection) {
    addSection.addEventListener("click", function(event) {
        event.preventDefault();  // Prevent page reload
        let sectionCount = document.querySelectorAll('.section-item').length || 0;
        sectionCount++;
        const newSection = createSection(sectionCount);
        document.getElementById("sectionContainer").insertAdjacentHTML('beforeend', newSection);
        scrollToElement(document.querySelector(`[data-section-number="${sectionCount}"]`));
    });
}   

// Function to update section numbers and adjust the section order values
function updateSectionNumbers() {
    const sections = document.querySelectorAll(".section-item");

    sections.forEach((section, index) => {
        let newSectionNumber = index + 1;
        section.setAttribute('data-section-number', newSectionNumber);
        section.setAttribute('data-section', newSectionNumber);
        sectionOrder = section.querySelector(`input[name="section_order[]"]`);
        sectionOrder.value = newSectionNumber;

        // Update the section label text (e.g., "Section (1)", "Section (2)")
        const sectionLabel = section.querySelector(".section-label");
        if (sectionLabel) {
            sectionLabel.textContent = `Section (${newSectionNumber}) :`;
        }
        // Call updateItemNumber to ensure item numbers within the section are updated

        updateItemNumber(section);
    });
}

// Function to update the item numbers (videos and quizzes) within a section
function updateItemNumber(section) {
    const itemContainer = section.querySelector('.item-container');
    const items = itemContainer.querySelectorAll('.item')
    
    items.forEach((item, index) => {
        const itemType = item.querySelector(`input[name^='sections'][name$='[items][type][]'][type='hidden']`);
        const itemOrder = item.querySelector(`input[name^='sections'][name$='[items][order][]'][type='hidden']`);
        const videoLabel = item.querySelector(".video-label");
        const quizLabel = item.querySelector(".quiz-label");
        
        itemOrder.value = index + 1

        if (videoLabel) {
            videoLabel.textContent = `(${index + 1}) Video Title :`;
            
            const videoTitle = item.querySelector(`input[name^='sections'][name$='[title][]']`);
            const videoFile = item.querySelector(`input[name^='sections'][name$='[video_file][]']`);
            const existingVideoFile = item.querySelector(`input[name^='sections'][name$='[video_file_existing]']`);
            const existingNoteFile = item.querySelector(`input[name^='sections'][name$='[note_file_existing]']`);
            const noteFile = item.querySelector(`input[name^='sections'][name$='[note_file][]']`);

            itemType.name = `sections[${section.dataset.sectionNumber}][items][type][]`
            itemOrder.name = `sections[${section.dataset.sectionNumber}][items][order][]`
            if (existingVideoFile) {
                existingVideoFile.name =  `sections[${section.dataset.sectionNumber}][items][${index + 1}][video_file_existing]`;
            }
            if (existingNoteFile) {
                existingNoteFile.name =  `sections[${section.dataset.sectionNumber}][items][${index + 1}][note_file_existing]`;
            }
            videoTitle.name = `sections[${section.dataset.sectionNumber}][items][${index + 1}][title][]`;
            videoFile.name = `sections[${section.dataset.sectionNumber}][items][${index + 1}][video_file][]`;
            noteFile.name = `sections[${section.dataset.sectionNumber}][items][${index + 1}][note_file][]`;
        }

        if (quizLabel) {
            quizLabel.textContent = `(${index + 1}) Quiz :`;
            itemType.name = `sections[${section.dataset.sectionNumber}][items][type][]`
            itemOrder.name = `sections[${section.dataset.sectionNumber}][items][order][]`
            const quizQuestion = item.querySelector(`input[name^='sections'][name$='[question][]']`);
            quizQuestion.name = `sections[${section.dataset.sectionNumber}][items][${index + 1}][question][]`;

            const quizOptions = item.querySelectorAll(`input[name^="sections"][name*='[options]`);
            quizOptions.forEach((option, optionIndex) => {
                option.name = `sections[${section.dataset.sectionNumber}][items][${index + 1}][options][${optionIndex + 1}][text][]`;
            });

            const correctAnswerRadios = item.querySelectorAll(`input[name^='sections'][type='radio']`);
            correctAnswerRadios.forEach((radio) => {
                radio.name = `sections[${section.dataset.sectionNumber}][items][${index + 1}][is_correct][]`;
            });
        }
    });
}


if (sectionContainer) {
    sectionContainer.addEventListener("click", function (e) {
        if (e.target && e.target.classList.contains("addItem")) {
            e.preventDefault();
            const sectionNumber = e.target.getAttribute('data-section');
            const section = e.target.closest('.section-item');
            const itemContainer = section.querySelector('.item-container');
            let itemType = e.target.getAttribute('data-type');
    
            let newItem;
            if (itemType === 'video') {
                newItem = createVideoItem(sectionNumber, itemContainer.querySelectorAll('.item').length + 1);
            } else if (itemType === 'quiz') {
                newItem = createQuizItem(sectionNumber, itemContainer.querySelectorAll('.item').length + 1);
            }
            itemContainer.insertAdjacentHTML('beforeend', newItem);
            scrollToElement(itemContainer.lastElementChild);  // Scroll to the newly added item
        }

        // Handle remove video/quiz
        if (e.target && e.target.classList.contains("remove-item")) {
            const section = e.target.closest('.section-item');
            e.target.closest('.item').remove();
            updateItemNumber(section);  // Update item numbers after removal
        }

        // Handle remove section
        if (e.target && e.target.classList.contains("remove-section")) {
            e.target.closest('.section-item').remove();
            updateSectionNumbers();  // Update section numbers after removal
        }
    });
}

// Scroll to the newly added element smoothly
function scrollToElement(element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
}

const saveCurriculumForm = document.getElementById('saveCurriculumForm')
if (saveCurriculumForm) {
    saveCurriculumForm.addEventListener('submit', function(event) {
        event.preventDefault();
    
        const formData = new FormData(saveCurriculumForm);   
        const courseId = document.getElementById('id').value;
        const url = `/teacher/save/curriculum/${courseId}/`;
    
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value,
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.success_url;
            } else {
                popAlert(data);
            }
        });
    });
}





