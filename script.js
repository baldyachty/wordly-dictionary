const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('search-input')
const wordTitle = document.getElementById('word-title')
const phoneticText = document.getElementById('phonetic-text')
const statusMessage = document.getElementById('status-message')
const definitionsContainer = document.getElementById('definitions-container')
const audioBtn = document.getElementById('audio-btn');
let currentAudio = null
const favoriteBtn = document.getElementById('favorite-btn');
const favoritesList = document.getElementById('favorites-list');


let favorites = [];
let currentSearchedWord = '';



console.log("Script is connected ")
searchForm.addEventListener('submit', function (event) {
    event.preventDefault()
    const word = searchInput.value.trim()
    if (!word) {
        statusMessage.textContent = 'Please enter a word to search.'
        return;
    }
    statusMessage.textContent = 'Loading...'
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`).then(function (response) {
        if (!response.ok) {
            throw new Error('Word not found. Please check the spelling and try again.');
        }
        return response.json();
    })
        .then(function (data) {
            statusMessage.textContent = ''
            const wordInfo = data[0]
            currentSearchedWord = wordInfo.word
            wordTitle.textContent = wordInfo.word
            const phoneticWithText = (wordInfo.phonetics || []).find(function (p) {
                return p.text && p.text.trim() !== '';
            });
            phoneticText.textContent = wordInfo.phonetic || (phoneticWithText ? phoneticWithText.text : 'Pronunciation not available');

            favoriteBtn.style.display = 'inline-block';
            favoriteBtn.textContent = favorites.includes(currentSearchedWord) ? 'Saved in Favorites' : 'Save to Favorites';

            const phoneticWithAudio = (wordInfo.phonetics || []).find(function (p) {
                return p.audio && p.audio.trim() !== '';
            });

            audioBtn.style.display = 'inline-block';

            if (phoneticWithAudio) {
                currentAudio = new Audio(phoneticWithAudio.audio);
            } else {
                currentAudio = null;
            }

            audioBtn.onclick = function () {
                if (currentAudio && currentAudio.readyState >= 2) {
                    currentAudio.play();
                } else {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(wordInfo.word);
                    window.speechSynthesis.speak(utterance);
                }
            };
            definitionsContainer.innerHTML = ''
            wordInfo.meanings.forEach(function (meaning) {
                const meaningDiv = document.createElement('div');
                meaningDiv.classList.add('meaning-block');

                const partOfSpeechTitle = document.createElement('h3');
                partOfSpeechTitle.textContent = meaning.partOfSpeech;
                meaningDiv.appendChild(partOfSpeechTitle);

                const defsList = document.createElement('ol');

                meaning.definitions.forEach(function (defItem) {
                    const listItem = document.createElement('li');
                    listItem.textContent = defItem.definition;

                    if (defItem.example) {
                        const exampleText = document.createElement('p');
                        exampleText.textContent = `"${defItem.example}"`;
                        exampleText.style.fontStyle = 'italic';
                        exampleText.style.color = '#555';
                        listItem.appendChild(exampleText);
                    }

                    defsList.appendChild(listItem);
                });

                meaningDiv.appendChild(defsList);

                const synonymsText = document.createElement('p');
                if (meaning.synonyms && meaning.synonyms.length > 0) {
                    synonymsText.textContent = 'Synonyms: ' + meaning.synonyms.join(', ');
                } else {
                    synonymsText.textContent = 'Synonyms: None available';
                }
                meaningDiv.appendChild(synonymsText);

                definitionsContainer.appendChild(meaningDiv);
            });
        })
        .catch(function (error) {
            statusMessage.textContent = error.message
            wordTitle.textContent = '';
            phoneticText.textContent = ''
            definitionsContainer.innerHTML = '';
            audioBtn.style.display = 'none';
            favoriteBtn.style.display = 'none';
            currentAudio = null;
            currentSearchedWord = '';
        })
})

favoriteBtn.addEventListener('click', function () {
    if (!currentSearchedWord) return;

    if (!favorites.includes(currentSearchedWord)) {
        favorites.push(currentSearchedWord);
        favoriteBtn.textContent = 'Saved in Favorites';
        renderFavorites();
    }
});

function renderFavorites() {
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'No saved words yet.';
        favoritesList.appendChild(emptyItem);
        return;
    }

    favorites.forEach(function (word) {
        const li = document.createElement('li');
        li.textContent = word;
        li.classList.add('saved-word');
        favoritesList.appendChild(li);
    });
}
