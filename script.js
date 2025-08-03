document.addEventListener("DOMContentLoaded", () => {
  const smiley = document.getElementById("smiley");
  const balloonsContainer = document.getElementById("balloons");
  const clickText = document.querySelector(".click-text");
  const congratsWrapper = document.querySelector(".congrats-wrapper");
  const openSound = document.getElementById("open-sound");
  const bgMusic = document.getElementById("bg-music");

  let hasClicked = false;

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const BALLOONS_SHOW_DURATION = 4000; // шары будут видны 4 секунды
  const BALLOONS_HIDE_TRANSITION = 700; // должен соответствовать transition в CSS для #balloons

  const showBalloons = () => {
    if (!balloonsContainer) return;
    console.log("Показ шаров");
    balloonsContainer.classList.remove("hidden");
    // форсируем reflow, чтобы transition отработал
    void balloonsContainer.offsetWidth;
    balloonsContainer.classList.add("show");
  };

  const hideBalloons = async () => {
    if (!balloonsContainer) return;
    console.log("Скрытие шаров");
    balloonsContainer.classList.remove("show");
    // дождаться конца transition, чтобы потом поставить hidden
    await delay(BALLOONS_HIDE_TRANSITION);
    if (balloonsContainer) {
      balloonsContainer.classList.add("hidden");
    }
  };

  const hideSmiley = () => {
    if (!smiley) return;
    console.log("Скрытие смайлика");
    smiley.classList.add("hidden");
    smiley.setAttribute("aria-hidden", "true");
    smiley.style.pointerEvents = "none";
  };

  const showCongrats = (effect = "dissolve") => {
    if (!congratsWrapper) return;
    console.log("Показываем поздравление");
    // очистим предыдущее состояние
    congratsWrapper.classList.remove("hidden", "show-dissolve", "show-flyin", "pre-flyin");

    if (effect === "flyin") {
      congratsWrapper.classList.add("pre-flyin");
    }

    requestAnimationFrame(() => {
      if (effect === "flyin") {
        congratsWrapper.classList.add("show-flyin");
      } else {
        congratsWrapper.classList.add("show-dissolve");
      }

      const lines = congratsWrapper.querySelectorAll(".line");
      lines.forEach((line, idx) => {
        setTimeout(() => {
          line.classList.add("visible");
        }, idx * 180 + 100);
      });
    });
  };

  // Функция для воспроизведения музыки в последовательности
  const playFirstThenSecondMusic = () => {
    return new Promise((resolve, reject) => {
      if (openSound) {
        console.log("Воспроизведение первой музыки...");
        openSound.play().then(() => {
          // Когда первый звук закончится, начинаем воспроизведение второго
          openSound.onended = () => {
            console.log("Первая музыка закончена. Запуск второй...");
            if (bgMusic) {
              bgMusic.play().then(resolve).catch(reject); // Воспроизводим второй трек
            }
          };
        }).catch(reject);
      } else {
        reject("Ошибка: файл первой музыки не найден!");
      }
    });
  };

  const handleClick = async () => {
    if (hasClicked) return;
    hasClicked = true;

    if (clickText) clickText.remove();
    hideSmiley();
    showBalloons();

    try {
      // Воспроизведение первой музыки и затем второй
      await playFirstThenSecondMusic();
    } catch (err) {
      console.error("Ошибка при воспроизведении музыки:", err);
    }

    await delay(BALLOONS_SHOW_DURATION); // шары держатся 4 секунды

    await hideBalloons(); // ждем скрытия

    await delay(300); // маленькая пауза перед поздравлением

    showCongrats("dissolve");
  };

  if (smiley) {
    smiley.addEventListener("click", handleClick);
    smiley.setAttribute("tabindex", "0");
    smiley.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    });
  }
});

