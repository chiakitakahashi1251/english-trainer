// ===== 状態管理 =====
const state = {
  mode: "enToJp",
  score: 0,
  streak: 0,
  currentIndex: 0,
  questionCount: 0,
  maxQuestions: -1,
  wrongAnswers: []
};

let currentChoices = [];

// ===== 画面切り替え =====
function showScreen(targetId) {
  ["startScreen", "appScreen", "endScreen"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(targetId).classList.remove("hidden");
}

// ===== 初期化 =====
window.addEventListener("DOMContentLoaded", () => {

  // custom入力表示
  document.querySelectorAll('input[name="limit"]').forEach(radio => {
    radio.addEventListener("change", () => {
      document.getElementById("customLimit").style.display =
        radio.value === "custom" ? "block" : "none";
    });
  });

});

// ===== START =====
function startApp() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const limitValue = document.querySelector('input[name="limit"]:checked').value;

  let limit;

  if (limitValue === "custom") {
    const custom = document.getElementById("customLimit").value;
    limit = custom ? parseInt(custom) : -1;
  } else {
    limit = parseInt(limitValue);
  }

  state.mode = mode;
  state.maxQuestions = limit;
  state.score = 0;
  state.streak = 0;
  state.questionCount = 0;
  state.wrongAnswers = [];

  showScreen("appScreen");

  updateUI();
  nextPhrase();
}

// ===== 問題出す =====
function nextPhrase() {

  if (state.maxQuestions !== -1 && state.questionCount >= state.maxQuestions) {
    showResult();
    return;
  }

  state.questionCount++;

  let newIndex;

  do {
    newIndex = Math.floor(Math.random() * phrases.length);
  } while (newIndex === state.currentIndex);

  state.currentIndex = newIndex;

  const p = phrases[state.currentIndex];

  document.getElementById("question").textContent =
    state.mode === "enToJp" ? p.en : p.jp;

  currentChoices = generateChoices(state.currentIndex);
  renderChoices();

  document.getElementById("result").textContent = "";
}

// ===== 選択肢生成 =====
function generateChoices(correctIndex) {
  const correct = phrases[correctIndex];
  const choices = [correct];

  while (choices.length < 4) {
    const random = phrases[Math.floor(Math.random() * phrases.length)];
    if (!choices.includes(random)) {
      choices.push(random);
    }
  }

  return choices.sort(() => Math.random() - 0.5);
}

// ===== 描画 =====
function renderChoices() {
  const container = document.getElementById("choices");
  container.innerHTML = "";

  currentChoices.forEach(choice => {
    const btn = document.createElement("button");

    btn.textContent =
      state.mode === "enToJp" ? choice.jp : choice.en;

    btn.onclick = () => checkChoice(choice, btn);

    container.appendChild(btn);
  });
}

// ===== 判定 =====
function checkChoice(selected, button) {
  const correct = phrases[state.currentIndex];

  const isCorrect =
    state.mode === "enToJp"
      ? selected.jp === correct.jp
      : selected.en === correct.en;

  const buttons = document.querySelectorAll("#choices button");

  // 全ボタン無効化
  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    state.score++;
    state.streak++;
    button.classList.add("correct");
    document.getElementById("result").textContent = "✅ 正解！";
  } else {
    state.streak = 0;
    button.classList.add("wrong");

    // 重複防止
    if (!state.wrongAnswers.find(p => p.en === correct.en)) {
      state.wrongAnswers.push(correct);
    }

    // 正解ハイライト
    buttons.forEach(btn => {
      if (
        btn.textContent ===
        (state.mode === "enToJp" ? correct.jp : correct.en)
      ) {
        btn.classList.add("correct");
      }
    });

    document.getElementById("result").textContent = "❌ 不正解";
  }

  updateUI();

  setTimeout(nextPhrase, 700);
}

// ===== UI更新 =====
function updateUI() {
  document.getElementById("score").textContent = state.score;
  document.getElementById("streak").textContent = state.streak;
}

// ===== 終了 =====
function showResult() {
  showScreen("endScreen");

  document.getElementById("finalScore").textContent = state.score;
  document.getElementById("finalStreak").textContent = state.streak;

  renderReview();
}

// ===== 復習 =====
function renderReview() {
  const section = document.getElementById("reviewSection");
  const list = document.getElementById("reviewList");

  list.innerHTML = "";

  if (state.wrongAnswers.length === 0) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");

  const reviewItems = state.wrongAnswers.slice(0, 5);

  reviewItems.forEach(item => {
    const div = document.createElement("div");

    div.innerHTML = `
      <strong>${item.en}</strong><br>
      → ${item.jp}
    `;

    list.appendChild(div);
  });
}

// ===== 再開 =====
function restartGame() {
  state.score = 0;
  state.streak = 0;
  state.questionCount = 0;
  state.wrongAnswers = [];

  showScreen("appScreen");

  updateUI();
  nextPhrase();
}

// ===== メニュー =====
function backToMenu() {
  showScreen("startScreen");
}
