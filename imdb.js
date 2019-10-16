function getMovieDetails() {
  return {
    name: document.querySelector(".title_wrapper > h1").innerText,
    description: document.querySelector(".summary_text").innerText,
    thumbnail: document.querySelector(".slate_wrapper .poster img").src,
    rating: parseFloat(
      document.querySelector('[itemprop="ratingValue"]').innerText
    ),
    ratingBase: 10,
    reviewsCount: parseFloat(
      document
        .querySelector(
          ".titleReviewBarItem.titleReviewbarItemBorder .subText > a:first-of-type"
        )
        .innerText.replace(" user", "")
        .replace(",", "")
    ),
    duration: document
      .querySelector(".title_wrapper > .subtext > time")
      .innerText.trim()
      .replace("h", "")
      .replace("min", "")
      .split(" ")
      .reduce((total, current, index) => {
        if (index === 0) return total + Number(current) * 3600;
        if (index === 1) return total + Number(current) * 60;
        return total;
      }, 0),
    genres: Array.from(
      document.querySelectorAll(
        ".title_wrapper > .subtext > a:not(:last-of-type)"
      )
    ).map(a => a.innerText.toLowerCase()),
    releasedAt: new Date(
      document
        .querySelector(".title_wrapper > .subtext > a:last-of-type")
        .innerText.replace(/ \(.+\)/, "")
    ).toISOString()
  };
}

function getDetailedReviews() {
  const items = Array.from(document.querySelectorAll(".lister-item-content"));

  return items.map(item => ({
    title: item.querySelector(".title").innerText,
    author: item.querySelector(".display-name-date > .display-name-link > a")
      .innerText,
    score: item.querySelector(".ipl-star-icon + span")
      ? item.querySelector(".ipl-star-icon + span").innerText
      : null,
    content: item.querySelector(".content > .text").innerHTML
  }));
}
