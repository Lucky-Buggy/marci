

// MOBILE NAVIGATION

const navbar = document.querySelector(".navbar");
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

// One function opens or closes the menu, so the three things that must stay
// in sync (the menu panel, the hamburger icon, and aria-expanded) can't drift apart.
function setMenu(isOpen) {
    primaryNav.classList.toggle("is-open", isOpen);
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);

    // the header is see-through at the top of the page, so give it a solid
    // background while the dropdown is open
    navbar.classList.toggle("menu-open", isOpen);
}

navToggle.addEventListener("click", function () {
    const isOpen = !primaryNav.classList.contains("is-open");
    setMenu(isOpen);
});

// close the mobile menu after a link is tapped, so it doesn't stay open
// covering the section the user just navigated to
primaryNav.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
        setMenu(false);
    }
});

// Escape closes the menu and puts focus back on the hamburger button
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && primaryNav.classList.contains("is-open")) {
        setMenu(false);
        navToggle.focus();
    }
});


// PHOTO GALLERY CAROUSEL

const carousel = document.getElementById("galleryCarousel");
const track = carousel.querySelector(".carousel-track");
const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
const prevButton = carousel.querySelector(".carousel-prev");
const nextButton = carousel.querySelector(".carousel-next");
const dotsContainer = document.getElementById("carouselDots");

let currentSlide = 0;

// build one dot per slide so the count always matches the images above
slides.forEach(function (slide, index) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Go to photo " + (index + 1));
    dot.addEventListener("click", function () {
        goToSlide(index);
    });
    dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.children);

function goToSlide(index) {
    // wrap around instead of stopping at the ends
    if (index < 0) {
        index = slides.length - 1;
    } else if (index >= slides.length) {
        index = 0;
    }

    currentSlide = index;

    // move the track so the current slide lines up in the viewport
    track.style.transform = "translateX(-" + currentSlide * 100 + "%)";

    // update dots so only the active one is highlighted
    dots.forEach(function (dot, dotIndex) {
        dot.setAttribute("aria-current", dotIndex === currentSlide);
    });

    // "inert" switches off everything inside a slide (clicks, Tab key, screen readers),
    // so only the photo you can actually see can be focused or opened
    slides.forEach(function (slide, slideIndex) {
        slide.inert = slideIndex !== currentSlide;
    });
}

prevButton.addEventListener("click", function () {
    goToSlide(currentSlide - 1);
});

nextButton.addEventListener("click", function () {
    goToSlide(currentSlide + 1);
});

// let arrow keys move the carousel when it (or something inside it) has focus
carousel.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        goToSlide(currentSlide - 1);
    } else if (event.key === "ArrowRight") {
        goToSlide(currentSlide + 1);
    }
});

// swipe left / right on touch screens
let touchStartX = 0;

carousel.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

carousel.addEventListener("touchend", function (event) {
    const distance = event.changedTouches[0].clientX - touchStartX;

    // ignore tiny movements (a tap, or a slightly wobbly scroll)
    if (distance > 50) {
        goToSlide(currentSlide - 1);   // swiped right: go back
    } else if (distance < -50) {
        goToSlide(currentSlide + 1);   // swiped left: go forward
    }
}, { passive: true });

goToSlide(0); // set the first dot as active on page load


// BACK TO TOP BUTTON

const backToTopButton = document.getElementById("backToTop");

function updateOnScroll() {
    // show the button only after scrolling down a little
    if (window.scrollY > window.innerHeight * 0.6) {
        backToTopButton.classList.add("is-visible");
    } else {
        backToTopButton.classList.remove("is-visible");
    }

    // header: see-through at the very top, solid white once the page has moved
    navbar.classList.toggle("is-scrolled", window.scrollY > 10);
}

window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll(); // run once on load, in case the page opens already scrolled

backToTopButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});


// GALLERY LIGHTBOX
// Clicking a gallery photo opens it large in a <dialog>. The dialog element is
// built into the browser: showModal() dims the page, traps focus and lets Esc close it.

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCount = document.getElementById("lightboxCount");

function showLightboxPhoto(index) {
    // wrap around at both ends, like the carousel
    if (index < 0) {
        index = slides.length - 1;
    } else if (index >= slides.length) {
        index = 0;
    }

    const photo = slides[index].querySelector("img");
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt;
    lightboxCount.textContent = (index + 1) + " / " + slides.length;

    // keep the carousel behind the dialog on the same photo
    goToSlide(index);
}

slides.forEach(function (slide, index) {
    slide.querySelector(".slide-open").addEventListener("click", function () {
        showLightboxPhoto(index);
        lightbox.showModal();
        document.body.classList.add("lightbox-open"); // stop the page scrolling behind it
    });
});

document.getElementById("lightboxPrev").addEventListener("click", function () {
    showLightboxPhoto(currentSlide - 1);
});

document.getElementById("lightboxNext").addEventListener("click", function () {
    showLightboxPhoto(currentSlide + 1);
});

document.getElementById("lightboxClose").addEventListener("click", function () {
    lightbox.close();
});

// clicking the dark area around the photo closes it too
lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
        lightbox.close();
    }
});

// arrow keys flip through photos while the viewer is open
lightbox.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        showLightboxPhoto(currentSlide - 1);
    } else if (event.key === "ArrowRight") {
        showLightboxPhoto(currentSlide + 1);
    }
});

