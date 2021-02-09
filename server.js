require('dotenv').config();
const express = require('express');
multer = require('multer'),
path = require('path'),
axios = require('axios'),
UPLOAD_FOLDER = './tmp';
fs = require('fs');
app = express(),
PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

const getFileType = function(extension) {
    let fileType;
    switch (extension) {
        case 'alaw':
            fileType = 'audio/alaw';
            break;

        case 'au':
        case 'snd':
            fileType = 'audio/basic';
            break;

        case 'flac':
            fileType = 'audio/flac';
            break;

        case 'l16':
            fileType = 'audio/l16';
            break;

        case 'mp3':
            fileType = 'audio/mp3';
            break;

        case 'mpga':
        case 'mp2':
        case 'm2a':
        case 'm3a':
        case 'mp2a':
            fileType = 'audio/mpeg';
            break;

        case 'mulaw':
            fileType = 'audio/mulaw';
            break;

        case 'ogg':
        case 'oga':
        case 'spx':
            fileType = 'audio/ogg';
            break;

        case 'wav':
            fileType = 'audio/wav';
            break;

        case 'webm':
        case 'weba':
            fileType = 'audio/webm';
            break;

        default:
    }

    return fileType;
};

if (!fs.existsSync(UPLOAD_FOLDER))
    fs.mkdirSync(UPLOAD_FOLDER);

// CONFIGURE FOR MULTER
//
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, UPLOAD_FOLDER);
    },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
// const memoryStorage = multer.memoryStorage({
//     destination: function(req, file, callback) {
//         callback(null, "");
//     }
// });
//
// END OF CONFIGURE FOR MULTER

const upload = multer({
    storage: storage,
    limits: {
        files: 1,
        fieldSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(alaw|au|snd|flac|l16|mp3|mpga|mp2|m2a|m3a|mp2a|mulaw|ogg|oga|spx|wav|webm|weba)$/))
            return cb(new Error('Unsupported File Format.'), false);

        cb(null, true);
    }
});

app.post('/speech', upload.single('file'), async(req, res) => {
    try {
        const filename = req.file.originalname;
        const file = fs.readFileSync(`${UPLOAD_FOLDER}/${filename}`);
        fs.unlinkSync(`${UPLOAD_FOLDER}/${filename}`);

        if (!file)
            throw new Error('Invalid File!');

        const extension = filename.split('.').pop();
        let fileType = getFileType(extension);
        if (!fileType)
            throw new Error('Unsupported File-Type!');

        const r = await axios.post(process.env.SPEECH_URL, file, {
            headers: {
                'Content-Type': fileType
            },
            auth: {
                'username': process.env.SPEECH_USER,
                'password': process.env.SPEECH_PASS
            }
        })
        res.send(r.data.results[0].alternatives[0]);
    }
    catch(e) {
        res.status(500).json({
            status: false,
            error: e.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port: ${PORT}`);
});