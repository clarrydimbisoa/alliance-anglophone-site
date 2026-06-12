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

const urlParams = new URLSearchParams(window.location.search);
const courseFromUrl = urlParams.get("course");

let selectedCourseId = courseFromUrl || localStorage.getItem(SELECTED_COURSE_KEY) || "english";
let selectedLessonId = null;
let currentRecognition = null;

const UI_TRANSLATIONS = {
  english: {
    pageTitle: "Speaking Lab",
    freePrototype: "Free prototype",
    mainHeading: "Practice. Speak. Pass. Unlock the next lesson.",
    introText:
      "Listen to the model sentence, repeat it aloud, and receive a basic score. This first version works without paid APIs and saves progress in your browser.",
    chooseCourse: "Choose a course:",
    voice: "Voice:",
    noSpeech:
      "Speech recognition is not available in this browser. You can still use manual mode by typing what you said.",
    lessonNote: "Lesson note",
    vocabulary: "Vocabulary",
    speakingExercises: "Speaking exercises",
    passingScoreText:
      "Passing score for this lesson:",
    instructionText:
      "Click Listen, then Speak. If speech recognition does not work, type your answer manually.",
    exercise: "Exercise",
    listen: "Listen",
    speak: "Speak",
    listening: "Listening...",
    transcriptLabel: "Your transcript or manual answer:",
    transcriptPlaceholder:
      "Your recognized speech will appear here. You can also type manually.",
    checkAnswer: "Check answer",
    expected: "Expected:",
    yourAnswer: "Your answer:",
    noAnswer: "No answer detected.",
    minimumRequired: "Minimum required score:",
    passed: "Passed",
    tryAgain: "Try again",
    completed: "Completed",
    unlocked: "Unlocked",
    locked: "Locked",
    exercises: "exercises",
    completedPercent: "completed",
    lessonCompleted: "Lesson completed. The next lesson is now unlocked.",
    previousLesson: "Previous lesson",
    nextLesson: "Next lesson",
    resetProgress: "Reset progress",
    resetConfirm: "Do you want to reset all progress for all courses?",
    noLessonsTitle: "No lessons available yet",
    noLessonsText: "Please add lessons for this course in lessons.js.",
    ttsUnavailable: "Text-to-speech is not available in this browser.",
    recognitionUnavailable:
      "Speech recognition is not available in this browser. Please use manual mode.",
    recognitionError: "Speech recognition error:"
  },

  french: {
    pageTitle: "Laboratoire oral",
    freePrototype: "Prototype gratuit",
    mainHeading: "Écoutez. Parlez. Réussissez. Débloquez la leçon suivante.",
    introText:
      "Écoutez la phrase modèle, répétez-la à voix haute et recevez un score de base. Cette première version fonctionne sans API payante et enregistre la progression dans votre navigateur.",
    chooseCourse: "Choisissez un cours :",
    voice: "Voix :",
    noSpeech:
      "La reconnaissance vocale n’est pas disponible dans ce navigateur. Vous pouvez utiliser le mode manuel en tapant ce que vous avez dit.",
    lessonNote: "Note de leçon",
    vocabulary: "Vocabulaire",
    speakingExercises: "Exercices oraux",
    passingScoreText:
      "Score minimum pour cette leçon :",
    instructionText:
      "Cliquez sur Écouter, puis sur Parler. Si la reconnaissance vocale ne fonctionne pas, tapez votre réponse manuellement.",
    exercise: "Exercice",
    listen: "Écouter",
    speak: "Parler",
    listening: "Écoute en cours...",
    transcriptLabel: "Votre transcription ou réponse manuelle :",
    transcriptPlaceholder:
      "Votre parole reconnue apparaîtra ici. Vous pouvez aussi taper manuellement.",
    checkAnswer: "Vérifier la réponse",
    expected: "Phrase attendue :",
    yourAnswer: "Votre réponse :",
    noAnswer: "Aucune réponse détectée.",
    minimumRequired: "Score minimum requis :",
    passed: "Réussi",
    tryAgain: "Réessayez",
    completed: "Terminé",
    unlocked: "Débloqué",
    locked: "Bloqué",
    exercises: "exercices",
    completedPercent: "terminé",
    lessonCompleted: "Leçon terminée. La leçon suivante est maintenant débloquée.",
    previousLesson: "Leçon précédente",
    nextLesson: "Leçon suivante",
    resetProgress: "Réinitialiser la progression",
    resetConfirm: "Voulez-vous réinitialiser toute la progression de tous les cours ?",
    noLessonsTitle: "Aucune leçon disponible pour le moment",
    noLessonsText: "Veuillez ajouter des leçons pour ce cours dans lessons.js.",
    ttsUnavailable: "La synthèse vocale n’est pas disponible dans ce navigateur.",
    recognitionUnavailable:
      "La reconnaissance vocale n’est pas disponible dans ce navigateur. Veuillez utiliser le mode manuel.",
    recognitionError: "Erreur de reconnaissance vocale :"
  },

  malagasy: {
    pageTitle: "Laboratoara fitenenana",
    freePrototype: "Prototype maimaim-poana",
    mainHeading: "Mihainoa. Mitenena. Mandresy. Sokafy ny lesona manaraka.",
    introText:
      "Henoy ny fehezanteny modely, avereno amin’ny feo avo, ary raiso ny naoty fototra. Ity kinova voalohany ity dia tsy mampiasa API andoavam-bola ary mitahiry ny fandrosoana ao amin’ny navigateur-nao.",
    chooseCourse: "Safidio ny taranja :",
    voice: "Feo :",
    noSpeech:
      "Tsy mandeha amin’ity navigateur ity ny reconnaissance vocale. Afaka mampiasa fomba manuel ianao ka manoratra izay nolazainao.",
    lessonNote: "Fanamarihana",
    vocabulary: "Voambolana",
    speakingExercises: "Fanazaran-tena am-bava",
    passingScoreText:
      "Naoty ilaina amin’ity lesona ity :",
    instructionText:
      "Tsindrio Henoy, avy eo Mitenena. Raha tsy mandeha ny reconnaissance vocale dia soraty amin’ny tanana ny valinteninao.",
    exercise: "Fanazaran-tena",
    listen: "Henoy",
    speak: "Mitenena",
    listening: "Mihaino...",
    transcriptLabel: "Transcription na valiny soratana :",
    transcriptPlaceholder:
      "Hiseho eto ny feo voarakitra. Afaka manoratra amin’ny tanana koa ianao.",
    checkAnswer: "Hamarino ny valiny",
    expected: "Tokony ho izy :",
    yourAnswer: "Valinteninao :",
    noAnswer: "Tsy nisy valiny hita.",
    minimumRequired: "Naoty farany ambany takiana :",
    passed: "Tafita",
    tryAgain: "Andramo indray",
    completed: "Vita",
    unlocked: "Misokatra",
    locked: "Mikatona",
    exercises: "fanazaran-tena",
    completedPercent: "vita",
    lessonCompleted: "Vita ny lesona. Misokatra izao ny lesona manaraka.",
    previousLesson: "Lesona teo aloha",
    nextLesson: "Lesona manaraka",
    resetProgress: "Avereno aotra ny fandrosoana",
    resetConfirm: "Tianao haverina aotra ve ny fandrosoana rehetra amin’ny taranja rehetra ?",
    noLessonsTitle: "Tsy mbola misy lesona",
    noLessonsText: "Ampidiro ao amin’ny lessons.js ny lesona ho an’ity taranja ity.",
    ttsUnavailable: "Tsy mandeha amin’ity navigateur ity ny famakiana feo.",
    recognitionUnavailable:
      "Tsy mandeha amin’ity navigateur ity ny reconnaissance vocale. Ampiasao ny fomba manuel.",
    recognitionError: "Olana amin’ny reconnaissance vocale :"
  }
};

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

