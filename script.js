// Credentials
const API_KEY = '' // INSERT YOUR GOOGLE API KEY HERE
const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`

// If there's no API key, stop script execution
if (!API_KEY) {
  const errorMessage = 'Please, provide your google API key on the script.js file.'

  alert(errorMessage)
  throw new Error(errorMessage);
}

// Get char count of string
const getCharCount = (str) => {
  const charCount = str.split('').length
  return charCount
}

// Copy translation to clipboard
const copyToClipboard = async (copyButton) => {
  const { boxKey } = copyButton.dataset
  const translatedBox = document.querySelector(`#key-${boxKey}`)
  const text = translatedBox.querySelector('p').innerText

  await navigator.clipboard.writeText(text)
}

// Get languages from json file
let languages = []

const getLanguages = async () => {
  const response = await fetch('/languages.json')
  const availableLanguages = await response.json()

  languages = availableLanguages
}

getLanguages()

// Call translate API and get translation to one language
const getTranslation = async ({ text, langCode }) => {
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({ q: text, target: langCode })
  })

  const responseJson = await response.json()
  const { data } = responseJson
  const { translatedText } = data.translations[0]

  return translatedText
}

// Dom manipulation
const form = document.querySelector('.input-form')
const inputFrom = document.querySelector('.input-from')
const charCountEle = document.querySelector('.char-count')
const translatedList = document.querySelector('.translated-list')

// Update input char count
inputFrom.addEventListener('input', (e) => {
  const { value } = e.target
  const charCount = getCharCount(value)

  if (charCount === 100) {
    charCountEle.classList.add('max')
  } else {
    charCountEle.classList.remove('max')
  }

  charCountEle.innerText = `${charCount}/100`
})

// Create translated box element
const createTranslatedBox = ({ language, translation, key }) => {
  const charCount = getCharCount(translation)

  return `
    <article class="translated-box" id="key-${key}">
      <header>
        <h3 class="language">${language}</h3>
        <button class="clipboard-copy" data-box-key="${key}" onclick="copyToClipboard(this)">
          copy translation
        </button>
      </header>

      <p class="translated-text ${charCount > 100 ? 'exceed' : ''}">
        ${translation}
      </p>
    </article>
  `
}

// Get translations and put translation boxes on screen
const processTranslations = async (text) => {
  const { length } = languages

  for (let i = 0; i < length; i++) {
    const { language, code } = languages[i]

    const translatedText = await getTranslation({ text, langCode: code })

    const translatedBoxEle = createTranslatedBox({ 
      language, 
      translation: translatedText,
      key: i
    })

    translatedList.insertAdjacentHTML('beforeend', translatedBoxEle)
  }
}

// Handle input submit
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const { value } = inputFrom

  translatedList.innerHTML = ''
  await processTranslations(value)
})