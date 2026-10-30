// MOBILE NAVIGATIOn

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


// FORM MESSAGES
// Shows a short message under a form. Used by both forms instead of alert(),
// because alert() pop-ups block the page and feel out of place on a premium site.

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

// Adds the visible text of a <select> to the list, but only if the visitor
// actually chose something (an empty value means "Select" / "Any Number").
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


// CONTACT FORM

const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    //no backend, so the message is not actually sent anywhere
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
