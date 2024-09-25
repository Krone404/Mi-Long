var modal = document.getElementById("languageModal");

var fromLanguageBtn = document.getElementById("from-language-btn");
var toLanguageBtn = document.getElementById("to-language-btn");

var closeBtn = document.getElementsByClassName("close")[0];

var selectedButton = null;

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
