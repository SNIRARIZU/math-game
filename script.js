document.addEventListener('DOMContentLoaded', function() {
    let score = 0;
    let timeLeft = 15;
    let timerInterval;
    let currentAnswer = 0;
    let currentLevel = 1;
    let questionsAnswered = 0;
    let wrongAnswers = 0;
    let tipsGiven = 0;
    let tipCooldown = false;
    let isTipActive = false; // למעקב אחרי האם טיפ פעיל

    // רשימת טיפים מעודכנת לכל רמת קושי
    const tips = {
        beginner: [
            'חיבור מספרים גדולים? התחל עם המספר הגדול ונסה להוסיף את המספר הקטן בשלבים.',
            'שימוש בקיבוץ כדי לחשב מספרים יכול להקל עליך במצבים שונים.',
            'כשמדובר בחיבור, קל יותר להתחיל מהמספר הגדול יותר.',
            'דמיין את המספרים על ציר מספרים כדי לעזור בחיבור וחיסור.'
        ],
        intermediate: [
            'פירוק מספרים לחלקים קטנים יותר יכול לעזור לבצע חישובים מסובכים בצורה פשוטה יותר.',
            'חישוב כפל יכול להיראות כמו חיבור חוזר - נסה להשתמש בו במקרים כאלה.',
            'כשמדובר בכפל עם מספרים קרובים ל-10, פירוק המספרים יכול לעזור לבצע חישוב מהיר יותר.',
            'למד להשתמש בהערכות כדי לעזור בהבנה מהירה יותר של תשובות אפשריות.'
        ],
        advanced: [
            'שברים יכולים להיראות מסובכים, אבל המרה למספרים עשרוניים עוזרת להבין אותם בצורה קלה יותר.',
            'חישוב אחוזים? זכרו שאחוז הוא חלק מתוך 100.',
            'חילוק ארוך הוא כמו פירוק הבעיה לשלבים - חישוב כל שלב בנפרד.',
            'כדי לחשב אחוזים במהירות, חלק את המספר השלם ל-100 חלקים שווים.'
        ],
        wordProblems: [
            'בפתרון בעיות מילוליות, חשוב לקרוא בעיון ולהדגיש את הנתונים החשובים.',
            'פירוק הבעיה לשלבים קטנים יותר עוזר להבין את הבעיה בצורה ברורה יותר.',
            'סמן את כל הנתונים המספריים בבעיה כדי להבין את האפשרויות לפתרון.',
            'התייחס לבעיה כאל סיפור - הדמיה יכולה לעזור להבין את הסיטואציה ולהתמקד בפתרון.'
        ]
    };

    // פונקציה ליצירת שאלה בהתאם לרמת הקושי
    function generateQuestion(level) {
        let num1, num2, question;
        const questionElement = document.getElementById('question');
        const answerInput = document.getElementById('answer-input');
        answerInput.value = '';

        if (Math.random() > 0.5 && level !== 'beginner') {
            // יצירת בעיה מילולית עבור רמות בינוניות ומתקדמות
            const people = ['טל', 'נועה', 'דוד', 'שירה'];
            const items = ['תפוחים', 'עפרונות', 'מחברות', 'כדורים'];
            const actions = ['קנה', 'אסף', 'קיבל', 'מצא'];
            const person = people[Math.floor(Math.random() * people.length)];
            const item = items[Math.floor(Math.random() * items.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
            currentAnswer = num1 * num2;
            question = `${person} ${action} ${num1} חבילות של ${item}, כאשר בכל חבילה יש ${num2} ${item}. כמה ${item} יש לו/ה בסך הכל?`;
        } else {
            // יצירת שאלה רגילה
            switch (level) {
                case 'beginner':
                    num1 = Math.floor(Math.random() * 10) + 1;
                    num2 = Math.floor(Math.random() * 10) + 1;
                    currentAnswer = num1 + num2;
                    question = `מהו ${num1} + ${num2}?`;
                    timeLeft = 20;
                    break;
                case 'intermediate':
                    num1 = Math.floor(Math.random() * 50) + 1;
                    num2 = Math.floor(Math.random() * 50) + 1;
                    currentAnswer = num1 * num2;
                    question = `מהו ${num1} × ${num2}?`;
                    timeLeft = 25;
                    break;
                case 'advanced':
                    num1 = Math.floor(Math.random() * 100) + 1;
                    num2 = Math.floor(Math.random() * 50) + 1;
                    const operation = Math.random() > 0.5 ? '÷' : '-';
                    if (operation === '÷') {
                        currentAnswer = Math.floor(num1 / num2);
                        question = `מהו ${num1} ÷ ${num2} (עיגול כלפי מטה)?`;
                    } else {
                        currentAnswer = num1 - num2;
                        question = `מהו ${num1} - ${num2}?`;
                    }
                    timeLeft = 30;
                    break;
            }
        }

        questionElement.innerText = question;
    }

    // פונקציה להתחלת הטיימר
    function startTimer() {
        clearInterval(timerInterval);
        const timerElement = document.getElementById('timer');
        timerElement.innerText = timeLeft;

        timerInterval = setInterval(function() {
            if (!isTipActive) { // עצירת הטיימר כאשר טיפ פעיל
                timeLeft--;
                timerElement.innerText = timeLeft;
                if (timeLeft <= 5) {
                    timerElement.style.color = 'red';
                } else {
                    timerElement.style.color = 'black';
                }
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    showPopup('הזמן נגמר! נסה שוב.', 'error');
                    wrongAnswers++;
                    if (!tipCooldown) {
                        showTipOnWrong();
                        tipCooldown = true;
                        setTimeout(() => { tipCooldown = false; }, 5000); // מניעת הצפת טיפים למשך 5 שניות
                    }
                    generateQuestion(document.getElementById('difficulty-select').value);
                    startTimer();
                }
            }
        }, 1000);
    }

    // פונקציה לבדוק את התשובה
    function checkAnswer() {
        const feedbackElement = document.getElementById('feedback');
        const userAnswer = parseInt(document.getElementById('answer-input').value);

        if (userAnswer === currentAnswer) {
            feedbackElement.innerText = 'תשובה נכונה!';
            feedbackElement.style.color = 'green';
            score += 10 + timeLeft; // בונוס זמן
            questionsAnswered++;
            wrongAnswers = 0; // איפוס כמות תשובות שגויות
            document.getElementById('score').innerText = score;

            // הצגת טיפ אם הגיע הזמן
            showTipOnCorrect();

            // בדיקת התקדמות לשלב הבא
            if (questionsAnswered >= 5) {
                advanceLevel();
            } else {
                generateQuestion(document.getElementById('difficulty-select').value); // יצירת שאלה חדשה לאחר תשובה נכונה
                startTimer();
            }
        } else {
            feedbackElement.innerText = 'תשובה שגויה, נסו שוב.';
            feedbackElement.style.color = 'red';
            wrongAnswers++;
            if (!tipCooldown) {
                showTipOnWrong(); // הצגת טיפ לאחר תשובה שגויה
                tipCooldown = true;
                setTimeout(() => { tipCooldown = false; }, 5000); // מניעת הצפת טיפים למשך 5 שניות
            }
        }
    }

    // פונקציה להתקדמות לשלב הבא
    function advanceLevel() {
        currentLevel++;
        questionsAnswered = 0;
        showPopup(`כל הכבוד! הגעת לשלב ${currentLevel}!`, 'success');
        if (currentLevel === 2) {
            document.getElementById('difficulty-select').value = 'intermediate';
        } else if (currentLevel === 3) {
            document.getElementById('difficulty-select').value = 'advanced';
        }
        generateQuestion(document.getElementById('difficulty-select').value);
        startTimer();
    }

    // פונקציה להצגת טיפ כחלון קופץ לאחר תשובה שגויה
    function showTipOnWrong() {
        const level = document.getElementById('difficulty-select').value;
        const levelTips = tips[level];
        const randomTip = levelTips[Math.floor(Math.random() * levelTips.length)];
        showPopup(`טיפ: ${randomTip}`, 'info');
    }

    // פונקציה להצגת טיפ לאחר תשובות נכונות
    function showTipOnCorrect() {
        if ((questionsAnswered === 3 && tipsGiven < 1) || (questionsAnswered === 8 && tipsGiven < 2) || (questionsAnswered === 18 && tipsGiven < 3)) {
            const level = document.getElementById('difficulty-select').value;
            const levelTips = tips[level];
            const randomTip = levelTips[Math.floor(Math.random() * levelTips.length)];
            showPopup(`טיפ: ${randomTip}`, 'info');
            tipsGiven++;
        }
    }

    // פונקציה להצגת הודעות קופצות מעוצבות
    function showPopup(message, type) {
        isTipActive = true; // סימון שטיפ פעיל
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        const popup = document.createElement('div');
        popup.className = `popup ${type}`;
        popup.innerHTML = `<p>${message}</p><button class="close-popup">דלג</button>`;
        popupOverlay.appendChild(popup);
        document.body.appendChild(popupOverlay);

        setTimeout(() => {
            popup.classList.add('visible');
        }, 100);

        // כפתור דלג לסגירת החלון הקופץ
        const closeButton = popup.querySelector('.close-popup');
        closeButton.addEventListener('click', () => {
            closePopup(popupOverlay);
        });
    }

    // פונקציה לסגירת החלון הקופץ
    function closePopup(popupOverlay) {
        const popup = popupOverlay.querySelector('.popup');
        popup.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(popupOverlay);
            isTipActive = false; // הסרת הסימון לאחר סגירת הטיפ
        }, 300);
    }

    // הוספת סגנונות לחלון הקופץ
    const style = document.createElement('style');
    style.innerHTML = `
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .popup {
            position: relative;
            max-width: 80%;
            padding: 30px;
            background-color: #fff;
            color: #333;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            transform: translateY(-20px);
        }
        .popup.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .popup.success {
            border-left: 10px solid #4CAF50;
        }
        .popup.error {
            border-left: 10px solid #f44336;
        }
        .popup.info {
            border-left: 10px solid #2196F3;
        }
        .close-popup {
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: #fff;
            border: none;
            cursor: pointer;
            border-radius: 5px;
        }
        .close-popup:hover {
            background-color: #45a049;
        }
    `;
    document.head.appendChild(style);

    // האזנה לכפתור התחלת המשחק
    const startButton = document.getElementById('start-btn');
    startButton.addEventListener('click', function() {
        document.getElementById('level-selection').style.display = 'none';
        document.getElementById('game-section').style.display = 'block';
        generateQuestion(document.getElementById('difficulty-select').value);
        startTimer();
    });

    // האזנה לכפתור שליחת תשובה
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', checkAnswer);

    // האזנה לכפתורי המקלדת הווירטואלית
    const virtualKeyboard = document.querySelector('.virtual-keyboard');
    const answerInput = document.getElementById('answer-input');
    virtualKeyboard.addEventListener('click', function(event) {
        if (event.target.classList.contains('key')) {
            const keyValue = event.target.getAttribute('data-value');
            if (keyValue === 'clear') {
                answerInput.value = '';
            } else if (keyValue === 'submit') {
                checkAnswer();
            } else {
                answerInput.value += keyValue;
                answerInput.focus();
            }
        }
    });

    // עיצוב מקלדת וירטואלית עם כפתורים גדולים ומעוצבים
    const keyboardKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'submit'];
    virtualKeyboard.innerHTML = '';
    keyboardKeys.forEach((key, index) => {
        const keyButton = document.createElement('div');
        keyButton.classList.add('key');
        keyButton.setAttribute('data-value', key);
        keyButton.innerText = key === 'clear' ? 'נקה' : key === 'submit' ? 'שלח' : key;
        virtualKeyboard.appendChild(keyButton);
    });

    // סידור מחדש של הכפתורים
    virtualKeyboard.style.display = 'grid';
    virtualKeyboard.style.gridTemplateColumns = 'repeat(3, 1fr)';
    virtualKeyboard.style.gap = '10px';
    virtualKeyboard.style.justifyContent = 'center';
    virtualKeyboard.style.marginTop = '20px';
    document.getElementById('answer-input').style.fontSize = '24px';
    document.getElementById('answer-input').style.textAlign = 'center';
    document.getElementById('answer-input').style.padding = '10px';
    document.getElementById('answer-input').style.marginBottom = '20px';
    document.getElementById('answer-input').style.width = '80%';
    document.getElementById('answer-input').style.display = 'block';
    document.getElementById('answer-input').readOnly = true; // מניעת הופעת המקלדת הווירטואלית של המכשיר
});
