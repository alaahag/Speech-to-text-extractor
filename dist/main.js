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
            //res = await axios.post('/speech', formData);
            res = await fetch('/speech', {
                method: "POST",
                body: formData,
                'Content-Type': 'multipart/form-data'
            });
        }
        catch(e) {
            alert (e.message);
        }
        finally {
            if (res && res.status === 200) {
                const data = res.data.results[0].alternatives[0];
                for (let i=0; i<data.timestamps.length; i++) {
                    const dataSpan = document.createElement('span');
                    dataSpan.innerText = data.timestamps[i][0];
                    wordsArr[i] = {text: data.timestamps[i][0], min: data.timestamps[i][1], max:data.timestamps[i][2]};
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