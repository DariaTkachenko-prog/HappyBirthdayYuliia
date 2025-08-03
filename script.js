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

  const playMusic = () => {
    // Первая музыка сразу после клика
    if (openSound) {
      openSound.play().catch((err) => {
        console.error("Ошибка при воспроизведении звука открытия:", err);
      });
    }

    // Вторая музыка (фонова) будет играть после завершения первой
    if (openSound) {
      openSound.onended = () => {
        if (bgMusic) {
          bgMusic.play().catch((err) => {
            console.error("Ошибка при воспроизведении фоновой музыки:", err);
          });
        }
      };
    }
  };

  const handleClick = async () => {
    if (hasClicked) return;
    hasClicked = true;

    if (clickText) clickText.remove();
    hideSmiley();
    showBalloons();

    // Музыка начинает играть сразу
    playMusic();

    await delay(BALLOONS_SHOW_DURATION); // шары держатся 4 секунды

    await hideBalloons(); // ждем скрытия

    await delay(300); // маленькая пауза перед поздравлением

    showCongrats("dissolve");
  };

  if (smiley) {
    smiley.addEventListener("click", handleClick);
    smiley.setAttribute("tabindex", "0");

    // Для мобильных устройств добавляем событие фокуса, чтобы музыка началась при клике или фокусе на смайлике
    smiley.addEventListener("focus", (e) => {
      if (!hasClicked) {
        handleClick();
      }
    });

    smiley.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    });
  }

  // Мобильная версия: можно добавить autoplay и muted, если браузер требует
  if (window.matchMedia("(max-width: 768px)").matches) {
    // Для мобильных можно добавить autoplay и muted, если браузер этого требует
    if (openSound) openSound.autoplay = true;
    if (bgMusic) bgMusic.autoplay = true;
  }
});
