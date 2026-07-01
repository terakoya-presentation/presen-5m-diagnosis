const axes = [
  {
    id: "man",
    name: "Man",
    label: "人",
    comment: [
      "聞き手に合わせた整理を、もう少し足すと伝わりやすくなりそうです。",
      "伝えたい内容があっても、聞き手が知りたい順番とずれると、せっかくの資料が届きにくくなることがあります。",
      "まずは、「この相手は、何を判断するためにこの資料を見るのか」を1文で書き出してみてください。"
    ]
  },
  {
    id: "machine",
    name: "Machine",
    label: "設備",
    comment: [
      "発表環境の確認を少し厚めにしておくと、当日の伝わり方が安定しそうです。",
      "内容がよく整理されていても、画面共有で文字が小さい、投影で色が見えにくい、といったことで聞き手の集中がそれることがあります。",
      "まずは、実際に見せる環境に近い状態で、文字サイズ・画面表示・共有方法を確認してみてください。"
    ]
  },
  {
    id: "material",
    name: "Material",
    label: "資料",
    comment: [
      "資料の見せ方を整えると、伝えたいポイントがより届きやすくなりそうです。",
      "必要な情報が入っていても、聞き手が「どこを見ればいいのか」「何を判断すればいいのか」をすぐにつかめない場合があります。",
      "まずは、1枚ごとに「このスライドで一番伝えたいこと」を1文で書き出してみてください。"
    ]
  },
  {
    id: "method",
    name: "Method",
    label: "伝え方",
    comment: [
      "説明の順番を少し整えると、聞き手が受け取りやすくなりそうです。",
      "内容そのものは理解されていても、結論や次の行動が後ろに隠れると、「それで何をすればよいのか」が伝わりにくくなることがあります。",
      "まずは、資料全体を「結論 → 理由 → 具体例 → 次の行動」の流れで見直してみてください。"
    ]
  },
  {
    id: "mind",
    name: "Mind",
    label: "心理",
    comment: [
      "伝え方の姿勢を整えると、提案や要望がより伝わりやすくなりそうです。",
      "相手に配慮するほど、言いたいことを控えめにしすぎてしまうことがあります。一方で、主張だけが強く見えると、受け取られ方が難しくなることもあります。",
      "まずは、「相手への配慮」と「自分の主張」を分けて書き出してみてください。"
    ]
  }
];

const questions = [
  { id: 1, axis: "man", text: "聞き手が誰で、何を知りたいのかを説明できる。" },
  { id: 2, axis: "man", text: "自分が伝えたいことだけでなく、相手が判断したいことを意識している。" },
  { id: 3, axis: "man", text: "相手の立場・知識量・関心に合わせて説明を変えている。" },
  { id: 4, axis: "machine", text: "発表で使う画面、投影環境、オンライン会議ツールを事前に確認している。" },
  { id: 5, axis: "material", text: "1枚のスライドで一番伝えたいことが明確になっている。" },
  { id: 6, axis: "material", text: "情報を入れすぎず、聞き手が判断しやすい量に絞っている。" },
  { id: 7, axis: "method", text: "結論、理由、具体例、次の行動の流れで説明できる。" },
  { id: 8, axis: "method", text: "「だから何をしてほしいのか」まで明確に伝えている。" },
  { id: 9, axis: "mind", text: "相手に配慮しながらも、緊張や遠慮で必要な主張を曖昧にしすぎない。" },
  { id: 10, axis: "mind", text: "ダメ出しや質問を受けても、資料や自分を全否定されたとは捉えすぎない。" }
];

const axisQuestionCounts = questions.reduce((counts, question) => {
  counts[question.axis] += 1;
  return counts;
}, axes.reduce((counts, axis) => {
  counts[axis.id] = 0;
  return counts;
}, {}));

const choices = [
  { value: 5, text: "とても当てはまる" },
  { value: 4, text: "やや当てはまる" },
  { value: 3, text: "どちらともいえない" },
  { value: 2, text: "あまり当てはまらない" },
  { value: 1, text: "まったく当てはまらない" }
];

