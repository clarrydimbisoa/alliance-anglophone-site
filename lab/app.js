const STORAGE_KEY = "aa_speaking_lab_progress_v1";

const lessonListEl = document.getElementById("lessonList");
const lessonPanelEl = document.getElementById("lessonPanel");
const progressSummaryEl = document.getElementById("progressSummary");
const resetProgressBtn = document.getElementById("resetProgress");
const supportWarningEl = document.getElementById("supportWarning");
const voiceLangEl = document.getElementById("voiceLang");

const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSpeechRecognition = Boolean(SpeechRecognitionClass);

let selectedLessonId = window.AA_LESSONS[0].id;
let currentRecognition = null;

if (!hasSpeechRecognition) {
  supportWarningEl.hidden = false;
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved || { completedLessons: {}, attempts: {} };
  } catch (error) {
    return { completedLessons: {}, attempts: {} };
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getProgress() {
  return loadProgress();
}

function isLessonUnlocked(lessonIndex, progress) {
  if (lessonIndex === 0) return true;
  const previousLesson = window.AA_LESSONS[lessonIndex - 1];
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

function speakText(text) {
  if (!window.speechSynthesis) {
    alert("Text-to-speech is not available in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLangEl.value || "en-US";
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
  recognition.lang = voiceLangEl.value || "en-US";
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
  const progress = getProgress();
  const completedCount = window.AA_LESSONS.filter((lesson) => progress.completedLessons[lesson.id]).length;
  const percentage = Math.round((completedCount / window.AA_LESSONS.length) * 100);

  progressSummaryEl.textContent = `${percentage}% completed`;

  lessonListEl.innerHTML = window.AA_LESSONS
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
  const progress = getProgress();
  const lesson = window.AA_LESSONS.find((item) => item.id === selectedLessonId);
  const lessonIndex = window.AA_LESSONS.findIndex((item) => item.id === selectedLessonId);
  const allExercisesPassed = lesson.exercises.every((exercise) => {
    return progress.attempts[exercise.id]?.passed;
  });

  if (allExercisesPassed && !progress.completedLessons[lesson.id]) {
    progress.completedLessons[lesson.id] = true;
    saveProgress(progress);
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
      <button class="primary-button" type="button" id="nextLesson" ${lessonIndex >= window.AA_LESSONS.length - 1 || !allExercisesPassed ? "disabled" : ""}>
        Next lesson
      </button>
    </div>
  `;

  bindExerciseEvents(lesson);

  document.getElementById("previousLesson").addEventListener("click", () => {
    if (lessonIndex > 0) {
      selectedLessonId = window.AA_LESSONS[lessonIndex - 1].id;
      renderApp();
    }
  });

  document.getElementById("nextLesson").addEventListener("click", () => {
    if (lessonIndex < window.AA_LESSONS.length - 1) {
      selectedLessonId = window.AA_LESSONS[lessonIndex + 1].id;
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

      saveProgress(progress);
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
  renderLessonList();
  renderLessonPanel();
}

resetProgressBtn.addEventListener("click", () => {
  const confirmed = confirm("Do you want to reset all progress?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  selectedLessonId = window.AA_LESSONS[0].id;
  renderApp();
});

renderApp();
