const EXAMPLE_TEXT = "こんにちは。わたしはいつもあさごはんをたべてからがっこうへいきます。ひるやすみにはともだちといっしょにおべんとうをたべます。よるはほんをよんだり、えをかいたりします。";
var text_pool = [];
var current_text = '';
var position = 0;
var mistakes = 0;
var error_animation_playing = false;

/* HTML Elemente */
var long_prev_text;
var prev_letter;
var current_letter;
var next_letter;
var long_next_text;
var letter_input;
var text_progress;
var text_mistakes;
var text_author;

var sound_error;
var sound_finish;

function render_infobar() {
    text_progress.innerText = `${position+1} / ${current_text.length}`;
    text_mistakes.innerText = `${mistakes} Mistakes`;
}

function render_text() {
    render_infobar();

    if (position < 1) { position = 0; } /* Keine Ahnung wie das passieren sollte, aber sicherlich wird das doch irgendwie passieren */
    
    if (position < 2) { long_prev_text.innerText = '';}
    else { long_prev_text.innerText = current_text.slice(Math.max(position-12, 0), position-1).join(""); }
    
    if (position < 1) { prev_letter.innerText = ''; }
    else { prev_letter.innerText = current_text[position-1]; }

    if (position >= current_text.length) {
        position = current_letter.innerText = '';
        position = 0;
        set_random_text();
        sound_finish.play();
        /* Trigger win animation please */ }
    else { current_letter.innerText = current_text[position]; }

    if (position+1 >= current_text.length) { next_letter.innerText = ''; }
    else { next_letter.innerText = current_text[position+1]; }
    
    if (position+2 >= current_text.length) { long_next_text.innerText = ''; }
    else { long_next_text.innerText = current_text.slice(position+2, Math.min(current_text.length, position+12)).join(""); }

}

function proceed_in_text() {
    position += 1;
    render_text();
}

function apply_text(text, author=null) {
    current_text = Array.from(text);
    position = 0;
    mistakes = 0;

    if (current_letter.length < 10) {
        console.error('Text too short');
    }

    render_text();

    if (author) {
    author = author.replace('\r','');
        if (author === '\\N') {
            author = 'an unknown contributer';
        }
        text_author.innerText = author;
    }
}

function set_random_text() {
    var index = Math.floor(Math.random() * text_pool.length);
    apply_text(text_pool[index].split(',')[0], author=text_pool[index].split(',')[1]);
}

function hiragana_compare(char1, char2) {
    const baseHiraganaMap = {
      "が": "か", "ぎ": "き", "ぐ": "く", "げ": "け", "ご": "こ",
      "ざ": "さ", "じ": "し", "ず": "す", "ぜ": "せ", "ぞ": "そ",
      "だ": "た", "ぢ": "ち", "づ": "つ", "で": "て", "ど": "と",
      "ば": "は", "び": "ひ", "ぶ": "ふ", "べ": "へ", "ぼ": "ほ",
      "ぱ": "は", "ぴ": "ひ", "ぷ": "ふ", "ぺ": "へ", "ぽ": "ほ"
    };
  
    const normalize = char => baseHiraganaMap[char] || char;
  
    return normalize(char1) === normalize(char2);
}

function has_dakuten_or_handakuten(char) {
    const dakutenHiragana = [
        "が", "ぎ", "ぐ", "げ", "ご",
        "ざ", "じ", "ず", "ぜ", "ぞ",
        "だ", "ぢ", "づ", "で", "ど",
        "ば", "び", "ぶ", "べ", "ぼ",
        "ぱ", "ぴ", "ぷ", "ぺ", "ぽ"
    ];
    
    return dakutenHiragana.includes(char);
}

async function load_sentences(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error loading the file: ${response.statusText}`);
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        return lines;
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', (e) => {
    long_prev_text = document.getElementById('long_prev_text');
    prev_letter    = document.getElementById('prev_letter');
    current_letter = document.getElementById('current_letter');
    next_letter    = document.getElementById('next_letter');
    long_next_text = document.getElementById('long_next_text');
    letter_input   = document.getElementById('letter_input');
    text_progress  = document.getElementById('text_progress');
    text_mistakes  = document.getElementById('text_mistakes');
    text_author    = document.getElementById('sentence_author');

    sound_error = document.getElementById('sound_error');
    sound_finish = document.getElementById('sound_finish');

    letter_input.addEventListener('input', (e) => {
        /* Proceed */
        if (letter_input.value == current_text[position]) {
            letter_input.value = '';
            proceed_in_text();
        }

        /* Clear on Error */
        if (letter_input.value == '') { return }
        if (hiragana_compare(letter_input.value, current_text[position])) {
            if (!has_dakuten_or_handakuten(letter_input.value)) { return; }
        }

        letter_input.value = '';
        if (!error_animation_playing) {
            error_animation_playing = true;
            document.body.classList.add('error');
            sound_error.play();
        }
        setTimeout(function () {
            document.body.classList.remove('error');
            error_animation_playing = false;
        }, 1000);
        mistakes += 1;
        render_infobar();
    });

    letter_input.addEventListener('blur', () => {
        console.log('hey');
        setTimeout(() => {
            if (document.hasFocus()) {
              letter_input.focus();
            }
          }, 0);
    });

    load_sentences('assets/sentences.txt').then(lines => {
        text_pool = lines;
        console.log(lines);
        set_random_text();
        letter_input.focus();
    });
});
