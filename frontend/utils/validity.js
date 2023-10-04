export default (targetEl, isValid, validityText, otherEl) => {
  const targetContainer = $(targetEl).closest("div");
  let feedbackEl = targetContainer.children(".feedback");
  if (targetContainer.hasClass("iti"))
    feedbackEl = targetContainer.siblings(".feedback");
  const showPassEl = targetContainer.children("span");
  if (otherEl) {
    const otherElContainer = $(otherEl).closest("div");
    const feedbackEl = otherElContainer.children(".feedback");
    const showPassEl = otherElContainer.children("span");

    $(otherEl).addClass(`is-valid`);
    $(otherEl).removeClass(`is-invalid`);
    feedbackEl.addClass(`valid-feedback`).text(validityText);
    feedbackEl.removeClass(`invalid-feedback`);
    // showPassEl[0] &&
    //   (showPassEl[0].style =
    //     "transform :translateY(-100%) translateX(-8px) !important");
  }

  if (isValid === null) {
    $(targetEl).removeClass(`is-invalid`);
    feedbackEl.removeClass(`invalid-feedback`).text("");
    $(targetEl).removeClass(`is-valid`);
    feedbackEl.removeClass(`valid-feedback`).text("");
    showPassEl[0] && (showPassEl[0].style = "");
  } else if (isValid) {
    $(targetEl).addClass(`is-valid`);
    $(targetEl).removeClass(`is-invalid`);
    feedbackEl.addClass(`valid-feedback`).text(validityText);
    feedbackEl.removeClass(`invalid-feedback`);
    showPassEl[0] &&
      (showPassEl[0].style =
        "transform :translateY(70%) translateX(-8px) !important");
  } else {
    $(targetEl).addClass(`is-invalid`);
    $(targetEl).removeClass(`is-valid`);
    feedbackEl
      .addClass(`invalid-feedback`)
      .text(validityText)
      .css({ display: "block" });
    feedbackEl.removeClass(`valid-feedback`);
    showPassEl[0] &&
      (showPassEl[0].style =
        "transform :translateY(70%) translateX(-8px) !important");
  }
};
