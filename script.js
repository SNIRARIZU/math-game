document.addEventListener('DOMContentLoaded', function() {
    let score = 0;
    let timeLeft = 15;
    let timerInterval;
    let currentAnswer = 0;
    let currentLevel = 1;
    let questionsAnswered = 0;
    let wrongAnswers = 0;
    let tipsGiven = 0;
    let tipCooldown = false; // משתנה למניעת הצפת טיפים

    // רשימת טיפים לכל רמת קושי
    const tips = {
        beginner: [
            'לחיבור מספרים קטנים, נסה להשתמש באצבעותיך.',
            'התחל תמיד מהמספר הגדול יותר כדי להקל על החישוב.',
            'חישוב בעזרת קיבוץ מספרים קרובים עוזר להקל על המשימה.',
            'אם יש לך 10 ועוד מספר קטן, נסה לדמיין את המספר על ציר המספרים.'
        ],
        intermediate: [
            'נסה לפרק מספרים גדולים לחלקים קטנים יותר.',
            'כפל הוא בעצם חיבור מספר פעמים, נסה לחשב בצורה כזו.',
            'כאשר יש לך כפל במספרים קרובים ל-10, נסה להשתמש בפירוק ל-10 ועוד חלק קטן.',
            'כאשר מחלקים מספרים, חשוב לזכור לחלק קודם את החלקים הגדולים ולראות אם התוצאה קרובה.'
        ],
        advanced: [
            'לשברים, נסה להמיר אותם למספרים עשרוניים כדי להקל על החישוב.',
            'אחוזים הם חלק מ-100, נסה לחשוב עליהם ככאלה.',
            'במקרה של חילוק ארוך, נסה לפרק את המספרים ולחשב כל חלק בנפרד.',
            'חישוב אחוזים יכול להיות פשוט יותר אם תחלק את השלם ל-100 חלקים שווים.'
        ],
        wordProblems: [
            'קרא את הבעיה בקפידה והדגש את המידע החשוב.',
            'נסה לפרק את הבעיה לשלבים קטנים יותר כדי לפתור אותה.',
            'סמן את כל הנתונים המספריים בבעיה כדי לראות מה ניתן לעשות איתם.',
            'חשוב על הבעיה כמו סיפור, ודמיין את הסיטואציה כדי להבין טוב יותר.'
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
        const popup = document.createElement('div');
        popup.className = `popup ${type}`;
        popup.innerText = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('visible');
        }, 100);

        setTimeout(() => {
            popup.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 300);
        }, 4000);
    }

    // הוספת סגנונות לחלון הקופץ
    const style = document.createElement('style');
    style.innerHTML = `
        .popup {
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: #333;
            color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            z-index: 1000;
        }
        .popup.visible {
            opacity: 1;
            transform: translate(-50%, -40%);
        }
        .popup.success {
            background-color: #4CAF50;
        }
        .popup.error {
            background-color: #f44336;
        }
        .popup.info {
            background-color: #2196F3;
        }

        @media (max-width: 600px) {
            .container {
                width: 95%;
                padding: 10px;
            }

            #question {
                font-size: 20px;
            }

            .key {
                font-size: 18px;
                padding: 15px;
            }

            #answer-input {
                width: 90%;
                font-size: 20px;
            }
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
});
