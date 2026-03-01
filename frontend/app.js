document.addEventListener('DOMContentLoaded', () => {

    // --- Selectors ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const fileInfo = document.getElementById('file-info');
    const fileNameSpan = document.getElementById('file-name');
    const uploadBtn = document.getElementById('upload-btn');
    const errorMsg = document.getElementById('error-message');

    // Sections
    const uploadSection = document.getElementById('upload-section');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');

    // Results content
    const summaryContent = document.getElementById('summary-content');
    const quizSlides = document.getElementById('quiz-slides');
    const questionCountDisplay = document.getElementById('question-count');
    const scoreDisplay = document.getElementById('score-display');
    const quizProgress = document.getElementById('quiz-progress');

    // Quiz Controls
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackPanel = document.getElementById('feedback-panel');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackDesc = document.getElementById('feedback-desc');

    let selectedFile = null;
    let quizData = [];
    let currentSlide = 0;
    let score = 0;
    let userAnswers = [];

    // --- File Selection Logic ---
    browseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
        errorMsg.classList.add('hidden');
        if (!file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
            showError("Please upload a .txt or .pdf file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError("File is too large. Max 5MB allowed.");
            return;
        }
        selectedFile = file;
        fileNameSpan.textContent = file.name;
        dropZone.classList.add('hidden');
        fileInfo.classList.remove('hidden');
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    // --- Upload and Polling Logic ---
    uploadBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // UI Transition
        uploadSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');

        try {
            await startUpload();
        } catch (error) {
            loadingSection.classList.add('hidden');
            uploadSection.classList.remove('hidden');
            showError("Failed to connect to the server.");
            console.error(error);
        }
    });

    async function startUpload() {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        if (data.status === 'processing' || data.status === 'ready') {
            pollServer();
        } else {
            throw new Error("Unexpected server response.");
        }
    }

    async function pollServer() {
        // Send the same file again (or file hash endpoint ideally, but we reuse the upload route based on current API design)
        // Since the current backend relies on body hash, we send the body again.

        const pollInterval = setInterval(async () => {
            try {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (data.error) {
                    clearInterval(pollInterval);
                    throw new Error(data.error);
                }

                if (data.status === 'ready') {
                    clearInterval(pollInterval);
                    if (data.data.error) {
                        loadingSection.classList.add('hidden');
                        uploadSection.classList.remove('hidden');
                        showError(data.data.error);
                        return;
                    }
                    renderResults(data.data);
                }

            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);
    }

    // --- Rendering Results ---
    function renderResults(data) {
        // Prepare Data
        quizData = data.questions || [];
        userAnswers = new Array(quizData.length).fill(null);
        currentSlide = 0;
        score = 0;

        // Render Summary (simple text split by newline for paragraphs)
        const summaryHtml = (data.summary || "No summary provided.")
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
            .join('');
        summaryContent.innerHTML = summaryHtml;

        // Render Quiz
        renderSlide();

        // UI Transition
        loadingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    }

    // --- Quiz Logic ---
    function renderSlide() {
        quizSlides.innerHTML = '';
        const q = quizData[currentSlide];

        if (!q) return;

        const slide = document.createElement('div');
        slide.className = 'slide-in-right';

        const qText = document.createElement('div');
        qText.className = 'question-text';
        qText.textContent = `${currentSlide + 1}. ${q.question}`;
        slide.appendChild(qText);

        const optsContainer = document.createElement('div');
        optsContainer.className = 'options-container';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;

            // If already answered
            if (userAnswers[currentSlide] !== null) {
                btn.disabled = true;
                const isSelected = userAnswers[currentSlide] === idx;
                const isCorrectAns = q.answer.startsWith(String.fromCharCode(65 + idx)); // A, B, C, D

                if (isSelected) {
                    btn.classList.add(isCorrectAns ? 'correct' : 'incorrect');
                } else if (isCorrectAns) {
                    btn.classList.add('correct');
                }
            } else {
                btn.addEventListener('click', () => handleAnswer(idx, q.answer.startsWith(String.fromCharCode(65 + idx)), btn));
            }

            optsContainer.appendChild(btn);
        });

        slide.appendChild(optsContainer);
        quizSlides.appendChild(slide);

        updateQuizUI();
    }

    function handleAnswer(selectedIndex, isCorrect, clickedBtn) {
        userAnswers[currentSlide] = selectedIndex;

        // Disable all options
        const btns = document.querySelectorAll('.option-btn');
        btns.forEach((b, i) => {
            b.disabled = true;
            if (i === selectedIndex && !isCorrect) {
                b.classList.add('incorrect');
            }
            if (quizData[currentSlide].answer.startsWith(String.fromCharCode(65 + i))) {
                b.classList.add('correct');
            }
        });

        if (isCorrect) score++;

        showFeedback(isCorrect, quizData[currentSlide].explanation);
        updateQuizUI();

        // Auto next
        if (currentSlide < quizData.length - 1 && isCorrect) {
            setTimeout(() => {
                nextBtn.removeAttribute('disabled');
            }, 500);
        }
    }

    function showFeedback(isCorrect, explanation) {
        feedbackPanel.className = `feedback-panel ${isCorrect ? 'correct-panel' : 'incorrect-panel'} slide-in-right`;
        feedbackTitle.textContent = isCorrect ? '✨ Correct!' : '❌ Not quite!';
        feedbackDesc.textContent = explanation || '';
    }

    function hideFeedback() {
        feedbackPanel.className = 'feedback-panel hidden';
    }

    function updateQuizUI() {
        questionCountDisplay.textContent = `Question ${currentSlide + 1} of ${quizData.length}`;
        scoreDisplay.textContent = `Score: ${score}`;

        const progress = ((currentSlide + 1) / quizData.length) * 100;
        quizProgress.style.width = `${progress}%`;

        prevBtn.disabled = currentSlide === 0;

        // Only allow next if answered
        nextBtn.disabled = userAnswers[currentSlide] === null || currentSlide === quizData.length - 1;

        if (userAnswers[currentSlide] !== null) {
            const q = quizData[currentSlide];
            const isCorrectAns = q.answer.startsWith(String.fromCharCode(65 + userAnswers[currentSlide]));
            showFeedback(isCorrectAns, q.explanation);
        } else {
            hideFeedback();
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            renderSlide();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < quizData.length - 1) {
            currentSlide++;
            renderSlide();
        }
    });
});
