const listeningList = document.getElementById("listening-list");

function loadListeningLessons() {
  if (!listeningList) return;

  listeningList.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const number = String(i).padStart(3, "0");
    const fileName = `AH-LIV-${number}.mp3`;

    const lesson = document.createElement("div");
lesson.className = "listening-item";
    const title = document.createElement("strong");
    title.textContent = `Listening Lesson ${number}`;

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    audio.src = `./audio/${fileName}`;

    lesson.appendChild(title);
    lesson.appendChild(audio);

    listeningList.appendChild(lesson);
  }
}

loadListeningLessons();
