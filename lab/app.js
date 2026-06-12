const STORAGE_KEY = "aa_speaking_lab_progress_v2";
const SELECTED_COURSE_KEY = "aa_speaking_lab_selected_course_v1";

const lessonListEl = document.getElementById("lessonList");
const lessonPanelEl = document.getElementById("lessonPanel");
const progressSummaryEl = document.getElementById("progressSummary");
const resetProgressBtn = document.getElementById("resetProgress");
const supportWarningEl = document.getElementById("supportWarning");
const voiceLangEl = document.getElementById("voiceLang");
const courseSelectorEl = document.getElementById("courseSelector");
const sidebarTitleEl = document.querySelector(".sidebar-title h2");

const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSpeechRecognition = Boolean(SpeechRecognitionClass);

let selectedCourseId = localStorage.getItem(SELECTED_COURSE_KEY) || "english";
let selectedLessonId = null;
let currentRecognition = null;

if (!hasSpeechRecognition) {
  supportWarningEl.hidden = false;
}

function getCourses() {
  return window.AA_COURSES || {
    english: {
      id: "english",
      title: "English Speaking Lessons",
      levelTitle: "Beginner Level 1",
      voiceLang: "en-US",
      lessons: window.AA_LESSONS || []
    }
  };
}

function getCurrentCourse() {
  const courses = getCourses();
  return courses[selectedCourseId] || courses.english;
}

function getCurrentLessons() {
  const course = getCurrentCourse();
  return course.lessons || [];
}

function initializeVoiceOptions() {
  if (!voiceLangEl) return;

  voiceLangEl.innerHTML = `
    <option value="en-US">English US</option>
    <option value="en-GB">English UK</option>
    <option value="fr-FR">French FR</option>
    <option value="mg-MG">Malagasy MG</option>
  `;
}

function initializeCourseSelector() {
  if (!courseSelectorEl) return;

  const courses = getCourses();

  courseSelectorEl.innerHTML = Object.values(courses)
    .map((course) => {
      return `<option value="${course.id}">${course.title}</option>`;
    })
    .join("");

  courseSelectorEl.value = selectedCourseId;

  courseSelectorEl.addEventListener("change", () => {
    selectedCourseId = courseSelectorEl.value;
    localStorage.setItem(SELECTED_COURSE_KEY, selectedCourseId);

    const lessons = getCurrentLessons();
    selectedLessonId = lessons[0]?.id || null;

    setDefaultVoiceForCourse();
    renderApp();
  });
}

function setDefaultVoiceForCourse() {
  const course = getCurrentCourse();

  if (voiceLangEl && course.voiceLang) {
    voiceLangEl.value = course.voiceLang;
  }
}

function ensureSelectedLesson() {
  const lessons = getCurrentLessons();

  if (!selectedLessonId || !lessons.some((lesson) => lesson.id === selectedLessonId)) {
    selectedLessonId = lessons[0]?.id || null;
  }
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved || {};
  } catch (error) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getProgress() {
  const allProgress = loadProgress();

  if (!allProgress[selectedCourseId]) {
    allProgress[selectedCourseId] = {
      completedLessons: {},
      attempts: {}
    };
  }

  return allProgress[selectedCourseId];
}

function updateProgressForCurrentCourse(courseProgress) {
  const allProgress = loadProgress();

  allProgress[selectedCourseId] = courseProgress;
  saveProgress(allProgress);
}

function isLessonUnlocked(lessonIndex, progress) {
  if (lessonIndex === 0) return true;

  const lessons = getCurrentLessons();
  const previousLesson = lessons[lessonIndex - 1];

  return Boolean(progress.completedLessons[previousLesson.id]);
}

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function calculateSimilarityScore(expected, actual) {
  const cleanExpected = normalizeText(expected);
  const cleanActual = normalizeText(actual);

  if (!cleanActual) return 0;
  if (cleanExpected === cleanActual) return 100;

  const distance = levenshteinDistance(cleanExpected, cleanActual);
  const longest = Math.max(cleanExpected.length, cleanActual.length);
  const score = Math.max(0, Math.round((1 - distance / longest) * 100));

  return score;
}

function getRecognitionLanguage() {
  const course = getCurrentCourse();

  if (voiceLangEl && voiceLangEl.value) {
    return voiceLangEl.value;
  }

  return course.voiceLang || "en-US";
}

