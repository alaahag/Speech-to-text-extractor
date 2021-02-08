require('dotenv').config();
const express = require('express');
multer = require('multer'),
path = require('path'),
axios = require('axios'),
app = express(),
PORT = process.env.PORT || 3000;

//app.use(express.urlencoded({ extended: false }));
//app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'node_modules')));

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


// configure multer
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, `./${FILE_PATH}`);
//     },
//     filename: function (req, file, cb) {
//         cb(null , file.originalname);
//     }
// });

const memoryStorage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, "");
    }
});

const upload = multer({
    storage: memoryStorage,
    limits: {
        files: 1, // allow up to 5 files per request,
        fieldSize: 5 * 1024 * 1024 // 5 MB (max file size)
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(alaw|au|snd|flac|l16|mp3|mpga|mp2|m2a|m3a|mp2a|mulaw|ogg|oga|spx|wav|webm|weba)$/))
            return cb(new Error('Unsupported File Format.'), false);

        cb(null, true);
    }
});

app.post('/speech', upload.single('file'), async(req, res) => {
    try {
        const file = req.file;
        if (!file)
            throw new Error('Invalid File!');

        const extension = file.originalname.split('.').pop();
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
        console.log(e);
        res.status(500).json({
            status: false,
            error: e.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port: ${PORT}`);
});