const questionList = document.getElementById("question-list");
const form = document.getElementById("diagnosis-form");
const result = document.getElementById("result");
const validationMessage = document.getElementById("validation-message");
const diagnosisOutput = document.getElementById("diagnosis-output");
const scoreList = document.getElementById("score-list");
const radarChart = document.getElementById("radar-chart");
const lowestHeading = document.getElementById("lowest-heading");
const lowestAxis = document.getElementById("lowest-axis");
const commentHeading = document.getElementById("comment-heading");
const commentText = document.getElementById("comment-text");
const copyConsultation = document.getElementById("copy-consultation");
const lineGuideText = document.getElementById("line-guide-text");
const copyStatus = document.getElementById("copy-status");
const manualCopy = document.getElementById("manual-copy");
const manualCopyText = document.getElementById("manual-copy-text");
const LINE_OFFICIAL_ID = window.LINE_OFFICIAL_ID || "%40YOUR_LINE_ID";
const urlParams = new URLSearchParams(window.location.search);
const fromLine = urlParams.get("from") === "line";
const shouldResetStoredDiagnosis = urlParams.get("reset") === "1";
const SAVED_DIAGNOSIS_KEY = "presen5mLatestDiagnosis";
const CHECKLIST_VERSION = "10q-v2";
const DIAGNOSIS_STORAGE_KEYS = [SAVED_DIAGNOSIS_KEY];
let latestConsultationText = "";

