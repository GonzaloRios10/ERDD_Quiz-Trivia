document.addEventListener('DOMContentLoaded', function() {
    includeFooter(); 
    loadQuestions();
});

function includeFooter() {
    const footer = document.getElementById('footer');

    fetch('includes/footer.html')
    .then(response => response.text())
    .then(data => {
        footer.innerHTML = data;
    });
}

let questionNro = 0;
let score = 0;
let scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];

function loadQuestions() {
    const playButton = document.getElementById("play-button");
    const homeSection = document.getElementById("home");
    const questionsSection = document.getElementById("questions");
    const progressBar = document.getElementById("progress-bar");
    const footerSection = document.getElementById("footer");

    playButton.addEventListener("click", function(){
        homeSection.style.display = "none";

        loadOrReloadQuestions();

        questionsSection.style.display = "block";

        progressBar.style.display = "block";

        footerSection.style.display = "none";
    });
}

function loadOrReloadQuestions() {
    fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        const randomQuestions = getRandomSubset(data, 5);
        renderQuestions(randomQuestions);
        updateScore();
    })    
    .catch(error => {
        console.error('Error al cargar las preguntas:', error);
    });
}

function getRandomSubset(questionsData, subsetSize) {
    const shuffledQuestions = questionsData.sort(() => Math.random() - 0.5); // Baraja aleatoria
    return shuffledQuestions.slice(0, subsetSize); // Tomar solo las primeras 'subsetSize' preguntas
}

function renderQuestions(questionsData) {
    const questionsSection = document.getElementById("questions");
    //questionsData es el arreglo total, questionNro es el indice de la pregunta actual
    const currentQuestionObj = questionsData[questionNro]; 

    questionsSection.innerHTML = '';

    const container = document.createElement('div');
    container.classList.add('container'); // Agregar una clase de contenedor para limitar el ancho

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('imageContainer', 'text-center'); // Aplicamos 'text-center' para centrar la imagen
    
    const imageDiv = document.createElement('div');
    imageDiv.classList.add('imageContent');
    imageContainer.appendChild(imageDiv);

    const image = document.createElement('img');
    image.src = currentQuestionObj.image;
    image.classList.add('img-fluid'); // Hace que la imagen sea responsiva
    imageDiv.appendChild(image);

    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question', 'text-center'); // Aplicamos 'text-center' para centrar la pregunta

    const questionText = document.createElement('h2');
    questionText.textContent = currentQuestionObj.question;
    questionDiv.appendChild(questionText);

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('options', 'row', 'justify-content-center'); // Usamos 'row' y 'justify-content-center'
    
    const optionsRow1 = document.createElement('div');
    optionsRow1.classList.add('row', 'justify-content-center', 'options-row1');
    const optionsRow2 = document.createElement('div');
    optionsRow2.classList.add('row', 'justify-content-center', 'options-row2');

    currentQuestionObj.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.textContent = option;
        optionButton.classList.add('option-btn'); 
        optionButton.addEventListener("click", function() {
            checkAnswer(option, currentQuestionObj.answer, questionsData);
        });
    
        if (index < 2) { // Si el índice es 0 o 1, agregamos el botón a la primera fila
            optionButton.classList.add('col-sm-2');
            optionsRow1.appendChild(optionButton);
        } else { // Si el índice es 2, agregamos el botón a la segunda fila
            optionButton.classList.add('col-md-2');
            optionsRow2.appendChild(optionButton);
        }
    });

    optionsDiv.appendChild(optionsRow1);
    optionsDiv.appendChild(optionsRow2);
    questionDiv.appendChild(optionsDiv);

    const scoreDiv = document.createElement('div');
    scoreDiv.classList.add('score', 'text-center'); // Aplicamos 'text-center' para centrar el puntaje

    const scoreSpan = document.createElement('span');
    scoreSpan.id = 'score';
    scoreSpan.textContent = score;
    scoreDiv.appendChild(scoreSpan);
    
    const scoreHistoryDiv = document.createElement('div');
    scoreHistoryDiv.classList.add('score-history', 'text-center');

    scoreHistoryDiv.innerHTML = '';

    scoreHistory.forEach((puntaje, index) => {
        const partida = index + 1;
        const scoreItem = document.createElement('div');
        scoreItem.classList.add('score-item');
        scoreItem.textContent = `Partida ${partida}: ${puntaje} puntos`;
        scoreHistoryDiv.appendChild(scoreItem);
    });

    container.appendChild(imageContainer);
    container.appendChild(questionDiv);
    container.appendChild(scoreDiv);

    container.appendChild(scoreHistoryDiv);

    questionsSection.appendChild(container);
}

function checkAnswer(optionUser, correctAnswer, questionsData) {
    if (optionUser === correctAnswer) {
        score++;
        updateScore();
        console.log("¡Correcto!");
    } else {
        console.log("Incorrecto. La respuesta correcta es:", correctAnswer);
    }
  
    questionNro++;

    // Verifica si hay preguntas
    if (questionNro < questionsData.length) {
        renderQuestions(questionsData); 
    } else {
        alert("Completado! Tu puntuación es: " + score);
        scoreHistory.push(score);
        localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
        disableOptionsClick();
    }

    // Obtener la barra de progreso y calcular el progreso
    const progressBarFill = document.getElementById("progress-bar-fill");
    const progressPercentage = (questionNro / questionsData.length) * 100;

    // Actualizar el estilo de la barra de progreso
    progressBarFill.style.width = progressPercentage + "%";

    // Actualizar el atributo 'aria-valuenow' para lectores de pantalla
    progressBarFill.setAttribute("aria-valuenow", progressPercentage);

    // Mostrar el porcentaje de progreso como texto en la barra de progreso
    progressBarFill.textContent = progressPercentage.toFixed(2) + "%";

    // Verificar si la barra de progreso llegó al 100%
    if (progressPercentage === 100) {
        const reset = document.getElementById("reset");
        reset.style.display = "block";

        const resetBtn = document.getElementById("reset-btn");
        resetBtn.disabled = false;

        resetBtn.addEventListener("click", function(){
            resetGame();
            resetBtn.disabled = true;
        });

    }
}

function disableOptionsClick() {
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
        button.disabled = true;
    });
}

function resetGame() {
    questionNro = 0;
    score = 0;

    loadOrReloadQuestions();
    updateScore();
    resetProgressBar();
}

function resetProgressBar() {
    const progressBarFill = document.getElementById("progress-bar-fill");
    progressBarFill.style.width = "0%";
    progressBarFill.setAttribute("aria-valuenow", 0);
    progressBarFill.textContent = "0%";
}

function updateScore() {
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = score;
}

function sendEmail() {
    const btn = document.getElementById('button');
    const form = document.getElementById('form');

    form.addEventListener('submit', function(event)  {
        event.preventDefault();

        btn.value = 'Sending...';

        const serviceID = 'default_service';
        const templateID = 'template_gxkzu45';

        emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            btn.value = 'Send Email';
            form.reset();
        }, (err) => {
            btn.value = 'Send Email';
            alert(JSON.stringify(err));
        });
    });
}

sendEmail();