function getUI() {
  return UI_TRANSLATIONS[selectedCourseId] || UI_TRANSLATIONS.english;
}

function t(key) {
  const ui = getUI();
  return ui[key] || UI_TRANSLATIONS.english[key] || key;
}

function updateStaticInterfaceText() {
  const introEyebrow = document.querySelector(".intro-card .eyebrow");
  const introHeading = document.querySelector(".intro-card h2");
  const introParagraph = document.querySelector(".intro-card > p:not(.eyebrow)");
  const courseLabel = document.querySelector(".course-selector-card label");
  const voiceLabel = document.querySelector('label[for="voiceLang"]');
  const pageHeading = document.querySelector(".brand h1");

  document.title = `Alliance Anglophone ${t("pageTitle")}`;

  if (pageHeading) pageHeading.textContent = t("pageTitle");
  if (introEyebrow) introEyebrow.textContent = t("freePrototype");
  if (introHeading) introHeading.textContent = t("mainHeading");
  if (introParagraph) introParagraph.textContent = t("introText");
  if (courseLabel) courseLabel.textContent = t("chooseCourse");
  if (voiceLabel) voiceLabel.textContent = t("voice");
  if (supportWarningEl) supportWarningEl.textContent = t("noSpeech");
  if (resetProgressBtn) resetProgressBtn.textContent = t("resetProgress");
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
    alert(t("ttsUnavailable"));
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
    alert(t("recognitionUnavailable"));
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
    alert(`${t("recognitionError")} ${event.error}`);
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

  progressSummaryEl.textContent = `${percentage}% ${t("completedPercent")}`;

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
            <span>${lesson.exercises.length} ${t("exercises")}</span>
            <span>${completed ? t("completed") : unlocked ? t("unlocked") : t("locked")}</span>
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
        <h2>${t("noLessonsTitle")}</h2>
        <p class="objective">${t("noLessonsText")}</p>
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
        <h3>${t("lessonNote")}</h3>
        <p>${lesson.explanation}</p>
      </div>

      <div class="info-box">
        <h3>${t("vocabulary")}</h3>
        <ul>
          ${lesson.vocabulary.map((word) => `<li>${word}</li>`).join("")}
        </ul>
      </div>
    </div>

    <h3>${t("speakingExercises")}</h3>
    <p>
      ${t("passingScoreText")} <strong>${lesson.passScore}%</strong>.
      ${t("instructionText")}
    </p>

    <div id="exerciseList">
      ${lesson.exercises.map((exercise, exerciseIndex) => renderExerciseCard(lesson, exercise, exerciseIndex)).join("")}
    </div>

    ${allExercisesPassed ? `
      <div class="lesson-complete-banner">
        ${t("lessonCompleted")}
      </div>
    ` : ""}

    <div class="navigation-row">
      <button class="secondary-button" type="button" id="previousLesson" ${lessonIndex === 0 ? "disabled" : ""}>
        ${t("previousLesson")}
      </button>
      <button class="primary-button" type="button" id="nextLesson" ${lessonIndex >= lessons.length - 1 || !allExercisesPassed ? "disabled" : ""}>
        ${t("nextLesson")}
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
      <h3>${t("exercise")} ${exerciseIndex + 1}</h3>
      <p>${exercise.instruction}</p>

      <div class="target-sentence">
        “${exercise.targetText}”
      </div>

      <div class="controls">
        <button class="secondary-button listen-button" type="button" data-text="${escapeHtml(exercise.targetText)}">
          ${t("listen")}
        </button>
        <button class="primary-button speak-button" type="button" data-exercise-id="${exercise.id}">
          ${t("speak")}
        </button>
      </div>

      <label for="transcript-${exercise.id}">
        ${t("transcriptLabel")}
      </label>
      <textarea
        class="transcript-box"
        id="transcript-${exercise.id}"
        placeholder="${t("transcriptPlaceholder")}"
      >${attempt?.transcript || ""}</textarea>

      <div class="controls">
        <button class="primary-button check-button" type="button" data-exercise-id="${exercise.id}">
          ${t("checkAnswer")}
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
  const label = attempt.passed ? t("passed") : t("tryAgain");

  return `
    <div class="result-card ${resultClass}">
      <p class="score">${attempt.score}% — ${label}</p>
      <p><strong>${t("expected")}</strong> ${attempt.expectedText}</p>
      <p><strong>${t("yourAnswer")}</strong> ${attempt.transcript || t("noAnswer")}</p>
      <p>
        ${t("minimumRequired")} ${passScore}%.
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

      button.textContent = t("listening");
      button.disabled = true;

      startRecognition(
        (transcript) => {
          textarea.value = transcript;
        },
        () => {
          button.textContent = t("speak");
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
  updateStaticInterfaceText();
  ensureSelectedLesson();
  renderLessonList();
  renderLessonPanel();
}

resetProgressBtn.addEventListener("click", () => {
  const confirmed = confirm(t("resetConfirm"));
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