function speakText(text) {
  if (!window.speechSynthesis) {
    alert("Text-to-speech is not available in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getRecognitionLanguage();
  utterance.rate = 0.85;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function startRecognition(onResult, onEnd) {
  if (!hasSpeechRecognition) {
    alert("Speech recognition is not available in this browser. Please use manual mode.");
    return;
  }

  if (currentRecognition) {
    currentRecognition.abort();
  }

  const recognition = new SpeechRecognitionClass();

  recognition.lang = getRecognitionLanguage();
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    alert("Speech recognition error: " + event.error);
  };

  recognition.onend = () => {
    currentRecognition = null;
    if (onEnd) onEnd();
  };

  currentRecognition = recognition;
  recognition.start();
}

function renderLessonList() {
  const course = getCurrentCourse();
  const lessons = getCurrentLessons();
  const progress = getProgress();

  if (sidebarTitleEl) {
    sidebarTitleEl.textContent = course.levelTitle || course.title;
  }

  const completedCount = lessons.filter((lesson) => progress.completedLessons[lesson.id]).length;
  const percentage = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  progressSummaryEl.textContent = `${percentage}% completed`;

  lessonListEl.innerHTML = lessons
    .map((lesson, index) => {
      const unlocked = isLessonUnlocked(index, progress);
      const completed = Boolean(progress.completedLessons[lesson.id]);
      const active = lesson.id === selectedLessonId;

      return `
        <button
          class="lesson-button ${active ? "active" : ""} ${completed ? "completed" : ""} ${!unlocked ? "locked" : ""}"
          type="button"
          data-lesson-id="${lesson.id}"
          ${!unlocked ? "disabled" : ""}
        >
          <span class="lesson-title">${index + 1}. ${lesson.title}</span>
          <span class="lesson-meta">
            <span>${lesson.exercises.length} exercises</span>
            <span>${completed ? "Completed" : unlocked ? "Unlocked" : "Locked"}</span>
          </span>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll(".lesson-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLessonId = button.dataset.lessonId;
      renderApp();
    });
  });
}

function renderLessonPanel() {
  const lessons = getCurrentLessons();

  if (!lessons.length) {
    lessonPanelEl.innerHTML = `
      <div class="lesson-header">
        <h2>No lessons available yet</h2>
        <p class="objective">Please add lessons for this course in lessons.js.</p>
      </div>
    `;
    return;
  }

  const progress = getProgress();
  const lesson = lessons.find((item) => item.id === selectedLessonId);
  const lessonIndex = lessons.findIndex((item) => item.id === selectedLessonId);

  if (!lesson) {
    selectedLessonId = lessons[0].id;
    renderApp();
    return;
  }

  const allExercisesPassed = lesson.exercises.every((exercise) => {
    return progress.attempts[exercise.id]?.passed;
  });

  if (allExercisesPassed && !progress.completedLessons[lesson.id]) {
    progress.completedLessons[lesson.id] = true;
    updateProgressForCurrentCourse(progress);
  }

  lessonPanelEl.innerHTML = `
    <div class="lesson-header">
      <p class="eyebrow">${lesson.level}</p>
      <h2>${lesson.title}</h2>
      <p class="objective">${lesson.objective}</p>
    </div>

    <div class="content-grid">
      <div class="info-box">
        <h3>Lesson note</h3>
        <p>${lesson.explanation}</p>
      </div>

      <div class="info-box">
        <h3>Vocabulary</h3>
        <ul>
          ${lesson.vocabulary.map((word) => `<li>${word}</li>`).join("")}
        </ul>
      </div>
    </div>

    <h3>Speaking exercises</h3>
    <p>
      Passing score for this lesson: <strong>${lesson.passScore}%</strong>.
      Click <strong>Listen</strong>, then <strong>Speak</strong>.
      If speech recognition does not work, type your answer manually.
    </p>

    <div id="exerciseList">
      ${lesson.exercises.map((exercise, exerciseIndex) => renderExerciseCard(lesson, exercise, exerciseIndex)).join("")}
    </div>

    ${allExercisesPassed ? `
      <div class="lesson-complete-banner">
        Lesson completed. The next lesson is now unlocked.
      </div>
    ` : ""}

    <div class="navigation-row">
      <button class="secondary-button" type="button" id="previousLesson" ${lessonIndex === 0 ? "disabled" : ""}>
        Previous lesson
      </button>
      <button class="primary-button" type="button" id="nextLesson" ${lessonIndex >= lessons.length - 1 || !allExercisesPassed ? "disabled" : ""}>
        Next lesson
      </button>
    </div>
  `;

  bindExerciseEvents(lesson);

  document.getElementById("previousLesson").addEventListener("click", () => {
    if (lessonIndex > 0) {
      selectedLessonId = lessons[lessonIndex - 1].id;
      renderApp();
    }
  });

  document.getElementById("nextLesson").addEventListener("click", () => {
    if (lessonIndex < lessons.length - 1) {
      selectedLessonId = lessons[lessonIndex + 1].id;
      renderApp();
    }
  });
}

function renderExerciseCard(lesson, exercise, exerciseIndex) {
  const progress = getProgress();
  const attempt = progress.attempts[exercise.id];

  return `
    <article class="exercise-card" id="card-${exercise.id}">
      <h3>Exercise ${exerciseIndex + 1}</h3>
      <p>${exercise.instruction}</p>

      <div class="target-sentence">
        “${exercise.targetText}”
      </div>

      <div class="controls">
        <button class="secondary-button listen-button" type="button" data-text="${escapeHtml(exercise.targetText)}">
          Listen
        </button>
        <button class="primary-button speak-button" type="button" data-exercise-id="${exercise.id}">
          Speak
        </button>
      </div>

      <label for="transcript-${exercise.id}">
        Your transcript or manual answer:
      </label>
      <textarea
        class="transcript-box"
        id="transcript-${exercise.id}"
        placeholder="Your recognized speech will appear here. You can also type manually."
      >${attempt?.transcript || ""}</textarea>

      <div class="controls">
        <button class="primary-button check-button" type="button" data-exercise-id="${exercise.id}">
          Check answer
        </button>
      </div>

      <div id="result-${exercise.id}">
        ${attempt ? renderResult(attempt, lesson.passScore) : ""}
      </div>
    </article>
  `;
}

function renderResult(attempt, passScore) {
  const resultClass = attempt.passed ? "pass" : "fail";
  const label = attempt.passed ? "Passed" : "Try again";

  return `
    <div class="result-card ${resultClass}">
      <p class="score">${attempt.score}% — ${label}</p>
      <p><strong>Expected:</strong> ${attempt.expectedText}</p>
      <p><strong>Your answer:</strong> ${attempt.transcript || "No answer detected."}</p>
      <p>
        Minimum required score: ${passScore}%.
      </p>
    </div>
  `;
}

function bindExerciseEvents(lesson) {
  document.querySelectorAll(".listen-button").forEach((button) => {
    button.addEventListener("click", () => {
      speakText(button.dataset.text);
    });
  });

  document.querySelectorAll(".speak-button").forEach((button) => {
    button.addEventListener("click", () => {
      const exerciseId = button.dataset.exerciseId;
      const textarea = document.getElementById(`transcript-${exerciseId}`);

      button.textContent = "Listening...";
      button.disabled = true;

      startRecognition(
        (transcript) => {
          textarea.value = transcript;
        },
        () => {
          button.textContent = "Speak";
          button.disabled = false;
        }
      );
    });
  });

  document.querySelectorAll(".check-button").forEach((button) => {
    button.addEventListener("click", () => {
      const exerciseId = button.dataset.exerciseId;
      const exercise = lesson.exercises.find((item) => item.id === exerciseId);
      const textarea = document.getElementById(`transcript-${exerciseId}`);
      const transcript = textarea.value.trim();

      const score = calculateSimilarityScore(exercise.targetText, transcript);
      const passed = score >= lesson.passScore;

      const progress = getProgress();

      progress.attempts[exerciseId] = {
        expectedText: exercise.targetText,
        transcript,
        score,
        passed,
        date: new Date().toISOString()
      };

      const allExercisesPassed = lesson.exercises.every((item) => {
        if (item.id === exerciseId) return passed;
        return progress.attempts[item.id]?.passed;
      });

      if (allExercisesPassed) {
        progress.completedLessons[lesson.id] = true;
      }

      updateProgressForCurrentCourse(progress);
      renderApp();
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderApp() {
  document.body.setAttribute("data-course", selectedCourseId);
  ensureSelectedLesson();
  renderLessonList();
  renderLessonPanel();
}

resetProgressBtn.addEventListener("click", () => {
  const confirmed = confirm("Do you want to reset all progress for all courses?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  selectedCourseId = "english";
  localStorage.setItem(SELECTED_COURSE_KEY, selectedCourseId);

  if (courseSelectorEl) {
    courseSelectorEl.value = selectedCourseId;
  }

  const lessons = getCurrentLessons();
  selectedLessonId = lessons[0]?.id || null;

  setDefaultVoiceForCourse();
  renderApp();
});

initializeVoiceOptions();
initializeCourseSelector();
setDefaultVoiceForCourse();

selectedLessonId = getCurrentLessons()[0]?.id || null;

renderApp();
