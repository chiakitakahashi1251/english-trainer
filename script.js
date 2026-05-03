// 状態管理
const state = {
  mode: "enToJp",
  score: 0,
  streak: 0,
  currentIndex: 0,
  questionCount: 0,
  maxQuestions: -1,
  wrongAnswers: [] // ← 追加
};

let currentChoices = [];

// 初期化
window.addEventListener("DOMContentLoaded", () => {

  // custom入力表示切り替え
  document.querySelectorAll('input[name="limit"]').forEach(radio => {
    radio.addEventListener("change", () => {
      document.getElementById("customLimit").style.display =
        radio.value === "custom" ? "inline-block" : "none";
    });
  });

});

// スタート
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
  state.wrongAnswers = []; // ← リセット

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
  document.getElementById("endScreen").style.display = "none";

  updateUI();
  nextPhrase();
}

// 問題出す
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

// 選択肢生成
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

// 選択肢表示
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

// 判定
function checkChoice(selected, button) {
  const correct = phrases[state.currentIndex];

  const isCorrect =
    state.mode === "enToJp"
      ? selected.jp === correct.jp
      : selected.en === correct.en;

  const buttons = document.querySelectorAll("#choices button");
  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    state.score++;
    state.streak++;
    button.style.backgroundColor = "#4caf50";
    document.getElementById("result").textContent = "✅ 正解！";
  } else {
    state.streak = 0;
    button.style.backgroundColor = "#f44336";

    // 👇 間違い保存
    state.wrongAnswers.push(correct);

    // 正解を緑表示
    buttons.forEach(btn => {
      if (
        btn.textContent ===
        (state.mode === "enToJp" ? correct.jp : correct.en)
      ) {
        btn.style.backgroundColor = "#4caf50";
      }
    });

    document.getElementById("result").textContent = "❌ 不正解";
  }

  updateUI();

  setTimeout(nextPhrase, 700);
}

// UI更新
function updateUI() {
  document.getElementById("score").textContent = state.score;
  document.getElementById("streak").textContent = state.streak;
}

// 終了画面
function showResult() {
  document.getElementById("appScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "block";

  document.getElementById("finalScore").textContent = state.score;
  document.getElementById("finalStreak").textContent = state.streak;

  renderReview();
}

// 復習表示
function renderReview() {
  const section = document.getElementById("reviewSection");
  const list = document.getElementById("reviewList");

  list.innerHTML = "";

  if (state.wrongAnswers.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  // 多すぎ防止（最大5件）
  const reviewItems = state.wrongAnswers.slice(0, 5);

  reviewItems.forEach(item => {
    const div = document.createElement("div");

    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${item.en}</strong><br>
      → ${item.jp}
    `;

    list.appendChild(div);
  });
}

// もう一回
function restartGame() {
  state.score = 0;
  state.streak = 0;
  state.questionCount = 0;
  state.wrongAnswers = [];

  document.getElementById("endScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";

  updateUI();
  nextPhrase();
}

// メニューへ戻る
function backToMenu() {
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
}