function createQuestions() {
  questions.forEach((question) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question";
    fieldset.dataset.questionId = question.id;

    const legend = document.createElement("legend");
    legend.textContent = `Q${question.id}. ${question.text}`;
    fieldset.appendChild(legend);

    const choiceArea = document.createElement("div");
    choiceArea.className = "choices";

    choices.forEach((choice) => {
      const label = document.createElement("label");
      label.className = "choice";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${question.id}`;
      input.value = choice.value;

      const number = document.createElement("span");
      number.className = "choice-number";
      number.textContent = choice.value;

      const text = document.createElement("span");
      text.className = "choice-text";
      text.textContent = choice.text;

      label.appendChild(input);
      label.appendChild(number);
      label.appendChild(text);
      choiceArea.appendChild(label);
    });

    fieldset.appendChild(choiceArea);
    questionList.appendChild(fieldset);
  });
}

function getLevel(score) {
  if (score >= 13) {
    return "強み";
  }

  if (score >= 10) {
    return "おおむね良好";
  }

  if (score >= 7) {
    return "改善余地あり";
  }

  return "優先改善";
}

function getOverallComment(score) {
  if (score >= 13) {
    return "5項目すべてが高水準です。大きな弱点は見えにくい状態です。";
  }

  if (score >= 10) {
    return "5項目のバランスはおおむね良好です。次は目的や聞き手に合わせた細部の改善が有効です。";
  }

  if (score >= 7) {
    return "5項目すべてに改善余地があります。まずは資料の目的と聞き手を整理するところから始めると効果的です。";
  }

  return "5項目すべてが優先改善です。資料・構成・伝え方を一度まとめて見直す必要があります。";
}

function convertScoresToFifteenPoint(rawScores) {
  const scores = {};

  axes.forEach((axis) => {
    const maxScore = axisQuestionCounts[axis.id] * 5;
    scores[axis.id] = Math.floor(rawScores[axis.id] / maxScore * 15);
  });

  return scores;
}

function calculateScores() {
  const rawScores = {};
  const unansweredQuestions = [];

  axes.forEach((axis) => {
    rawScores[axis.id] = 0;
  });

  for (const question of questions) {
    const checked = form.querySelector(`input[name="q${question.id}"]:checked`);
    const questionBlock = questionList.querySelector(`[data-question-id="${question.id}"]`);

    questionBlock.classList.remove("is-unanswered");

    if (!checked) {
      unansweredQuestions.push(question.id);
      questionBlock.classList.add("is-unanswered");
      continue;
    }

    rawScores[question.axis] += Number(checked.value);
  }

  return {
    scores: convertScoresToFifteenPoint(rawScores),
    unansweredQuestions
  };
}

function showValidationMessage(unansweredQuestions) {
  validationMessage.innerHTML = `
    <p>未回答の質問があります。すべての質問に回答してください。</p>
    <p>未回答：${unansweredQuestions.map((id) => `Q${id}`).join("、")}</p>
  `;

  validationMessage.hidden = false;
  diagnosisOutput.hidden = true;
  result.hidden = false;
}

function getRadarPoint(index, radius, center) {
  const angle = -Math.PI / 2 + index * (Math.PI * 2 / axes.length);

  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius
  };
}

function formatSvgPoints(points) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

function drawRadarChart(scores) {
  const center = 180;
  const radius = 108;
  const labelRadius = 142;
  const maxScore = 15;
  const gridLevels = [3, 6, 9, 12, 15];
  const lowestScore = Math.min(...axes.map((axis) => scores[axis.id]));

  const gridPolygons = gridLevels.map((level) => {
    const levelRadius = radius * (level / maxScore);
    const points = axes.map((axis, index) => getRadarPoint(index, levelRadius, center));

    return `<polygon class="radar-grid" points="${formatSvgPoints(points)}"></polygon>`;
  }).join("");

  const axisLines = axes.map((axis, index) => {
    const point = getRadarPoint(index, radius, center);

    return `<line class="radar-axis" x1="${center}" y1="${center}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}"></line>`;
  }).join("");

  const scaleLabels = gridLevels.map((level) => {
    const y = center - radius * (level / maxScore);

    return `<text class="radar-scale-label" x="${center + 18}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle">${level}</text>`;
  }).join("");

  const scorePoints = axes.map((axis, index) => {
    const scoreRadius = radius * (scores[axis.id] / maxScore);

    return getRadarPoint(index, scoreRadius, center);
  });

  const scoreMarkers = scorePoints.map((point, index) => {
    const axis = axes[index];
    const isLowest = scores[axis.id] === lowestScore;
    const markerClass = isLowest ? "radar-point is-lowest" : "radar-point";
    const markerRadius = isLowest ? 7.2 : 5.2;

    return `<circle class="${markerClass}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${markerRadius}"></circle>`;
  }).join("");

  const labels = axes.map((axis, index) => {
    const point = getRadarPoint(index, labelRadius, center);
    const isLowest = scores[axis.id] === lowestScore;
    const labelClass = isLowest ? "radar-label is-lowest" : "radar-label";
    const x = point.x.toFixed(1);
    const y = point.y.toFixed(1);

    return `
      <text class="${labelClass}" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">
        <tspan x="${x}" dy="-0.35em">${axis.name}</tspan>
        <tspan class="radar-label-score" x="${x}" dy="1.25em">${scores[axis.id]}点</tspan>
      </text>
    `;
  }).join("");

  radarChart.innerHTML = `
    <svg viewBox="0 0 360 360" aria-hidden="true">
      ${gridPolygons}
      ${axisLines}
      ${scaleLabels}
      <polygon class="radar-area" points="${formatSvgPoints(scorePoints)}"></polygon>
      ${scoreMarkers}
      ${labels}
    </svg>
  `;

  radarChart.setAttribute(
    "aria-label",
    axes.map((axis) => `${axis.name} ${scores[axis.id]}点`).join("、")
  );
}

function buildConsultationText(scores) {
  const scoreValues = Object.values(scores);
  const lowestScore = Math.min(...scoreValues);
  const allScoresSame = scoreValues.every((score) => score === scoreValues[0]);
  const lowestAxes = axes.filter((axis) => scores[axis.id] === lowestScore);
  const diagnosisType = getDiagnosisType(lowestAxes, allScoresSame);
  const scoreLines = axes.map((axis) => (
    `${axis.name}（${axis.label}）：${scores[axis.id]}点 / 15点（${getLevel(scores[axis.id])}）`
  ));
  const footerLines = [
    "この診断結果をもとに、初回無料相談をお願いします。",
    "",
    "※より具体的に診断してほしい場合は、実際のスライドをお送りください。",
    "資料の目的・聞き手・構成を確認したうえで、「どこを、なぜ、どう直すか」まで整理する有料メニューをご案内できます。",
    "",
    `診断タイプ：${diagnosisType}`
  ];

  if (allScoresSame) {
    const overallComment = getOverallComment(scoreValues[0]);

    return [
      "【プレゼン5M簡易診断 結果】",
      "",
      ...scoreLines,
      "",
      `5項目同点時の総評：${overallComment}`,
      "",
      `改善コメント：${overallComment}`,
      "",
      ...footerLines
    ].join("\n");
  }

  const commentAxis = lowestAxes[0];
  const focusText = lowestAxes
    .map((axis) => `${axis.name}（${axis.label}）：${scores[axis.id]}点`)
    .join("、");

  return [
    "【プレゼン5M簡易診断 結果】",
    "",
    ...scoreLines,
    "",
    `重点改善ポイント：${focusText}`,
    "",
    "改善コメント：",
    ...commentAxis.comment,
    "",
    ...footerLines
  ].join("\n");
}

function getDiagnosisType(lowestAxes, allScoresSame) {
  if (allScoresSame || lowestAxes.length !== 1) {
    return "BALANCED";
  }

  return lowestAxes[0].id.toUpperCase();
}

function buildDisplayResultText(scores) {
  const scoreValues = Object.values(scores);
  const lowestScore = Math.min(...scoreValues);
  const allScoresSame = scoreValues.every((score) => score === scoreValues[0]);
  const lowestAxes = axes.filter((axis) => scores[axis.id] === lowestScore);

  if (allScoresSame) {
    return [
      "5項目すべてが同点です",
      `各項目 ${scoreValues[0]}点 / 15点`,
      getOverallComment(scoreValues[0])
    ].join("\n");
  }

  return [
    "最優先改善項目",
    lowestAxes
      .map((axis) => `${axis.name}：${axis.label}（${scores[axis.id]}点）`)
      .join("、"),
    "改善コメント",
    ...lowestAxes[0].comment
  ].join("\n");
}

function buildSavedDiagnosis(scores) {
  const scoreValues = Object.values(scores);
  const lowestScore = Math.min(...scoreValues);
  const allScoresSame = scoreValues.every((score) => score === scoreValues[0]);
  const lowestAxes = axes.filter((axis) => scores[axis.id] === lowestScore);

  return {
    version: CHECKLIST_VERSION,
    questionCount: questions.length,
    axisCount: axes.length,
    scores: { ...scores },
    diagnosisType: getDiagnosisType(lowestAxes, allScoresSame),
    resultText: buildDisplayResultText(scores),
    consultationText: buildConsultationText(scores),
    savedAt: new Date().toISOString()
  };
}

function hasValidSavedScores(scores) {
  if (!scores || Object.keys(scores).length !== axes.length) {
    return false;
  }

  return axes.every((axis) => (
    Number.isFinite(scores[axis.id]) &&
    scores[axis.id] >= 3 &&
    scores[axis.id] <= 15
  ));
}

function hasValidSavedMeta(savedDiagnosis) {
  return (
    savedDiagnosis.version === CHECKLIST_VERSION &&
    savedDiagnosis.questionCount === questions.length &&
    savedDiagnosis.axisCount === axes.length
  );
}

function clearSavedDiagnosisResult() {
  try {
    DIAGNOSIS_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    // 削除できない環境でも画面表示は続けます。
  }
}

function saveDiagnosisResult(scores) {
  try {
    localStorage.setItem(SAVED_DIAGNOSIS_KEY, JSON.stringify(buildSavedDiagnosis(scores)));
  } catch (error) {
    // 保存できない環境でも診断自体は続けます。
  }
}

function getSavedDiagnosisResult() {
  try {
    const savedText = localStorage.getItem(SAVED_DIAGNOSIS_KEY);

    if (!savedText) {
      return null;
    }

    const savedDiagnosis = JSON.parse(savedText);

    if (
      !savedDiagnosis ||
      !hasValidSavedMeta(savedDiagnosis) ||
      !hasValidSavedScores(savedDiagnosis.scores)
    ) {
      clearSavedDiagnosisResult();
      return null;
    }

    return savedDiagnosis;
  } catch (error) {
    clearSavedDiagnosisResult();
    return null;
  }
}

function buildLineConsultationUrl(text) {
  return `https://line.me/R/oaMessage/${LINE_OFFICIAL_ID}/?${encodeURIComponent(text)}`;
}

async function copyTextToClipboard(text) {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
}

function showManualCopy(text, message) {
  manualCopyText.value = text;
  copyStatus.textContent = message;
  copyStatus.hidden = false;
  manualCopy.hidden = false;
  manualCopyText.focus();
  manualCopyText.select();
}

function scrollToResult() {
  requestAnimationFrame(() => {
    result.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function updateLineCtaText() {
  if (fromLine) {
    lineGuideText.textContent = "診断結果をLINEに送ると、詳細なタイプ別の改善ポイントが届きます。";
    copyConsultation.textContent = "診断結果をLINEに送る";
    return;
  }

  lineGuideText.textContent = "診断結果はLINEで受け取れます。未登録の方は、友だち追加後にこのページへ戻り、「LINEで診断結果を受け取る」から診断結果を送信してください。";
  copyConsultation.textContent = "LINEで診断結果を受け取る";
}

function restoreSavedDiagnosis() {
  const savedDiagnosis = getSavedDiagnosisResult();

  if (!savedDiagnosis) {
    return;
  }

  showResult(savedDiagnosis.scores, {
    shouldSave: false,
    shouldScroll: false
  });
}

async function openLineConsultation(event) {
  event.preventDefault();

  if (!latestConsultationText) {
    return;
  }

  const lineUrl = buildLineConsultationUrl(latestConsultationText);

  copyStatus.hidden = true;
  manualCopy.hidden = true;
  manualCopyText.value = "";

  const lineWindow = window.open(lineUrl, "_blank");
  if (lineWindow) {
    lineWindow.opener = null;
  }
  const copied = await copyTextToClipboard(latestConsultationText);

  if (!lineWindow) {
    showManualCopy(
      latestConsultationText,
      "LINE公式のトーク画面を開けませんでした。この文章をコピーしてLINEに送ってください。"
    );
    return;
  }

  if (copied) {
    copyStatus.textContent = "LINE公式のトーク画面を開きました。診断結果もコピー済みです。内容を確認して、そのまま送信してください。";
    copyStatus.hidden = false;
    return;
  }

  showManualCopy(
    latestConsultationText,
    "LINE公式のトーク画面を開きました。コピーできない場合は、この文章をコピーしてLINEに送ってください。"
  );
}

function showResult(scores, options = {}) {
  const shouldSave = options.shouldSave !== false;
  const shouldScroll = options.shouldScroll !== false;
  const scoreValues = Object.values(scores);
  const lowestScore = Math.min(...scoreValues);
  const allScoresSame = scoreValues.every((score) => score === scoreValues[0]);
  const lowestAxes = axes.filter((axis) => scores[axis.id] === lowestScore);
  const highlightedAxes = allScoresSame ? [] : lowestAxes;
  const commentAxis = highlightedAxes[0];

  validationMessage.hidden = true;
  diagnosisOutput.hidden = false;
  scoreList.innerHTML = "";
  axes.forEach((axis) => {
    const score = scores[axis.id];
    const isLowest = highlightedAxes.some((lowestAxis) => lowestAxis.id === axis.id);
    const card = document.createElement("div");
    card.className = isLowest ? "score-card is-lowest" : "score-card";
    card.innerHTML = `
      <div class="score-card-header">
        <strong>${axis.name}</strong>
        <span class="score-label">${axis.label}</span>
      </div>
      <p class="score-value"><span>${score}</span>点 / 15点</p>
      <p class="score-level">${getLevel(score)}</p>
      ${isLowest ? '<p class="lowest-note">Weak point</p>' : ""}
    `;
    scoreList.appendChild(card);
  });

  drawRadarChart(scores);
  latestConsultationText = buildConsultationText(scores);
  if (shouldSave) {
    saveDiagnosisResult(scores);
  }
  commentText.innerHTML = "";
  copyStatus.hidden = true;
  manualCopy.hidden = true;
  manualCopyText.value = "";

  if (allScoresSame) {
    lowestHeading.textContent = "5項目すべてが同点です";
    lowestAxis.innerHTML = `<span class="lowest-axis-item">各項目 ${scoreValues[0]}点 / 15点</span>`;
    commentHeading.textContent = "総評";

    const paragraph = document.createElement("p");
    paragraph.textContent = getOverallComment(scoreValues[0]);
    commentText.appendChild(paragraph);
    result.hidden = false;
    if (shouldScroll) {
      scrollToResult();
    }
    return;
  }

  lowestHeading.textContent = "最優先改善項目";
  lowestAxis.innerHTML = lowestAxes
    .map((axis) => `<span class="lowest-axis-item">${axis.name}：${axis.label}（${scores[axis.id]}点）</span>`)
    .join("");
  commentHeading.textContent = "改善コメント";

  commentAxis.comment.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    commentText.appendChild(paragraph);
  });

  result.hidden = false;
  if (shouldScroll) {
    scrollToResult();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const diagnosis = calculateScores();

  if (diagnosis.unansweredQuestions.length > 0) {
    showValidationMessage(diagnosis.unansweredQuestions);
    return;
  }

  showResult(diagnosis.scores);
});

updateLineCtaText();
copyConsultation.addEventListener("click", openLineConsultation);

createQuestions();
form.reset();

if (shouldResetStoredDiagnosis) {
  clearSavedDiagnosisResult();
} else {
  restoreSavedDiagnosis();
}
