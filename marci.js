

const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

navToggle.addEventListener("click", function () {
    const isOpen = primaryNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);
});

// close the mobile menu after a link is tapped, so it doesn't stay open
// covering the section the user just navigated to
primaryNav.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
        primaryNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", false);
    }
});


// Photo Gallery carousel

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

goToSlide(0); // set the first dot as active on page load



// BACK TO TOP BUTTON

const backToTopButton = document.getElementById("backToTop");

window.addEventListener("scroll", function () {
    // show the button only after scrolling 
    if (window.scrollY > window.innerHeight * 0.6) {
        backToTopButton.classList.add("is-visible");
    } else {
        backToTopButton.classList.remove("is-visible");
    }
});

backToTopButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});



// PROPERTY SEARCH FORM


const propertyForm = document.getElementById("propertyForm");

propertyForm.addEventListener("submit", function (event) {
    event.preventDefault();
    alert("Property search functionality would connect to the listing database here.");
});



// CONTACT FORM


const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;

    alert("Thank you, " + name + "! Your message has been received.");

    contactForm.reset();
});