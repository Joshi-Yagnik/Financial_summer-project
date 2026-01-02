const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-IN';
recognition.continuous = true;

const synth = window.speechSynthesis;
let isListening = false;

function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    synth.speak(utter);
}

function toggleListening(shouldStart = null) {
    if (shouldStart === true || (shouldStart === null && !isListening)) {
        recognition.start();
        isListening = true;
        localStorage.setItem("voiceActive", "true");
        document.getElementById("micIcon").textContent = "🎤"; // mic on
        speak("Now I am listening");
        console.log("Voice assistant started");

    } else {
        recognition.stop();
        isListening = false;
        localStorage.setItem("voiceActive", "false");
        document.getElementById("micIcon").textContent = "🎙️"; // mic off
        speak("Voice assistant turned off");
        console.log("Voice assistant stopped");
    }
}

recognition.onresult = function (event) {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log("Heard:", transcript);
    handleCommand(transcript);
};

recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    speak("An error occurred. Turning off.");
    toggleListening(false);
};

const isPagesDir = window.location.pathname.includes('/pages/');

function navigateTo(page) {
    if (isPagesDir) {
        window.location.href = page;
    } else {
        window.location.href = "pages/" + page;
    }
}

function handleCommand(cmd) {
    if (cmd.includes("add account")) {
        speak("Opening create account form");
        navigateTo("CreateAccount.html");

    } else if (cmd.includes("open assets")) {
        speak("Opening assets page");
        navigateTo("assets.html");

    } else if (cmd.includes("open equity")) {
        speak("Opening equity page");
        navigateTo("Equity.html");

    } else if (cmd.includes("open favorites") || cmd.includes("open favorit")) {
        speak("Opening favorites page");
        navigateTo("favorites.html");

    } else if (cmd.includes("open settings")) {
        speak("Opening settings page");
        navigateTo("settings.html");

    } else if (cmd.includes("open savings account")) {
        speak("Opening savings-account page");
        navigateTo("savings-account.html");

    } else if (cmd.includes("open cash in wallet")) {
        speak("Opening cash-in-wallet page");
        navigateTo("cash-in-wallet.html");

    } else if (cmd.includes("open checking account")) {
        speak("Opening checking-account page");
        navigateTo("checking-account.html");

    } else if (cmd.includes("open general")) {
        speak("Opening general page");
        navigateTo("general.html");

    } else if (cmd.includes("open accounts")) {
        speak("Opening accounts page");
        navigateTo("accountsgnucash.html");

    } else if (cmd.includes("open manage books")) {
        speak("Opening managebooks page");
        navigateTo("gnumanagebooks.html");

    } else if (cmd.includes("open main page") || cmd.includes("main menu")) {
        speak("Opening main page");
        navigateTo("All.html");

    } else if (cmd.includes("open Transactions") || cmd.includes("open transaction ")) {
        speak("Opening Transactions page");
        navigateTo("gnuTransactions.html");

    } else if (cmd.includes("open Backup & export") || cmd.includes("open backup and export") || cmd.includes("open backup")) {
        speak("Opening Backup & export page");
        navigateTo("gnuBACKUPPrefernces.html");

    } else if (cmd.includes("open About GnuCash") || cmd.includes("open about gnu cash") || cmd.includes("open about")) {
        speak("Opening About GnuCash page");
        navigateTo("AboutGnuCash.html");

    } else if (cmd.includes("go back") || cmd.includes("back to main page")) {
        speak("Going back");
        window.history.back(); // ← GO BACK TO PREVIOUS PAGE

    } else if (cmd.includes("what is the time")) {
        const time = new Date().toLocaleTimeString();
        speak("The time is " + time);

    } else if (cmd.includes("what is the date") || cmd.includes("today's date")) {
        const date = new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        speak("Today is " + date);

    } else if (cmd.includes("thank you")) {
        speak("You're most welcome, Joshi Sir");

    } else {
        speak("Sorry, I didn't understand that command.");
    }
}

// 🟢 Auto start if previously active
if (localStorage.getItem("voiceActive") === "true") {
    toggleListening(true);
}