// "close" fires however the dialog was closed (button, backdrop or Esc key)
lightbox.addEventListener("close", function () {
    document.body.classList.remove("lightbox-open");
});


// FADE-IN AS SECTIONS SCROLL INTO VIEW
// Each element below starts slightly faded and low, then settles into place the first
// time it appears on screen. Nothing above the fold is hidden, and people who have
// turned on "reduce motion" see everything immediately.

const revealTargets = document.querySelectorAll(
    ".about-image, .about-content, .sold > div, .feature-card > *, .section-heading, " +
    ".search-form, .valley-intro, .valley-facts, .carousel, .service, " +
    ".contact-info, .contact-form, .contact-map"
);

const wantsLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !wantsLessMotion) {
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target); // only animate once
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach(function (element) {
        element.classList.add("reveal");
        revealObserver.observe(element);
    });
}


// STATS COUNT UP
// When the "Get It Sold" numbers scroll into view, they count up from 0 to their value.
// The real numbers are already in the HTML, so with no JavaScript (or with "reduce motion")
// visitors simply see the final text.

const counters = document.querySelectorAll("[data-count]");

function countUp(element) {
    const target = Number(element.dataset.count);             
    const decimals = Number(element.dataset.decimals || 0);     // how many digits after the point
    const duration = 1400;                                      // milliseconds
    const startTime = performance.now();

    function step(now) {
        // progress goes from 0 to 1 over the duration
        const progress = Math.min((now - startTime) / duration, 1);

        // "ease out": fast at first, slowing down as it reaches the target
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = (target * eased).toFixed(decimals);

        if (progress < 1) {
            requestAnimationFrame(step);   // ask the browser to call step() again next frame
        }
    }

    requestAnimationFrame(step);
}

if ("IntersectionObserver" in window && !wantsLessMotion) {
    const countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                countUp(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    counters.forEach(function (element) {
        // Freeze the width of the whole number while it still shows the real
        // text, so the layout doesn't wobble as the digits change...
        const box = element.parentElement;
        box.style.minWidth = box.offsetWidth + "px";

        // ...then start from 0 so the final number doesn't flash before it counts up.
        element.textContent = (0).toFixed(Number(element.dataset.decimals || 0));

        countObserver.observe(element);
    });
}


// FORM MESSAGES

function showFormMessage(element, text, isError) {
    element.textContent = text;
    element.classList.toggle("is-error", isError);
}


// PROPERTY SEARCH FORM

const propertyForm = document.getElementById("propertyForm");
const searchStatus = document.getElementById("searchStatus");

propertyForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const minPrice = Number(document.getElementById("minPrice").value);
    const maxPrice = Number(document.getElementById("maxPrice").value);

    // an empty box is 0, so only compare when both boxes have a value
    if (minPrice && maxPrice && minPrice > maxPrice) {
        showFormMessage(searchStatus, "Minimum price can't be higher than maximum price.", true);
        return;
    }


    const choices = [];

    addChoice(choices, "location", "");
    addChoice(choices, "type", "");
    addChoice(choices, "bedrooms", " bedrooms");
    addChoice(choices, "baths", " baths");

    if (minPrice && maxPrice) {
        choices.push("$" + minPrice.toLocaleString() + " to $" + maxPrice.toLocaleString());
    } else if (minPrice) {
        choices.push("from $" + minPrice.toLocaleString());
    } else if (maxPrice) {
        choices.push("up to $" + maxPrice.toLocaleString());
    }

    let message = "";
    if (choices.length > 0) {
        message = "Your search: " + choices.join(" \u00B7 ") + ". ";
    }

    message += "Live listings are on Marci's Zillow profile, linked below, or call (206) 919-6886.";

    showFormMessage(searchStatus, message, false);
});

function addChoice(list, selectId, suffix) {
    const select = document.getElementById(selectId);

    if (select.value !== "") {
        const text = select.options[select.selectedIndex].text;

        // add " bedrooms" / " baths" only to values like "3+", so "Studio" stays "Studio"
        if (text.endsWith("+")) {
            list.push(text + suffix);
        } else {
            list.push(text);
        }
    }
}


// SEARCH BY TOWN (quick-pick buttons) AND CLEAR FILTERS

const locationSelect = document.getElementById("location");
const townChips = document.querySelectorAll(".town-chip");

function syncTownChips() {
    townChips.forEach(function (chip) {
        const isChosen = chip.dataset.town === locationSelect.value;
        chip.setAttribute("aria-pressed", isChosen);
    });
}

townChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
        // tapping the chosen town again un-picks it
        if (locationSelect.value === chip.dataset.town) {
            locationSelect.value = "";
        } else {
            locationSelect.value = chip.dataset.town;
        }
        syncTownChips();
    });
});

// the dropdown and the buttons stay in step in both directions
locationSelect.addEventListener("change", syncTownChips);

document.getElementById("clearFilters").addEventListener("click", function () {
    propertyForm.reset();                              // every field back to its starting value
    syncTownChips();
    showFormMessage(searchStatus, "", false);          // remove any old message
});


// CONTACT FORM

const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    // this site has no backend, so the message is not actually sent anywhere
    showFormMessage(
        contactStatus,
        "Thank you, " + name + ". This demo form doesn't send messages yet, so please call (206) 919-6886.",
        false
    );

    contactForm.reset();
});


// FOOTER YEAR
// keeps the copyright year current without editing the HTML every January

document.getElementById("year").textContent = new Date().getFullYear();
