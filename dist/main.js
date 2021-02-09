let spanSpeech;
const wordsArr = [],
spinner = document.getElementById('spinner'),
filename = document.getElementsByTagName('h4')[0],
file = document.getElementById('file'),
btnFile = document.getElementById('btn_file'),
divSpeechRes = document.getElementById('div_speech_res'),
audioFile = document.getElementById('audio_file');

const timeUpdate = function(){
    const current = audioFile.currentTime;
    for (let i=0; i<wordsArr.length; i++) {
        if  (current >= wordsArr[i].min && current <= wordsArr[i].max) {
            if (!spanSpeech[i].classList.contains('currentText')) {
                spanSpeech.forEach(s => s.classList.remove('currentText'));
                spanSpeech[i].classList.add('currentText');
                break;
            }
        }
    }
}

audioFile.addEventListener('timeupdate', timeUpdate);

file.addEventListener('change', async function(){
    this.setAttribute('disabled', true);
    btnFile.setAttribute('disabled', true);
    spinner.style.display = 'block';
    wordsArr.splice(0, wordsArr.length);
    divSpeechRes.innerText = '';
    filename.innerText = 'No file selected.';
    audioFile.style.display = 'none';

    const blob = window.URL || window.webkitURL;
    if (blob) {
        const file = this.files[0];
        filename.innerText = file.name;
        let res;

        try {
            const formData = new FormData();
            formData.append('file', file);
            const r = await fetch('/speech', {
                method: "POST",
                body: formData
            });
            res = await r.json();
        }
        catch(e) {
            alert (e.message);
        }
        finally {
            if (res && res.transcript) {
                for (let i=0; i<res.timestamps.length; i++) {
                    const dataSpan = document.createElement('span');
                    dataSpan.innerText = res.timestamps[i][0];
                    wordsArr[i] = {text: res.timestamps[i][0], min: res.timestamps[i][1], max: res.timestamps[i][2]};
                    dataSpan.id = `speech${i}`;
                    dataSpan.className = 'span_speech';
                    divSpeechRes.appendChild(dataSpan);
                }
                spanSpeech = document.querySelectorAll('.span_speech');
                audioFile.style.display = 'block';
                audioFile.src = blob.createObjectURL(file);
            }
            else
                alert('Error: Unable to process file!');

            spinner.style.display = 'none';
            this.removeAttribute('disabled');
            btnFile.removeAttribute('disabled');
        }
    }
    else
        alert ('Unsupported Browser!');
});