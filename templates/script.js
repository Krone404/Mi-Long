// const hamburger = document.getElementById("hamburger");
// const sidebar = document.getElementById("sidebar");

const modal = document.getElementById("languageModal");

const fromLanguageBtn = document.getElementById("from-language-btn");
const toLanguageBtn = document.getElementById("to-language-btn");

const closeBtn = document.getElementsByClassName("close")[0];

var selectedButton = null;

// hamburger.onclick = function() {
//     sidebar.style.display = "block";

// }

fromLanguageBtn.onclick = function() {
    modal.style.display = "block";
    selectedButton = fromLanguageBtn;
}

toLanguageBtn.onclick = function() {
    modal.style.display = "block";
    selectedButton = toLanguageBtn;
}

document.querySelectorAll(".language-list li").forEach(function(item) {
    item.onclick = function() {
        selectedButton.innerHTML = this.innerHTML;
        modal.style.display = "none";
    }
});

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
